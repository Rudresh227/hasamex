from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from app.database import get_db
from app.schemas.expert import Expert, ExpertCreate, ExpertUpdate, ExpertListResponse, ExpertFileCreate
from app.services.expert_service import ExpertService
from app.services.file_upload_service import file_upload_service

router = APIRouter()

@router.get("/", response_model=ExpertListResponse)
async def list_experts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    sector_id: Optional[int] = None,
    sector: Optional[str] = None,
    region_id: Optional[int] = None,
    status_id: Optional[int] = None,
    employment_status_id: Optional[int] = None,
    function_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    return await ExpertService.get_experts(db, skip, limit, search, sector_id, sector, region_id, status_id, employment_status_id, function_id)

@router.post("/", response_model=Expert, status_code=status.HTTP_201_CREATED)
async def create_expert(expert_in: ExpertCreate, db: AsyncSession = Depends(get_db)):
    return await ExpertService.create_expert(db, expert_in)

@router.get("/{expert_id}", response_model=Expert)
async def get_expert(expert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    expert = await ExpertService.get_expert(db, expert_id)
    if not expert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found")
    return expert

@router.patch("/{expert_id}", response_model=Expert)
async def update_expert(expert_id: uuid.UUID, expert_in: ExpertUpdate, db: AsyncSession = Depends(get_db)):
    # Check for duplicates if email or linkedin updated
    if expert_in.primary_email or expert_in.linkedin_url:
        # We need the current expert data to check against
        current_expert = await ExpertService.get_expert(db, expert_id)
        if not current_expert:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found")
            
        email = expert_in.primary_email or current_expert.primary_email
        linkedin = str(expert_in.linkedin_url) if expert_in.linkedin_url else current_expert.linkedin_url
        
        conflicts = await ExpertService.check_duplicates(db, email=email, linkedin=linkedin, exclude_id=expert_id)
        if conflicts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "Update would create a duplicate",
                    "conflicts": [{"id": str(e.id), "name": f"{e.first_name} {e.last_name}"} for e in conflicts]
                }
            )
            
    expert = await ExpertService.update_expert(db, expert_id, expert_in)
    if not expert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found")
    return expert

@router.delete("/{expert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expert(expert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    success = await ExpertService.delete_expert(db, expert_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found")
    return None


# ── File Upload Endpoints ──

@router.post("/{expert_id}/files/upload-url")
async def get_file_upload_url(
    expert_id: uuid.UUID,
    filename: str = Body(...),
    content_type: str = Body("application/pdf"),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a presigned URL for uploading a file directly to MinIO/S3.
    The client uploads the file to the returned URL, then calls confirm-upload.
    """
    # Verify expert exists
    expert = await ExpertService.get_expert(db, expert_id)
    if not expert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found")
    
    # Generate presigned upload URL
    upload_data = file_upload_service.generate_upload_url(
        expert_id=expert_id,
        filename=filename,
        content_type=content_type
    )
    
    return {
        "upload_url": upload_data["upload_url"],
        "s3_key": upload_data["s3_key"],
        "file_id": upload_data["file_id"],
        "expires_in": 300  # 5 minutes
    }


@router.post("/{expert_id}/files/confirm")
async def confirm_file_upload(
    expert_id: uuid.UUID,
    file_data: ExpertFileCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Confirm a file upload after the client has successfully uploaded to MinIO.
    This creates the database record for the file.
    """
    from app.services.expert_service import ExpertService
    
    # Verify expert exists
    expert = await ExpertService.get_expert(db, expert_id)
    if not expert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert not found")
    
    # Get file metadata from S3
    metadata = file_upload_service.get_file_metadata(file_data.s3_key)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="File not found in storage. Upload may have failed."
        )
    
    # Update file size from actual metadata
    file_size_kb = metadata.get('size', 0) // 1024
    
    # Add file to expert
    expert_file = await ExpertService.add_expert_file(
        db, 
        expert_id=expert_id,
        s3_key=file_data.s3_key,
        filename=file_data.filename,
        file_size_kb=file_size_kb,
        mime_type=file_data.mime_type,
        is_primary=file_data.is_primary
    )
    
    return expert_file


@router.get("/{expert_id}/files/{file_id}/download")
async def get_file_download_url(
    expert_id: uuid.UUID,
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Generate a presigned URL for downloading a file"""
    # Get file details from database
    expert_file = await ExpertService.get_expert_file(db, file_id)
    if not expert_file or expert_file.expert_id != expert_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    
    # Generate download URL
    download_url = file_upload_service.generate_download_url(
        s3_key=expert_file.s3_key,
        filename=expert_file.filename
    )
    
    return {"download_url": download_url, "filename": expert_file.filename}


@router.delete("/{expert_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expert_file(
    expert_id: uuid.UUID,
    file_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete a file from both database and MinIO storage"""
    # Get file details before deletion
    expert_file = await ExpertService.get_expert_file(db, file_id)
    if not expert_file or expert_file.expert_id != expert_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    
    # Delete from S3/MinIO
    file_upload_service.delete_file(expert_file.s3_key)
    
    # Delete from database
    await ExpertService.delete_expert_file(db, file_id)
    
    return None
