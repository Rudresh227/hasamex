import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.expert import LookupValue

LOOKUP_DATA = [
    # Sectors (Primary Sector from Excel)
    {"category": "SECTOR", "value": "TMT", "sort_order": 1},
    {"category": "SECTOR", "value": "Energy", "sort_order": 2},
    {"category": "SECTOR", "value": "Industrials", "sort_order": 3},
    {"category": "SECTOR", "value": "Consumer", "sort_order": 4},
    {"category": "SECTOR", "value": "Financials", "sort_order": 5},
    {"category": "SECTOR", "value": "Healthcare & Life Sciences", "sort_order": 6},
    {"category": "SECTOR", "value": "Pharma & Biotech", "sort_order": 7},
    {"category": "SECTOR", "value": "Education", "sort_order": 8},
    {"category": "SECTOR", "value": "Real Estate", "sort_order": 9},
    {"category": "SECTOR", "value": "Materials", "sort_order": 10},
    {"category": "SECTOR", "value": "Utilities", "sort_order": 11},
    
    # Regions
    {"category": "REGION", "value": "Americas", "sort_order": 1},
    {"category": "REGION", "value": "EMEA", "sort_order": 2},
    {"category": "REGION", "value": "APAC", "sort_order": 3},
    
    # Expert Status
    {"category": "STATUS", "value": "Lead", "sort_order": 1},
    {"category": "STATUS", "value": "Active T&Cs (Call Completed)", "sort_order": 2},
    {"category": "STATUS", "value": "Active T&Cs (No Call Yet)", "sort_order": 3},
    {"category": "STATUS", "value": "Expired T&Cs", "sort_order": 4},
    {"category": "STATUS", "value": "DNC", "sort_order": 5},
    
    # Employment Status (from Excel Dropdowns)
    {"category": "EMPLOYMENT_STATUS", "value": "Currently Employed", "sort_order": 1},
    {"category": "EMPLOYMENT_STATUS", "value": "Independent", "sort_order": 2},
    {"category": "EMPLOYMENT_STATUS", "value": "Retired", "sort_order": 3},
    {"category": "EMPLOYMENT_STATUS", "value": "Board Member", "sort_order": 4},
    
    # Seniority (from Excel Dropdowns)
    {"category": "SENIORITY", "value": "C-Level", "sort_order": 1},
    {"category": "SENIORITY", "value": "Founder", "sort_order": 2},
    {"category": "SENIORITY", "value": "Board", "sort_order": 3},
    {"category": "SENIORITY", "value": "SVP / EVP", "sort_order": 4},
    {"category": "SENIORITY", "value": "VP", "sort_order": 5},
    {"category": "SENIORITY", "value": "Director", "sort_order": 6},
    {"category": "SENIORITY", "value": "Head", "sort_order": 7},
    {"category": "SENIORITY", "value": "Senior Manager", "sort_order": 8},
    {"category": "SENIORITY", "value": "Manager", "sort_order": 9},
    {"category": "SENIORITY", "value": "Individual Contributor", "sort_order": 10},
    {"category": "SENIORITY", "value": "Consultant", "sort_order": 11},
    {"category": "SENIORITY", "value": "Academic", "sort_order": 12},
    
    # Company Role (from Excel Dropdowns)
    {"category": "COMPANY_ROLE", "value": "Raw Materials / Upstream", "sort_order": 1},
    {"category": "COMPANY_ROLE", "value": "Manufacturer / OEM", "sort_order": 2},
    {"category": "COMPANY_ROLE", "value": "Component Supplier", "sort_order": 3},
    {"category": "COMPANY_ROLE", "value": "Distributor / Channel", "sort_order": 4},
    {"category": "COMPANY_ROLE", "value": "Retail / End Market", "sort_order": 5},
    {"category": "COMPANY_ROLE", "value": "Service Provider", "sort_order": 6},
    {"category": "COMPANY_ROLE", "value": "Technology Provider", "sort_order": 7},
    {"category": "COMPANY_ROLE", "value": "Operator", "sort_order": 8},
    {"category": "COMPANY_ROLE", "value": "Investor", "sort_order": 9},
    {"category": "COMPANY_ROLE", "value": "Advisor / Consultant", "sort_order": 10},
    {"category": "COMPANY_ROLE", "value": "Regulator / Policy", "sort_order": 11},
    {"category": "COMPANY_ROLE", "value": "Board / Governance", "sort_order": 12},
    
    # Function (Expert Function from Excel)
    {"category": "FUNCTION", "value": "Strategy", "sort_order": 1},
    {"category": "FUNCTION", "value": "Operations", "sort_order": 2},
    {"category": "FUNCTION", "value": "Sales", "sort_order": 3},
    {"category": "FUNCTION", "value": "Marketing", "sort_order": 4},
    {"category": "FUNCTION", "value": "Finance", "sort_order": 5},
    {"category": "FUNCTION", "value": "Product", "sort_order": 6},
    {"category": "FUNCTION", "value": "Engineering", "sort_order": 7},
    {"category": "FUNCTION", "value": "Supply Chain", "sort_order": 8},
    {"category": "FUNCTION", "value": "Procurement", "sort_order": 9},
    {"category": "FUNCTION", "value": "Regulatory", "sort_order": 10},
    {"category": "FUNCTION", "value": "M&A", "sort_order": 11},
    {"category": "FUNCTION", "value": "Investments", "sort_order": 12},
    {"category": "FUNCTION", "value": "Manufacturing", "sort_order": 13},
    {"category": "FUNCTION", "value": "Board Governance", "sort_order": 14},
    {"category": "FUNCTION", "value": "Other", "sort_order": 15},
    
    # Currency (from Excel Dropdowns)
    {"category": "CURRENCY", "value": "USD", "sort_order": 1},
    {"category": "CURRENCY", "value": "INR", "sort_order": 2},
    {"category": "CURRENCY", "value": "EUR", "sort_order": 3},
    {"category": "CURRENCY", "value": "SGD", "sort_order": 4},
    {"category": "CURRENCY", "value": "GBP", "sort_order": 5},
    {"category": "CURRENCY", "value": "Other", "sort_order": 6},
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
