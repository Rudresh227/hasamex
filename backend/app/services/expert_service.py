from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, join
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid
from fastapi import HTTPException
from fastapi import status

from app.models.expert import Expert, ExpertEmployment, ExpertRate, ExpertProject, LookupValue, ExpertFile
from app.schemas.expert import ExpertCreate, ExpertUpdate

class ExpertService:
    @staticmethod
    async def get_experts(
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100, 
        search: Optional[str] = None,
        sector_id: Optional[int] = None,
        sector_name: Optional[str] = None,
        region_id: Optional[int] = None,
        status_id: Optional[int] = None,
        employment_status_id: Optional[int] = None,
        function_id: Optional[int] = None
    ) -> dict:
        query = select(Expert).where(Expert.is_deleted == False)
        
        if sector_id:
            query = query.where(Expert.sector_id == sector_id)
        if sector_name:
            query = query.join(LookupValue, Expert.sector_id == LookupValue.id).where(
                LookupValue.value.ilike(f"%{sector_name}%")
            )
        if region_id:
            query = query.where(Expert.region_id == region_id)
        if status_id:
            query = query.where(Expert.expert_status_id == status_id)
        if employment_status_id:
            query = query.where(Expert.employment_status_id == employment_status_id)
        if function_id:
            query = query.where(Expert.function_id == function_id)
            
        if search:
            # Simple search for now, will upgrade to full-text search later
            search_filter = or_(
                Expert.first_name.ilike(f"%{search}%"),
                Expert.last_name.ilike(f"%{search}%"),
                Expert.headline.ilike(f"%{search}%"),
                Expert.primary_email.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
            
        # Get total count for pagination
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await db.execute(count_query)
        total = count_result.scalar_one()

        # Execute main query
        query = query.offset(skip).limit(limit).options(
            selectinload(Expert.employment_history),
            selectinload(Expert.rates),
            selectinload(Expert.projects),
            selectinload(Expert.files),
            selectinload(Expert.sector),
            selectinload(Expert.region),
            selectinload(Expert.status),
            selectinload(Expert.function),
            selectinload(Expert.employment_status),
            selectinload(Expert.seniority_lookup),
            selectinload(Expert.company_role_lookup)
        )
        
        result = await db.execute(query)
        items = result.scalars().all()
        
        return {
            "items": items,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    @staticmethod
    async def get_expert(db: AsyncSession, expert_id: uuid.UUID) -> Optional[Expert]:
        query = select(Expert).where(Expert.id == expert_id, Expert.is_deleted == False).options(
            selectinload(Expert.employment_history),
            selectinload(Expert.rates),
            selectinload(Expert.projects),
            selectinload(Expert.files),
            selectinload(Expert.sector),
            selectinload(Expert.region),
            selectinload(Expert.status),
            selectinload(Expert.function),
            selectinload(Expert.employment_status),
            selectinload(Expert.seniority_lookup),
            selectinload(Expert.company_role_lookup)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_expert(db: AsyncSession, expert_in: ExpertCreate) -> Expert:
        # Check for duplicates within the transaction
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
        
        expert_data = expert_in.model_dump(exclude={"employment_history", "rates", "projects"})
        
        # Auto-assign serial number if not provided
        if not expert_data.get('serial_number'):
            max_serial_stmt = select(func.coalesce(func.max(Expert.serial_number), 0))
            max_result = await db.execute(max_serial_stmt)
            next_serial = max_result.scalar_one() + 1
            expert_data['serial_number'] = next_serial
        
        db_expert = Expert(**expert_data)
        
        # Add employment history
        for emp in expert_in.employment_history:
            db_expert.employment_history.append(ExpertEmployment(**emp.model_dump()))
            
        # Add rates
        for rate in expert_in.rates:
            db_expert.rates.append(ExpertRate(**rate.model_dump()))
            
        # Add projects
        for project in expert_in.projects:
            db_expert.projects.append(ExpertProject(**project.model_dump()))
            
        db.add(db_expert)
        await db.commit()
        
        # Refresh with proper relationship loading
        await db.refresh(
            db_expert, 
            ["employment_history", "rates", "projects", "files", "sector", "region", "status", "function", "employment_status", "seniority_lookup", "company_role_lookup"]
        )
        return db_expert

    @staticmethod
    async def update_expert(db: AsyncSession, expert_id: uuid.UUID, expert_in: ExpertUpdate) -> Optional[Expert]:
        db_expert = await ExpertService.get_expert(db, expert_id)
        if not db_expert:
            return None
            
        update_data = expert_in.model_dump(exclude_unset=True)
        
        # Handle phone field specifically - ensure empty strings are treated as None for db
        if 'primary_phone' in update_data and update_data['primary_phone'] == '':
            update_data['primary_phone'] = None
            
        for field, value in update_data.items():
            setattr(db_expert, field, value)
            
        await db.commit()
        await db.refresh(db_expert)
        return db_expert

    @staticmethod
    async def delete_expert(db: AsyncSession, expert_id: uuid.UUID) -> bool:
        db_expert = await ExpertService.get_expert(db, expert_id)
        if not db_expert:
            return False
        
        await db.delete(db_expert)
        await db.commit()
        return True

    @staticmethod
    async def check_duplicates(db: AsyncSession, email: str, linkedin: Optional[str] = None, exclude_id: Optional[uuid.UUID] = None):
        query = select(Expert).where(
            or_(
                func.lower(Expert.primary_email) == email.lower(),
                (func.lower(Expert.linkedin_url) == linkedin.lower()) if linkedin else False
            )
        )
        if exclude_id:
            query = query.where(Expert.id != exclude_id)
            
        result = await db.execute(query)
        return result.scalars().all()

    # ── File Management Methods ──

    @staticmethod
    async def add_expert_file(
        db: AsyncSession,
        expert_id: uuid.UUID,
        s3_key: str,
        filename: str,
        file_size_kb: int,
        mime_type: str = "application/pdf",
        is_primary: bool = False
    ) -> ExpertFile:
        """Add a file record to an expert"""
        expert_file = ExpertFile(
            expert_id=expert_id,
            s3_key=s3_key,
            filename=filename,
            file_size_kb=file_size_kb,
            mime_type=mime_type,
            is_primary=is_primary
        )
        db.add(expert_file)
        await db.commit()
        await db.refresh(expert_file)
        return expert_file

    @staticmethod
    async def get_expert_file(db: AsyncSession, file_id: uuid.UUID) -> Optional[ExpertFile]:
        """Get a specific file by ID"""
        result = await db.execute(
            select(ExpertFile).where(ExpertFile.id == file_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def delete_expert_file(db: AsyncSession, file_id: uuid.UUID) -> bool:
        """Delete a file record from the database"""
        expert_file = await ExpertService.get_expert_file(db, file_id)
        if not expert_file:
            return False
        
        await db.delete(expert_file)
        await db.commit()
        return True
