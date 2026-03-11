from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from app.database import get_db
from app.schemas.expert import Expert, ExpertCreate, ExpertUpdate
from app.services.expert_service import ExpertService

router = APIRouter()

@router.get("/", response_model=List[Expert])
async def list_experts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    sector_id: Optional[int] = None,
    region_id: Optional[int] = None,
    status_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    return await ExpertService.get_experts(db, skip, limit, search, sector_id, region_id, status_id)

@router.post("/", response_model=Expert, status_code=status.HTTP_201_CREATED)
async def create_expert(expert_in: ExpertCreate, db: AsyncSession = Depends(get_db)):
    # Check for duplicates
    conflicts = await ExpertService.check_duplicates(
        db, 
        email=expert_in.primary_email, 
        linkedin=str(expert_in.linkedin_url) if expert_in.linkedin_url else None
    )
    if conflicts:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "Duplicate expert detected",
                "conflicts": [{"id": str(e.id), "name": f"{e.first_name} {e.last_name}"} for e in conflicts]
            }
        )
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
