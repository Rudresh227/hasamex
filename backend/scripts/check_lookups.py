import asyncio
import sys
sys.path.insert(0, '.')

from app.database import async_session
from app.models.expert import LookupValue
from sqlalchemy import select

async def check():
    async with async_session() as db:
        result = await db.execute(select(LookupValue))
        lookups = result.scalars().all()
        print('Categories:', sorted(set(l.category for l in lookups)))
        print('\nSENIORITY:', [l.value for l in lookups if l.category=='SENIORITY'])
        print('\nCOMPANY_ROLE:', [l.value for l in lookups if l.category=='COMPANY_ROLE'])

asyncio.run(check())
