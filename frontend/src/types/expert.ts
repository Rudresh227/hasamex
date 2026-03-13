export interface Expert {
  id: string;
  serial_number?: number;
  expert_id: string;
  salutation?: string;
  first_name: string;
  last_name: string;
  primary_email: string;
  secondary_email?: string;
  primary_phone?: string;
  phone?: string; // Alias for primary_phone for UI consistency
  secondary_phone?: string;
  linkedin_url?: string;
  location?: string;
  timezone?: string;
  region_id?: number;
  employment_status_id?: number;
  seniority_id?: number;
  seniority?: string;
  years_experience?: number;
  headline?: string;
  bio?: string;
  strength_topics?: string;
  sector_id?: number;
  company_role_id?: number;
  company_role?: string;  // Legacy field
  function_id?: number;
  hcms_class?: string;
  expert_status_id?: number;
  payment_details?: string;
  notes?: string;
  events_invited?: string;
  total_calls: number;
  last_modified: string;
  created_at: string;
  sector?: LookupValue;
  region?: LookupValue;
  status?: LookupValue;
  function?: LookupValue;
  employment_status?: LookupValue;
  seniority_lookup?: LookupValue;
  company_role_lookup?: LookupValue;
  rates?: ExpertRate[];
  employment_history?: ExpertEmployment[];
  files?: ExpertFile[];
}

export interface ExpertRate {
  id: string;
  expert_id: string;
  currency: string;
  hourly_rate: number;
  is_primary: boolean;
  created_at: string;
}

export interface ExpertEmployment {
  id: string;
  expert_id: string;
  title: string;
  company: string;
  start_year: number;
  end_year?: number;
  is_current: boolean;
  description?: string;
  sort_order: number;
  created_at: string;
}

export interface ExpertFile {
  id: string;
  expert_id: string;
  s3_key: string;
  filename: string;
  file_size_kb: number;
  mime_type: string;
  is_primary: boolean;
  uploaded_at: string;
}

export interface ExpertUpdate {
  first_name?: string;
  last_name?: string;
  primary_email?: string;
  primary_phone?: string;
  secondary_phone?: string;
  linkedin_url?: string;
  location?: string;
  timezone?: string;
  region_id?: number;
  employment_status_id?: number;
  seniority_id?: number;
  seniority?: string;
  years_experience?: number;
  headline?: string;
  bio?: string;
  strength_topics?: string;
  sector_id?: number;
  function_id?: number;
  company_role_id?: number;
  company_role?: string;
  hcms_class?: string;
  expert_status_id?: number;
  notes?: string;
  total_calls?: number;
}

export interface LookupValue {
  id: number;
  category: string;
  value: string;
  sort_order: number;
  is_active: boolean;
}

export interface ExpertFilters {
  search?: string;
  sector_id?: number;
  region_id?: number;
  expert_status_id?: number;
  employment_status_id?: number;
  function_id?: number;
  skip?: number;
  limit?: number;
  sector?: string; // For client-side UI convenience if needed
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
