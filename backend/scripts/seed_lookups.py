import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.expert import LookupValue

LOOKUP_DATA = [
    # Sectors
    {"category": "sector", "value": "Healthcare & Life Sciences", "sort_order": 1},
    {"category": "sector", "value": "Energy", "sort_order": 2},
    {"category": "sector", "value": "Industrials", "sort_order": 3},
    {"category": "sector", "value": "Real Estate", "sort_order": 4},
    {"category": "sector", "value": "TMT", "sort_order": 5},
    {"category": "sector", "value": "Consumer Goods", "sort_order": 6},
    {"category": "sector", "value": "Financial Services", "sort_order": 7},
    
    # Regions
    {"category": "region", "value": "APAC", "sort_order": 1},
    {"category": "region", "value": "EMEA", "sort_order": 2},
    {"category": "region", "value": "Americas", "sort_order": 3},
    {"category": "region", "value": "Global", "sort_order": 4},
    
    # Expert Status
    {"category": "expert_status", "value": "Active", "sort_order": 1},
    {"category": "expert_status", "value": "Inactive", "sort_order": 2},
    {"category": "expert_status", "value": "On Hold", "sort_order": 3},
    
    # Employment Status
    {"category": "employment_status", "value": "Employed", "sort_order": 1},
    {"category": "employment_status", "value": "Self-Employed", "sort_order": 2},
    {"category": "employment_status", "value": "Retired", "sort_order": 3},
    {"category": "employment_status", "value": "Unemployed", "sort_order": 4},

    # Function
    {"category": "function", "value": "Strategy", "sort_order": 1},
    {"category": "function", "value": "Engineering", "sort_order": 2},
    {"category": "function", "value": "Marketing", "sort_order": 3},
    {"category": "function", "value": "Operations", "sort_order": 4},
    {"category": "function", "value": "Other", "sort_order": 5},
]

async def seed_lookups():
    async with async_session() as db:
        for data in LOOKUP_DATA:
            # Simple check to avoid duplicates
            from sqlalchemy import select
            stmt = select(LookupValue).where(
                LookupValue.category == data["category"],
                LookupValue.value == data["value"]
            )
            result = await db.execute(stmt)
            if not result.scalar_one_or_none():
                db.add(LookupValue(**data))
        
        await db.commit()
        print("Lookup values seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_lookups())
