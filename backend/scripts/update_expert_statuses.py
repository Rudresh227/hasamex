"""
Script to update expert status lookup values to match the Excel file
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.expert import LookupValue, Expert

async def update_expert_statuses():
    async with async_session() as db:
        # First, clear expert_status_id from all experts
        update_stmt = update(Expert).values(expert_status_id=None)
        await db.execute(update_stmt)
        print("Cleared expert_status_id from all experts")
        
        # Delete existing expert_status lookup values
        delete_stmt = delete(LookupValue).where(LookupValue.category == 'expert_status')
        await db.execute(delete_stmt)
        print("Deleted existing expert status lookup values")
        
        # New expert statuses from the Excel file
        new_statuses = [
            {"category": "expert_status", "value": "Lead", "sort_order": 1},
            {"category": "expert_status", "value": "Active T&Cs (Call Completed)", "sort_order": 2},
            {"category": "expert_status", "value": "Active T&Cs (No Call Yet)", "sort_order": 3},
            {"category": "expert_status", "value": "Expired T&Cs", "sort_order": 4},
            {"category": "expert_status", "value": "DNC", "sort_order": 5},
        ]
        
        # Add new statuses
        for status_data in new_statuses:
            db.add(LookupValue(**status_data))
            print(f"Added: {status_data['value']}")
        
        await db.commit()
        print("Successfully updated expert status lookup values!")
        
        # Show the new status IDs for reference
        result = await db.execute(select(LookupValue).where(LookupValue.category == 'expert_status').order_by(LookupValue.sort_order))
        statuses = result.scalars().all()
        print("\nNew Expert Status IDs:")
        for status in statuses:
            print(f"  ID: {status.id}, Value: {status.value}")

if __name__ == "__main__":
    asyncio.run(update_expert_statuses())
