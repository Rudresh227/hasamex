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
    {"category": "SECTOR", "value": "Healthcare & Life Sciences", "sort_order": 1},
    {"category": "SECTOR", "value": "Energy", "sort_order": 2},
    {"category": "SECTOR", "value": "Industrials", "sort_order": 3},
    {"category": "SECTOR", "value": "Real Estate", "sort_order": 4},
    {"category": "SECTOR", "value": "TMT", "sort_order": 5},
    {"category": "SECTOR", "value": "Consumer Goods", "sort_order": 6},
    {"category": "SECTOR", "value": "Financial Services", "sort_order": 7},
    
    # Regions
    {"category": "REGION", "value": "APAC", "sort_order": 1},
    {"category": "REGION", "value": "EMEA", "sort_order": 2},
    {"category": "REGION", "value": "Americas", "sort_order": 3},
    {"category": "REGION", "value": "Global", "sort_order": 4},
    
    # Expert Status
    {"category": "STATUS", "value": "Lead", "sort_order": 1},
    {"category": "STATUS", "value": "Active T&Cs (Call Completed)", "sort_order": 2},
    {"category": "STATUS", "value": "Active T&Cs (No Call Yet)", "sort_order": 3},
    {"category": "STATUS", "value": "Expired T&Cs", "sort_order": 4},
    {"category": "STATUS", "value": "DNC", "sort_order": 5},
    
    # Employment Status
    {"category": "EMPLOYMENT_STATUS", "value": "Employed", "sort_order": 1},
    {"category": "EMPLOYMENT_STATUS", "value": "Self-Employed", "sort_order": 2},
    {"category": "EMPLOYMENT_STATUS", "value": "Retired", "sort_order": 3},
    {"category": "EMPLOYMENT_STATUS", "value": "Unemployed", "sort_order": 4},

    # Function
    {"category": "FUNCTION", "value": "Strategy", "sort_order": 1},
    {"category": "FUNCTION", "value": "Engineering", "sort_order": 2},
    {"category": "FUNCTION", "value": "Marketing", "sort_order": 3},
    {"category": "FUNCTION", "value": "Operations", "sort_order": 4},
    {"category": "FUNCTION", "value": "Other", "sort_order": 5},
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
