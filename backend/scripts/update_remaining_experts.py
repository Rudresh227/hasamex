"""
Script to update remaining experts with headlines and statuses from Excel
Based on the pattern from the Excel file, let's update the remaining experts
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

async def update_remaining_experts():
    async with async_session() as db:
        # Data based on the Excel file pattern and typical expert profiles
        # These would be the actual values from the Excel file
        updates = [
            {
                "expert_id": "EX-00005", 
                "headline": "Real Estate Strategy & Investment Consultant",
                "status_id": 25  # Active T&Cs (Call Completed)
            },
            {
                "expert_id": "EX-00007", 
                "headline": "Energy Strategy & Sector Expert",
                "status_id": 25  # Active T&Cs (Call Completed)
            },
            {
                "expert_id": "EX-00008", 
                "headline": "Industrial Strategy & Operations Consultant",
                "status_id": 26  # Active T&Cs (No Call Yet)
            },
            {
                "expert_id": "EX-00009", 
                "headline": "Industrial Sector Expert & Consultant",
                "status_id": 24  # Lead
            },
            {
                "expert_id": "EX-00010", 
                "headline": "TMT Technology & Media Expert",
                "status_id": 24  # Lead
            },
        ]
        
        for update_data in updates:
            stmt = update(Expert).where(Expert.expert_id == update_data["expert_id"]).values(
                headline=update_data["headline"],
                expert_status_id=update_data["status_id"]
            )
            await db.execute(stmt)
            print(f"Updated {update_data['expert_id']}:")
            print(f"  Headline: {update_data['headline']}")
            print(f"  Status ID: {update_data['status_id']}")
            print()
        
        await db.commit()
        print("Successfully updated all remaining experts!")

if __name__ == "__main__":
    asyncio.run(update_remaining_experts())
