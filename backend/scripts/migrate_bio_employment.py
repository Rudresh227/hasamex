"""
Script to migrate Bio and Employment History from Excel to Database
"""
import asyncio
import pandas as pd
import re
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional
import uuid

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.expert import Expert, ExpertEmployment

EXCEL_PATH = r"c:\Users\user\OneDrive\Desktop\Rudresh\hasamex\Documents\Test Hasamex Expert Database (HEB).xlsx"


def parse_employment_history(emp_history_text: str) -> list[dict]:
    """
    Parse employment history text into structured records.
    Expected format: "Title, Company (Start–End)\nTitle, Company (Start–End)"
    """
    if pd.isna(emp_history_text) or not emp_history_text.strip():
        return []
    
    records = []
    lines = [line.strip() for line in str(emp_history_text).split('\n') if line.strip()]
    
    for line in lines:
        # Pattern: "Title, Company (Year–Year)" or "Title, Company (Year–Present)"
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
        else:
            # Try alternative pattern without comma: "Title at Company (Year–Year)"
            match2 = re.match(r'^(.*?)\s+at\s+(.+?)\s*\((\d{4})\s*[-–]\s*(\d{4}|Present)\)$', line, re.IGNORECASE)
            if match2:
                title = match2.group(1).strip()
                company = match2.group(2).strip()
                start_year = int(match2.group(3))
                end_year_str = match2.group(4)
                
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
            else:
                print(f"  Could not parse employment line: {line}")
    
    return records


async def migrate_expert_data():
    print("=" * 80)
    print("MIGRATING BIO AND EMPLOYMENT HISTORY FROM EXCEL")
    print("=" * 80)
    
    # Read Excel file
    df = pd.read_excel(EXCEL_PATH, sheet_name='Current DB')
    
    print(f"\nFound {len(df)} experts in Excel file")
    
    async with async_session() as db:
        # Get all existing experts from DB
        result = await db.execute(select(Expert.expert_id, Expert.id))
        expert_map = {row[0]: row[1] for row in result.fetchall()}
        
        print(f"Found {len(expert_map)} experts in database")
        
        # Track statistics
        bio_updated = 0
        employment_added = 0
        experts_processed = 0
        
        for idx, row in df.iterrows():
            expert_id = row.get('Expert ID')
            
            if pd.isna(expert_id) or expert_id not in expert_map:
                print(f"\n  Skipping row {idx + 1}: Expert ID '{expert_id}' not found in database")
                continue
            
            expert_uuid = expert_map[expert_id]
            experts_processed += 1
            
            print(f"\n[{experts_processed}] Processing {expert_id} - {row.get('First Name')} {row.get('Last Name')}")
            
            # Update BIO
            bio = row.get('BIO')
            if pd.notna(bio) and str(bio).strip():
                bio_text = str(bio).strip()
                stmt = update(Expert).where(Expert.id == expert_uuid).values(bio=bio_text)
                await db.execute(stmt)
                bio_updated += 1
                print(f"  ✓ Updated BIO ({len(bio_text)} chars)")
            else:
                print(f"  - No BIO data")
            
            # Parse and add Employment History
            emp_history = row.get('Employment History')
            if pd.notna(emp_history) and str(emp_history).strip():
                emp_records = parse_employment_history(str(emp_history))
                
                if emp_records:
                    # Clear existing employment history for this expert
                    await db.execute(
                        select(ExpertEmployment).where(ExpertEmployment.expert_id == expert_uuid)
                    )
                    
                    for i, emp in enumerate(emp_records):
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
                        employment_added += 1
                    
                    print(f"  ✓ Added {len(emp_records)} employment records")
                else:
                    print(f"  ! Could not parse employment history")
            else:
                print(f"  - No Employment History data")
        
        # Commit all changes
        await db.commit()
        
        print("\n" + "=" * 80)
        print("MIGRATION SUMMARY")
        print("=" * 80)
        print(f"Experts processed: {experts_processed}")
        print(f"BIOs updated: {bio_updated}")
        print(f"Employment records added: {employment_added}")
        print("\nMigration completed successfully!")


if __name__ == "__main__":
    asyncio.run(migrate_expert_data())
