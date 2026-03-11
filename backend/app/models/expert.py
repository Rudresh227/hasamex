from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Table, Text, Numeric, DateTime, func
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from typing import List, Optional
import uuid
import datetime

from app.database import Base

class LookupValue(Base):
    __tablename__ = "lookup_values"

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[str] = mapped_column(String, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    __mapper_args__ = {
        "confirm_deleted_rows": False
    }

class Expert(Base):
    __tablename__ = "experts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    
    salutation: Mapped[Optional[str]] = mapped_column(String)
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    
    primary_email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    secondary_email: Mapped[Optional[str]] = mapped_column(String)
    
    primary_phone: Mapped[Optional[str]] = mapped_column(String)
    secondary_phone: Mapped[Optional[str]] = mapped_column(String)
    
    linkedin_url: Mapped[Optional[str]] = mapped_column(String, unique=True)
    location: Mapped[Optional[str]] = mapped_column(String)
    timezone: Mapped[Optional[str]] = mapped_column(String)
    
    region_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lookup_values.id"))
    employment_status_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lookup_values.id"))
    
    seniority: Mapped[Optional[str]] = mapped_column(String)
    years_experience: Mapped[Optional[int]] = mapped_column(Integer)
    headline: Mapped[Optional[str]] = mapped_column(String)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    strength_topics: Mapped[Optional[str]] = mapped_column(Text)
    
    sector_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lookup_values.id"))
    company_role: Mapped[Optional[str]] = mapped_column(String)
    function_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lookup_values.id"))
    
    hcms_class: Mapped[Optional[str]] = mapped_column(String)
    expert_status_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lookup_values.id"))
    
    payment_details: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    events_invited: Mapped[Optional[str]] = mapped_column(Text)
    total_calls: Mapped[int] = mapped_column(Integer, default=0)
    
    last_modified: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    
    search_vector: Mapped[Optional[TSVECTOR]] = mapped_column(TSVECTOR)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    employment_history: Mapped[List["ExpertEmployment"]] = relationship(back_populates="expert", cascade="all, delete-orphan")
    rates: Mapped[List["ExpertRate"]] = relationship(back_populates="expert", cascade="all, delete-orphan")
    projects: Mapped[List["ExpertProject"]] = relationship(back_populates="expert", cascade="all, delete-orphan")
    files: Mapped[List["ExpertFile"]] = relationship(back_populates="expert", cascade="all, delete-orphan")

class ExpertEmployment(Base):
    __tablename__ = "expert_employment"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("experts.id", ondelete="CASCADE"), nullable=False)
    
    title: Mapped[str] = mapped_column(String, nullable=False)
    company: Mapped[str] = mapped_column(String, nullable=False)
    start_year: Mapped[Optional[int]] = mapped_column(Integer)
    end_year: Mapped[Optional[int]] = mapped_column(Integer)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    expert: Mapped["Expert"] = relationship(back_populates="employment_history")

class ExpertRate(Base):
    __tablename__ = "expert_rates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("experts.id", ondelete="CASCADE"), nullable=False)
    
    currency: Mapped[str] = mapped_column(String, nullable=False)
    hourly_rate: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    expert: Mapped["Expert"] = relationship(back_populates="rates")

class ExpertProject(Base):
    __tablename__ = "expert_projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("experts.id", ondelete="CASCADE"), nullable=False)
    project_id: Mapped[str] = mapped_column(String, nullable=False)
    added_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    expert: Mapped["Expert"] = relationship(back_populates="projects")

class ExpertFile(Base):
    __tablename__ = "expert_files"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("experts.id", ondelete="CASCADE"), nullable=False)
    
    s3_key: Mapped[str] = mapped_column(String, nullable=False)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    file_size_kb: Mapped[Optional[int]] = mapped_column(Integer)
    mime_type: Mapped[str] = mapped_column(String, default="application/pdf")
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    uploaded_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    expert: Mapped["Expert"] = relationship(back_populates="files")
