from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from app.models.expert import Expert, ExpertEmployment, ExpertRate, ExpertProject
from app.schemas.expert import ExpertCreate, ExpertUpdate

class ExpertService:
    @staticmethod
    async def get_experts(
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100, 
        search: Optional[str] = None,
        sector_id: Optional[int] = None,
        region_id: Optional[int] = None,
        status_id: Optional[int] = None
    ) -> List[Expert]:
        query = select(Expert).where(Expert.is_deleted == False)
        
        if sector_id:
            query = query.where(Expert.sector_id == sector_id)
        if region_id:
            query = query.where(Expert.region_id == region_id)
        if status_id:
            query = query.where(Expert.expert_status_id == status_id)
            
        if search:
            # Simple search for now, will upgrade to full-text search later
            search_filter = or_(
                Expert.first_name.ilike(f"%{search}%"),
                Expert.last_name.ilike(f"%{search}%"),
                Expert.headline.ilike(f"%{search}%"),
                Expert.primary_email.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
            
        query = query.offset(skip).limit(limit).options(
            selectinload(Expert.employment_history),
            selectinload(Expert.rates),
            selectinload(Expert.projects),
            selectinload(Expert.files)
        )
        
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_expert(db: AsyncSession, expert_id: uuid.UUID) -> Optional[Expert]:
        query = select(Expert).where(Expert.id == expert_id, Expert.is_deleted == False).options(
            selectinload(Expert.employment_history),
            selectinload(Expert.rates),
            selectinload(Expert.projects),
            selectinload(Expert.files)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_expert(db: AsyncSession, expert_in: ExpertCreate) -> Expert:
        expert_data = expert_in.model_dump(exclude={"employment_history", "rates", "projects"})
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
        await db.refresh(db_expert)
        return db_expert

    @staticmethod
    async def update_expert(db: AsyncSession, expert_id: uuid.UUID, expert_in: ExpertUpdate) -> Optional[Expert]:
        db_expert = await ExpertService.get_expert(db, expert_id)
        if not db_expert:
            return None
            
        update_data = expert_in.model_dump(exclude_unset=True)
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
            
        db_expert.is_deleted = True
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
