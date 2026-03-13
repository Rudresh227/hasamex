"""
Script to restore deleted expert Mohammad Karbassian (EX-00009)
"""
import asyncio
import pandas as pd
import sys
import os
import uuid
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.expert import Expert, ExpertEmployment, LookupValue

EXCEL_PATH = r"c:\Users\user\OneDrive\Desktop\Rudresh\hasamex\Documents\Test Hasamex Expert Database (HEB).xlsx"


def parse_employment_history(emp_history_text: str) -> list[dict]:
    """Parse employment history text into structured records."""
    if pd.isna(emp_history_text) or not str(emp_history_text).strip():
        return []
    
    records = []
    # Split by newline and clean up bullet points
    lines = [line.strip().lstrip('•').strip() for line in str(emp_history_text).split('\n') if line.strip()]
    
    for line in lines:
        # Pattern: "Title, Company (Year-Year)" or "Title, Company (Year-Present)"
        match = re.match(r'^(.*?),\s*(.+?)\s*\((\d{4})\s*[-–]\s*(\d{4}|Present)\)$', line)
        
        if match:
            title = match.group(1).strip()
            company = match.group(2).strip()
            start_year = int(match.group(3))
            end_year_str = match.group(4)
            
            is_current = end_year_str.lower() == 'present'
            end_year = None if is_current else int(end_year_str)
            
            records.append({
                'title': title,
                'company': company,
                'start_year': start_year,
                'end_year': end_year,
                'is_current': is_current,
                'description': None
            })
    
    return records


async def get_lookup_id(db: AsyncSession, category: str, value: str) -> int | None:
    """Get lookup value ID by category and value."""
    if not value or pd.isna(value):
        return None
    
    result = await db.execute(
        select(LookupValue).where(
            LookupValue.category == category,
            LookupValue.value == str(value),
            LookupValue.is_active == True
        )
    )
    lookup = result.scalar_one_or_none()
    return lookup.id if lookup else None


async def restore_mohammad():
    print("=" * 80)
    print("RESTORING EXPERT: Mohammad Karbassian (EX-00009)")
    print("=" * 80)
    
    # Read Excel file
    df = pd.read_excel(EXCEL_PATH, sheet_name='Current DB')
    
    # Find Mohammad's row
    mohammad_row = df[df['First Name'].str.contains('Mohammad', case=False, na=False)]
    
    if mohammad_row.empty:
        print("ERROR: Mohammad not found in Excel file!")
        return
    
    row = mohammad_row.iloc[0]
    
    async with async_session() as db:
        # Check if EX-00009 already exists
        result = await db.execute(select(Expert).where(Expert.expert_id == "EX-00009"))
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"Expert EX-00009 already exists (ID: {existing.id})")
            return
        
        # Get lookup IDs
        region_id = await get_lookup_id(db, "Region", row.get('Region'))
        emp_status_id = await get_lookup_id(db, "Employment Status", row.get('Current Employment Status'))
        sector_id = await get_lookup_id(db, "Sector", row.get('Primary Sector'))
        function_id = await get_lookup_id(db, "Function", row.get('Expert Function'))
        expert_status_id = await get_lookup_id(db, "Expert Status", row.get('Expert Status'))
        
        # Create expert
        expert_uuid = uuid.uuid4()
        expert = Expert(
            id=expert_uuid,
            serial_number=9,
            expert_id="EX-00009",
            salutation=str(row.get('Salutation')) if pd.notna(row.get('Salutation')) else None,
            first_name=str(row.get('First Name')),
            last_name=str(row.get('Last Name')),
            primary_email=str(row.get('Primary Email 1')),
            secondary_email=str(row.get('Secondary Email')) if pd.notna(row.get('Secondary Email')) else None,
            primary_phone=str(row.get('Primary Phone 1')) if pd.notna(row.get('Primary Phone 1')) else None,
            secondary_phone=str(row.get('Secondary Phone 1')) if pd.notna(row.get('Secondary Phone 1')) else None,
            linkedin_url=str(row.get('LinkedIn URL')) if pd.notna(row.get('LinkedIn URL')) else None,
            location=str(row.get('Location')) if pd.notna(row.get('Location')) else None,
            timezone=str(row.get('Timezone')) if pd.notna(row.get('Timezone')) else None,
            region_id=region_id,
            employment_status_id=emp_status_id,
            seniority=str(row.get('Seniority')) if pd.notna(row.get('Seniority')) else None,
            years_experience=int(row.get('Years of Experience')) if pd.notna(row.get('Years of Experience')) else None,
            headline=str(row.get('Title / Headline')) if pd.notna(row.get('Title / Headline')) else None,
            bio=str(row.get('BIO')) if pd.notna(row.get('BIO')) else None,
            strength_topics=str(row.get('Strength Topics')) if pd.notna(row.get('Strength Topics')) else None,
            sector_id=sector_id,
            company_role=str(row.get('Company Role')) if pd.notna(row.get('Company Role')) else None,
            function_id=function_id,
            hcms_class=str(row.get('HCMS Classification')) if pd.notna(row.get('HCMS Classification')) else None,
            expert_status_id=expert_status_id,
            payment_details=str(row.get('Payment Details')) if pd.notna(row.get('Payment Details')) else None,
            notes=str(row.get('Notes')) if pd.notna(row.get('Notes')) else None,
            events_invited=str(row.get('Events Invited To')) if pd.notna(row.get('Events Invited To')) else None,
            total_calls=int(row.get('Total Calls Completed')) if pd.notna(row.get('Total Calls Completed')) else 0,
            is_deleted=False
        )
        
        db.add(expert)
        await db.flush()  # Get the expert_id assigned
        
        print(f"✓ Created expert: {expert.first_name} {expert.last_name} (ID: {expert.id})")
        
        # Add employment history
        emp_history = parse_employment_history(str(row.get('Employment History')) if pd.notna(row.get('Employment History')) else "")
        
        if emp_history:
            for i, emp in enumerate(emp_history):
                employment = ExpertEmployment(
                    id=uuid.uuid4(),
                    expert_id=expert_uuid,
                    title=emp['title'],
                    company=emp['company'],
                    start_year=emp['start_year'],
                    end_year=emp['end_year'],
                    is_current=emp['is_current'],
                    description=emp['description'],
                    sort_order=i
                )
                db.add(employment)
            
            print(f"✓ Added {len(emp_history)} employment records")
        
        await db.commit()
        print("\n✓ Mohammad Karbassian successfully restored to database!")


if __name__ == "__main__":
    asyncio.run(restore_mohammad())
