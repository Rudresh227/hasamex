from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import List, Optional
import uuid
import datetime

class LookupValueBase(BaseModel):
    category: str
    value: str
    sort_order: int = 0
    is_active: bool = True

class LookupValue(LookupValueBase):
    id: int
    
    class Config:
        from_attributes = True

class ExpertEmploymentBase(BaseModel):
    title: str
    company: str
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    is_current: bool = False
    description: Optional[str] = None
    sort_order: int = 0

class ExpertEmploymentCreate(ExpertEmploymentBase):
    pass

class ExpertEmployment(ExpertEmploymentBase):
    id: uuid.UUID
    expert_id: uuid.UUID
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ExpertRateBase(BaseModel):
    currency: str
    hourly_rate: float
    is_primary: bool = False

class ExpertRateCreate(ExpertRateBase):
    pass

class ExpertRate(ExpertRateBase):
    id: uuid.UUID
    expert_id: uuid.UUID
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ExpertProjectBase(BaseModel):
    project_id: str

class ExpertProjectCreate(ExpertProjectBase):
    pass

class ExpertProject(ExpertProjectBase):
    id: uuid.UUID
    expert_id: uuid.UUID
    added_at: datetime.datetime

    class Config:
        from_attributes = True

class ExpertFileBase(BaseModel):
    filename: str
    mime_type: str = "application/pdf"
    is_primary: bool = False

class ExpertFileCreate(ExpertFileBase):
    s3_key: str
    file_size_kb: Optional[int] = None

class ExpertFile(ExpertFileBase):
    id: uuid.UUID
    expert_id: uuid.UUID
    s3_key: str
    file_size_kb: Optional[int] = None
    uploaded_at: datetime.datetime

    class Config:
        from_attributes = True

class ExpertBase(BaseModel):
    serial_number: Optional[int] = None
    expert_id: str
    salutation: Optional[str] = None
    first_name: str
    last_name: str
    primary_email: EmailStr
    secondary_email: Optional[EmailStr] = None
    primary_phone: Optional[str] = None
    secondary_phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    region_id: Optional[int] = None
    employment_status_id: Optional[int] = None
    seniority_id: Optional[int] = None
    seniority: Optional[str] = None  # Legacy field
    years_experience: Optional[int] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    strength_topics: Optional[str] = None
    sector_id: Optional[int] = None
    company_role_id: Optional[int] = None
    company_role: Optional[str] = None  # Legacy field
    function_id: Optional[int] = None
    hcms_class: Optional[str] = None
    expert_status_id: Optional[int] = None
    payment_details: Optional[str] = None
    notes: Optional[str] = None
    events_invited: Optional[str] = None
    total_calls: int = 0

class ExpertCreate(ExpertBase):
    employment_history: List[ExpertEmploymentCreate] = []
    rates: List[ExpertRateCreate] = []
    projects: List[ExpertProjectCreate] = []

class ExpertUpdate(BaseModel):
    serial_number: Optional[int] = None
    expert_id: Optional[str] = None
    salutation: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    primary_email: Optional[EmailStr] = None
    secondary_email: Optional[EmailStr] = None
    primary_phone: Optional[str] = None
    secondary_phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    region_id: Optional[int] = None
    employment_status_id: Optional[int] = None
    seniority_id: Optional[int] = None
    seniority: Optional[str] = None
    years_experience: Optional[int] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    strength_topics: Optional[str] = None
    sector_id: Optional[int] = None
    company_role_id: Optional[int] = None
    company_role: Optional[str] = None
    function_id: Optional[int] = None
    hcms_class: Optional[str] = None
    expert_status_id: Optional[int] = None
    payment_details: Optional[str] = None
    notes: Optional[str] = None
    events_invited: Optional[str] = None
    total_calls: Optional[int] = None

class Expert(ExpertBase):
    id: uuid.UUID
    last_modified: datetime.datetime
    created_at: datetime.datetime
    is_deleted: bool
    
    employment_history: List[ExpertEmployment] = []
    rates: List[ExpertRate] = []
    projects: List[ExpertProject] = []
    files: List[ExpertFile] = []
    sector: Optional[LookupValue] = None
    region: Optional[LookupValue] = None
    status: Optional[LookupValue] = None
    function: Optional[LookupValue] = None
    employment_status: Optional[LookupValue] = None
    seniority_lookup: Optional[LookupValue] = None
    company_role_lookup: Optional[LookupValue] = None

    class Config:
        from_attributes = True

class ExpertListResponse(BaseModel):
    items: List[Expert]
    total: int
    skip: int
    limit: int
