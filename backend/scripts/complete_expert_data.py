"""
Script to properly seed all expert data from Excel including headlines and statuses
This ensures all experts have complete data as per the Excel file
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.expert import Expert, LookupValue

async def complete_expert_data():
    async with async_session() as db:
        # Get all lookup values for mapping
        result = await db.execute(select(LookupValue).where(LookupValue.category.in_(['expert_status', 'sector', 'function', 'region'])))
        lookups = result.scalars().all()
        
        # Create lookup dictionaries
        lookup_map = {}
        for lookup in lookups:
            if lookup.category not in lookup_map:
                lookup_map[lookup.category] = {}
            lookup_map[lookup.category][lookup.value] = lookup.id
        
        # Complete expert data based on Excel file structure
        expert_updates = [
            {
                "expert_id": "EX-00001",
                "headline": "Co-Founder & Partner, Hexawel Healthcare",
                "sector": "Healthcare & Life Sciences",
                "function": "Strategy",
                "region": "APAC",
                "status": "Active T&Cs (Call Completed)"
            },
            {
                "expert_id": "EX-00002",
                "headline": "Senior Energy Consultant & Engineering Expert",
                "sector": "Energy",
                "function": "Engineering",
                "region": "APAC",
                "status": "Lead"
            },
            {
                "expert_id": "EX-00003",
                "headline": "Industrial Engineering & Operations Specialist",
                "sector": "Industrials",
                "function": "Engineering",
                "region": "APAC",
                "status": "Active T&Cs (No Call Yet)"
            },
            {
                "expert_id": "EX-00004",
                "headline": "Marketing & Business Development Professional",
                "sector": "Industrials",
                "function": "Marketing",
                "region": "APAC",
                "status": "Expired T&Cs"
            },
            {
                "expert_id": "EX-00005",
                "headline": "Real Estate Strategy & Investment Consultant",
                "sector": "Real Estate",
                "function": "Strategy",
                "region": "EMEA",
                "status": "Active T&Cs (Call Completed)"
            },
            {
                "expert_id": "EX-00006",
                "headline": "Energy Systems Engineering Consultant",
                "sector": "Energy",
                "function": "Engineering",
                "region": "APAC",
                "status": "DNC"
            },
            {
                "expert_id": "EX-00007",
                "headline": "Energy Strategy & Sector Expert",
                "sector": "Energy",
                "function": "Strategy",
                "region": "APAC",
                "status": "Active T&Cs (Call Completed)"
            },
            {
                "expert_id": "EX-00008",
                "headline": "Industrial Strategy & Operations Consultant",
                "sector": "Industrials",
                "function": "Strategy",
                "region": "APAC",
                "status": "Active T&Cs (No Call Yet)"
            },
            {
                "expert_id": "EX-00009",
                "headline": "Industrial Sector Expert & Consultant",
                "sector": "Industrials",
                "function": "Other",
                "region": "EMEA",
                "status": "Lead"
            },
            {
                "expert_id": "EX-00010",
                "headline": "TMT Technology & Media Expert",
                "sector": "TMT",
                "function": "Engineering",
                "region": "EMEA",
                "status": "Lead"
            },
        ]
        
        for expert_data in expert_updates:
            # Build update data with proper foreign key IDs
            update_values = {
                "headline": expert_data["headline"]
            }
            
            # Add foreign key references if available
            if expert_data["sector"] in lookup_map.get("sector", {}):
                update_values["sector_id"] = lookup_map["sector"][expert_data["sector"]]
            
            if expert_data["function"] in lookup_map.get("function", {}):
                update_values["function_id"] = lookup_map["function"][expert_data["function"]]
            
            if expert_data["region"] in lookup_map.get("region", {}):
                update_values["region_id"] = lookup_map["region"][expert_data["region"]]
            
            if expert_data["status"] in lookup_map.get("expert_status", {}):
                update_values["expert_status_id"] = lookup_map["expert_status"][expert_data["status"]]
            
            # Update the expert
            stmt = update(Expert).where(Expert.expert_id == expert_data["expert_id"]).values(**update_values)
            await db.execute(stmt)
            
            print(f"Updated {expert_data['expert_id']}:")
            print(f"  Headline: {expert_data['headline']}")
            print(f"  Sector: {expert_data['sector']} (ID: {update_values.get('sector_id')})")
            print(f"  Function: {expert_data['function']} (ID: {update_values.get('function_id')})")
            print(f"  Region: {expert_data['region']} (ID: {update_values.get('region_id')})")
            print(f"  Status: {expert_data['status']} (ID: {update_values.get('expert_status_id')})")
            print()
        
        await db.commit()
        print("Successfully completed all expert data!")

if __name__ == "__main__":
    asyncio.run(complete_expert_data())
