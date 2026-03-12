"""
Script to populate serial_number for existing experts
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.expert import Expert

async def populate_serial_numbers():
    async with async_session() as db:
        # Get all experts without serial numbers, ordered by created_at
        stmt = select(Expert).where(Expert.serial_number.is_(None)).order_by(Expert.created_at)
        result = await db.execute(stmt)
        experts = result.scalars().all()
        
        if not experts:
            print("No experts without serial numbers found.")
            return
        
        # Get the next available serial number
        max_serial_stmt = select(func.coalesce(func.max(Expert.serial_number), 0))
        max_result = await db.execute(max_serial_stmt)
        next_serial = max_result.scalar_one() + 1
        
        print(f"Found {len(experts)} experts without serial numbers.")
        print(f"Starting serial number assignment from: {next_serial}")
        
        # Assign serial numbers
        for expert in experts:
            expert.serial_number = next_serial
            next_serial += 1
            print(f"Assigned serial number {expert.serial_number} to expert {expert.expert_id} ({expert.first_name} {expert.last_name})")
        
        await db.commit()
        print(f"Successfully assigned serial numbers to {len(experts)} experts.")

if __name__ == "__main__":
    asyncio.run(populate_serial_numbers())
