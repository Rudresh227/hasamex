from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.expert import LookupValue
from app.schemas.expert import LookupValue as LookupValueSchema

router = APIRouter()

@router.get("/{category}", response_model=List[LookupValueSchema])
async def get_lookups(category: str, db: AsyncSession = Depends(get_db)):
    query = select(LookupValue).where(
        LookupValue.category == category.upper(),
        LookupValue.is_active == True
    ).order_by(LookupValue.sort_order)
    
    result = await db.execute(query)
    return result.scalars().all()
