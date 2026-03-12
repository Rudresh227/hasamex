"""
Script to update some experts with proper status and headline data
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

async def update_sample_experts():
    async with async_session() as db:
        # Get a few experts to update
        stmt = select(Expert).limit(5)
        result = await db.execute(stmt)
        experts = result.scalars().all()
        
        # Sample data for updates
        updates = [
            {"expert_id": "EX-00001", "headline": "Co-Founder & Partner, Hexawel Healthcare", "status_id": 12},  # Active
            {"expert_id": "EX-00002", "headline": "Senior Energy Consultant & Engineering Expert", "status_id": 12},  # Active
            {"expert_id": "EX-00003", "headline": "Industrial Engineering & Operations Specialist", "status_id": 13},  # Inactive
            {"expert_id": "EX-00004", "headline": "Marketing & Business Development Professional", "status_id": 14},  # On Hold
            {"expert_id": "EX-00006", "headline": "Energy Systems Engineering Consultant", "status_id": 12},  # Active
        ]
        
        for update_data in updates:
            stmt = update(Expert).where(Expert.expert_id == update_data["expert_id"]).values(
                headline=update_data["headline"],
                expert_status_id=update_data["status_id"]
            )
            await db.execute(stmt)
            print(f"Updated {update_data['expert_id']}: {update_data['headline']} (Status ID: {update_data['status_id']})")
        
        await db.commit()
        print("Successfully updated sample experts!")

if __name__ == "__main__":
    asyncio.run(update_sample_experts())
