import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from sqlalchemy import text

async def check_db_directly():
    async with async_session() as db:
        # Check raw data
        result = await db.execute(text('SELECT expert_id, headline, expert_status_id FROM experts LIMIT 5'))
        rows = result.fetchall()
        print('Raw database data:')
        for row in rows:
            print(f'  {row[0]} | Headline: {row[1]} | Status ID: {row[2]}')
        
        # Check available statuses
        result = await db.execute(text("SELECT * FROM lookup_values WHERE category = 'expert_status'"))
        statuses = result.fetchall()
        print('\nAvailable expert statuses:')
        for status in statuses:
            print(f'  ID: {status[0]}, Value: {status[2]}')

if __name__ == "__main__":
    asyncio.run(check_db_directly())
