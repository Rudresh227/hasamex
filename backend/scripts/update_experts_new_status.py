"""
Script to update some experts with the new status values
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.expert import Expert

async def update_experts_with_new_statuses():
    async with async_session() as db:
        # Update some experts with the new status values
        updates = [
            {"expert_id": "EX-00001", "status_id": 25},  # Active T&Cs (Call Completed)
            {"expert_id": "EX-00002", "status_id": 24},  # Lead
            {"expert_id": "EX-00003", "status_id": 26},  # Active T&Cs (No Call Yet)
            {"expert_id": "EX-00004", "status_id": 27},  # Expired T&Cs
            {"expert_id": "EX-00006", "status_id": 28},  # DNC
        ]
        
        for update_data in updates:
            stmt = update(Expert).where(Expert.expert_id == update_data["expert_id"]).values(
                expert_status_id=update_data["status_id"]
            )
            await db.execute(stmt)
            print(f"Updated {update_data['expert_id']} with status ID: {update_data['status_id']}")
        
        await db.commit()
        print("Successfully updated experts with new statuses!")

if __name__ == "__main__":
    asyncio.run(update_experts_with_new_statuses())
