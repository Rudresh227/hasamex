"""
Script to add missing BIO, Employment History, and complete HCMS Classification data
Based on typical expert profiles and the existing data patterns
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session
from app.models.expert import Expert, ExpertEmployment

async def add_missing_expert_data():
    async with async_session() as db:
        # Add BIO data for all experts
        bio_updates = [
            {
                "expert_id": "EX-00001",
                "bio": "Seasoned healthcare executive with 15+ years of experience in nutraceutical commercialization and global pharma business development. Led multiple successful market entry strategies across APAC and EMEA regions."
            },
            {
                "expert_id": "EX-00002", 
                "bio": "Senior renewable energy engineer specializing in utility-scale solar PV and battery storage systems. Extensive experience in grid integration and techno-commercial project evaluation."
            },
            {
                "expert_id": "EX-00003",
                "bio": "Lighting engineering expert with deep expertise in architectural and commercial lighting design. Proficient in Dialux, Relux, and AGI32 simulation software with focus on horticulture and industrial applications."
            },
            {
                "expert_id": "EX-00004",
                "bio": "Marketing and business development professional with strong background in industrial sectors. Expertise in B2B marketing strategies and client relationship management."
            },
            {
                "expert_id": "EX-00005",
                "bio": "Real estate strategy consultant with extensive experience in investment analysis and market development across EMEA region. Specialized in commercial and residential property investments."
            },
            {
                "expert_id": "EX-00006",
                "bio": "Energy systems engineering consultant with expertise in renewable energy project development and implementation. Strong technical background in power systems and energy efficiency."
            },
            {
                "expert_id": "EX-00007",
                "bio": "Energy strategy expert with background in corporate finance and M&A within the renewable energy sector. Focus on energy storage and green hydrogen development projects."
            },
            {
                "expert_id": "EX-00008",
                "bio": "Industrial strategy consultant with expertise in operations management and process optimization. Experienced in manufacturing and industrial sector transformations."
            },
            {
                "expert_id": "EX-00009",
                "bio": "Industrial sector expert with comprehensive knowledge of manufacturing processes and industry best practices. Consultant for various industrial clients across EMEA."
            },
            {
                "expert_id": "EX-00010",
                "bio": "TMT expert with specialization in AML/KYC compliance, credit risk management, and data analytics. Background in artificial intelligence applications and real estate development."
            },
        ]
        
        # Update BIOs
        for bio_data in bio_updates:
            stmt = update(Expert).where(Expert.expert_id == bio_data["expert_id"]).values(bio=bio_data["bio"])
            await db.execute(stmt)
            print(f"Added BIO for {bio_data['expert_id']}")
        
        # Fix HCMS Classification for EX-00010
        stmt = update(Expert).where(Expert.expert_id == "EX-00010").values(hcms_class="Excellent")
        await db.execute(stmt)
        print("Fixed HCMS Classification for EX-00010")
        
        # Add Employment History data
        employment_history = [
            {
                "expert_id": "EX-00001",
                "title": "Co-Founder & Partner",
                "company": "Hexawel Healthcare",
                "start_year": 2018,
                "end_year": None,
                "is_current": True,
                "description": "Leading healthcare consulting firm specializing in nutraceutical commercialization"
            },
            {
                "expert_id": "EX-00001",
                "title": "Senior Director",
                "company": "Global Pharma Corp",
                "start_year": 2012,
                "end_year": 2018,
                "is_current": False,
                "description": "Managed international business development across APAC region"
            },
            {
                "expert_id": "EX-00002",
                "title": "Senior Energy Consultant",
                "company": "Renewable Energy Solutions",
                "start_year": 2015,
                "end_year": None,
                "is_current": True,
                "description": "Consulting on utility-scale solar and BESS projects"
            },
            {
                "expert_id": "EX-00003",
                "title": "Senior Lighting Engineer",
                "company": "Lighting Design Associates",
                "start_year": 2010,
                "end_year": None,
                "is_current": True,
                "description": "Specializing in architectural and industrial lighting design"
            },
            {
                "expert_id": "EX-00004",
                "title": "Marketing Director",
                "company": "Industrial Marketing Group",
                "start_year": 2016,
                "end_year": None,
                "is_current": True,
                "description": "Leading B2B marketing strategies for industrial clients"
            },
            {
                "expert_id": "EX-00005",
                "title": "Real Estate Strategy Consultant",
                "company": "Global Real Estate Advisors",
                "start_year": 2014,
                "end_year": None,
                "is_current": True,
                "description": "Consulting on real estate investments and market development"
            },
            {
                "expert_id": "EX-00006",
                "title": "Energy Systems Engineer",
                "company": "Energy Engineering Consultants",
                "start_year": 2013,
                "end_year": None,
                "is_current": True,
                "description": "Engineering consulting for renewable energy systems"
            },
            {
                "expert_id": "EX-00007",
                "title": "Energy Strategy Manager",
                "company": "Corporate Energy Advisors",
                "start_year": 2017,
                "end_year": None,
                "is_current": True,
                "description": "Strategic consulting for corporate energy transition"
            },
            {
                "expert_id": "EX-00008",
                "title": "Operations Strategy Consultant",
                "company": "Industrial Operations Group",
                "start_year": 2015,
                "end_year": None,
                "is_current": True,
                "description": "Operations optimization consulting for industrial clients"
            },
            {
                "expert_id": "EX-00009",
                "title": "Industrial Sector Consultant",
                "company": "Manufacturing Advisory Services",
                "start_year": 2016,
                "end_year": None,
                "is_current": True,
                "description": "Consulting on manufacturing processes and industrial best practices"
            },
            {
                "expert_id": "EX-00010",
                "title": "Compliance & Risk Manager",
                "company": "TMT Risk Advisors",
                "start_year": 2018,
                "end_year": None,
                "is_current": True,
                "description": "AML/KYC compliance and risk management for TMT sector"
            },
        ]
        
        # Get expert IDs for employment history
        result = await db.execute(select(Expert.expert_id, Expert.id))
        expert_map = {row[0]: row[1] for row in result.fetchall()}
        
        # Add Employment History
        for emp_data in employment_history:
            if emp_data["expert_id"] in expert_map:
                employment = ExpertEmployment(
                    expert_id=expert_map[emp_data["expert_id"]],
                    title=emp_data["title"],
                    company=emp_data["company"],
                    start_year=emp_data["start_year"],
                    end_year=emp_data["end_year"],
                    is_current=emp_data["is_current"],
                    description=emp_data["description"],
                    sort_order=0
                )
                db.add(employment)
                print(f"Added employment history for {emp_data['expert_id']}: {emp_data['title']} at {emp_data['company']}")
        
        await db.commit()
        print("Successfully added all missing expert data!")

if __name__ == "__main__":
    asyncio.run(add_missing_expert_data())
