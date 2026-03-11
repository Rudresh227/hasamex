**HASAMEX**

Expert Database MVP

_Complete Implementation Plan & Architecture Guide_

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tech Stack: **Next.js · FastAPI · PostgreSQL · Docker**

March 2026

# **1\. System Architecture**

## **1.1 High-Level Architecture Overview**

The Hasamex Expert Database is a three-tier web application. The user interface runs in the browser (Next.js), all business logic lives in a Python FastAPI service, and data is persisted in a PostgreSQL database. File uploads are stored separately - locally during development and in AWS S3 for production.

| **Frontend** | **Backend** | **Database** | **File Storage** |
| --- | --- | --- | --- |
| Next.js 14 (App Router) | FastAPI (Python 3.11) | PostgreSQL 15 | AWS S3 / Local |
| TypeScript, Tailwind CSS, React Query | Pydantic v2, SQLAlchemy 2, Alembic | Full-text search, GIN indexes | Presigned URLs, 50 MB limit |

## **1.2 Tier Separation**

### **Frontend (Port 3000)**

Next.js 14 with the App Router. All pages are Server Components by default, switching to Client Components only when interactivity is required (forms, modals, search). This minimises JavaScript shipped to the browser.

### **Backend (Port 8000)**

FastAPI serves a versioned REST API under /api/v1/. Pydantic v2 models enforce strict input validation. SQLAlchemy 2 provides the async ORM layer. Alembic manages all schema migrations.

### **Database (Port 5432)**

PostgreSQL 15 is the single source of truth. A tsvector column on the experts table enables sub-millisecond full-text search. GIN indexes accelerate both search and filter queries.

### **File Storage**

Profile PDFs are uploaded to S3 (or a local MinIO instance during development). Presigned URLs are stored in the database; actual binary files never pass through the API server.

## **1.3 Deployment Architecture**

All services are containerised with Docker Compose for local development and deployed to AWS for production.

| **Service** | **Local (Docker)** | **Production (AWS)** |
| --- | --- | --- |
| Frontend | localhost:3000 | ECS Fargate + CloudFront CDN |
| Backend | localhost:8000 | ECS Fargate behind ALB |
| Database | localhost:5432 | RDS PostgreSQL 15 (Multi-AZ) |
| File Storage | MinIO (localhost:9000) | S3 + CloudFront |

# **2\. Database Design**

## **2.1 Single Table vs. Normalized Schema - Decision**

Short answer: Yes - we break the single experts table into multiple focused tables. This is the correct approach for a production system, even at MVP scale. Here is the full reasoning.

The original single-table design works for a quick proof-of-concept but carries real risks as the database grows: repeated text values (sector names, region names, statuses) become inconsistent; arrays like project_ids cannot be queried without application-level parsing; and employment_history embedded as raw text cannot be sorted or aggregated.

The normalized design below splits data into six focused tables. Each has one clear responsibility. Foreign keys enforce referential integrity. Lookup tables ensure consistent dropdown values and allow non-developer admins to add new sectors or statuses with a single database row - no code deployment required.

| **Table** | **Responsibility** | **Why Separate?** |
| --- | --- | --- |
| **experts** | Core identity & contact fields | Central record; every other table references this |
| **expert_employment** | Structured work history rows | One expert has many jobs; enables filter/sort by company |
| **expert_rates** | Per-currency hourly rate entries | One expert may quote INR and USD; pairs are not queryable in a single column |
| **expert_projects** | Project membership links | Many-to-many: one expert on many projects and vice versa |
| **expert_files** | Profile PDF attachments | One expert may have multiple file versions; stores S3 key and metadata |
| **lookup_values** | Sectors, regions, statuses, functions | Single source of truth for all UI dropdown values |

## **2.2 Table 1 - experts (Core Identity)**

Anchor table holding only stable, single-value fields: identity, contact details, classification, and status. All repeating or multi-value data lives in child tables. Includes all required fields from the HEB schema: Expert ID, Salutation, First/Last Name, both email addresses, both phone numbers, LinkedIn URL, Location, Timezone, Region, Employment Status, Seniority, Years of Experience, Title/Headline, Bio, Strength Topics, Primary Sector, Company Role, Expert Function, HCMS Classification, Expert Status, Payment Details, Notes, Events Invited To, and Total Calls Completed.

CREATE TABLE experts (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

expert_id TEXT UNIQUE NOT NULL, -- EX-00001

salutation TEXT, -- Dr, Mr, Ms, Prof

first_name TEXT NOT NULL,

last_name TEXT NOT NULL,

primary_email TEXT UNIQUE NOT NULL,

secondary_email TEXT,

primary_phone TEXT,

secondary_phone TEXT,

linkedin_url TEXT UNIQUE,

location TEXT,

timezone TEXT,

region_id INTEGER REFERENCES lookup_values(id),

employment_status_id INTEGER REFERENCES lookup_values(id),

seniority TEXT,

years_experience INTEGER,

headline TEXT,

bio TEXT,

strength_topics TEXT,

sector_id INTEGER REFERENCES lookup_values(id),

company_role TEXT,

function_id INTEGER REFERENCES lookup_values(id),

hcms_class TEXT,

expert_status_id INTEGER REFERENCES lookup_values(id),

payment_details TEXT,

notes TEXT,

events_invited TEXT,

total_calls INTEGER DEFAULT 0,

last_modified TIMESTAMPTZ DEFAULT NOW(),

created_at TIMESTAMPTZ DEFAULT NOW(),

search_vector TSVECTOR,

is_deleted BOOLEAN DEFAULT FALSE

);

## **2.3 Table 2 - expert_employment (Work History)**

Replaces the freetext employment_history column. Each past or current role is a dedicated row, enabling queries like 'all experts who have worked at Signify' or 'all experts who held a Director role before 2020'. The sort_order column preserves the original chronological display order.

CREATE TABLE expert_employment (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,

title TEXT NOT NULL,

company TEXT NOT NULL,

start_year INTEGER,

end_year INTEGER, -- NULL means current role

is_current BOOLEAN DEFAULT FALSE,

description TEXT,

sort_order INTEGER DEFAULT 0,

created_at TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX idx_emp_expert_id ON expert_employment(expert_id);

CREATE INDEX idx_emp_company ON expert_employment(lower(company));

## **2.4 Table 3 - expert_rates (Hourly Rates per Currency)**

Replaces the currency + hourly_rate column pair. An expert can quote different rates in different currencies - e.g. INR 10,000 for domestic clients and USD 150 for international. The is_primary flag identifies the default rate shown in list views and exports.

CREATE TABLE expert_rates (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,

currency TEXT NOT NULL,

hourly_rate NUMERIC(10,2) NOT NULL,

is_primary BOOLEAN DEFAULT FALSE,

created_at TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX idx_rates_expert_id ON expert_rates(expert_id);

## **2.5 Table 4 - expert_projects (Project Membership)**

Replaces the project_ids TEXT\[\] array with a proper many-to-many join table. A project can include many experts; one expert can be on many projects. The array approach made it impossible to efficiently answer 'which projects is expert X on?' or 'how many experts are in project P?'.

CREATE TABLE expert_projects (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,

project_id TEXT NOT NULL,

added_at TIMESTAMPTZ DEFAULT NOW(),

UNIQUE (expert_id, project_id)

);

CREATE INDEX idx_proj_expert_id ON expert_projects(expert_id);

CREATE INDEX idx_proj_project_id ON expert_projects(project_id);

## **2.6 Table 5 - expert_files (Profile PDF Attachments)**

Replaces the single profile_pdf_url column. Storing the S3 object key, original filename, file size, and upload timestamp enables versioning, audit history, and listing all attachments per expert. The is_primary flag marks the canonical profile document shown by default.

CREATE TABLE expert_files (

id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,

s3_key TEXT NOT NULL,

filename TEXT NOT NULL,

file_size_kb INTEGER,

mime_type TEXT DEFAULT 'application/pdf',

is_primary BOOLEAN DEFAULT FALSE,

uploaded_at TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX idx_files_expert_id ON expert_files(expert_id);

## **2.7 Table 6 - lookup_values (Dropdown Taxonomy)**

A single lookup table stores all controlled vocabulary: Primary Sectors, Regions, Expert Statuses, Employment Statuses, and Expert Functions. Adding a new sector or status requires one INSERT row - not a code change or redeployment. The API exposes a /api/v1/lookups/{category} endpoint so the frontend always renders dropdowns from live database values.

CREATE TABLE lookup_values (

id SERIAL PRIMARY KEY,

category TEXT NOT NULL,

value TEXT NOT NULL,

sort_order INTEGER DEFAULT 0,

is_active BOOLEAN DEFAULT TRUE,

UNIQUE (category, value)

);

CREATE INDEX idx_lookup_category ON lookup_values(category);

\-- Categories: 'sector' | 'region' | 'expert_status'

\-- 'employment_status' | 'function'

## **2.8 Full-Text Search Vector Trigger**

The search_vector column on the experts table is maintained by a database trigger fired on every INSERT or UPDATE. The weighted fields match the PDF requirement: search by name, title, role, sector, function, and location.

CREATE OR REPLACE FUNCTION update_expert_search_vector()

RETURNS TRIGGER AS \$\$

BEGIN

NEW.search_vector :=

setweight(to_tsvector('english',

COALESCE(NEW.first_name,'') || ' ' || COALESCE(NEW.last_name,'')), 'A') ||

setweight(to_tsvector('english', COALESCE(NEW.headline,'')), 'B') ||

setweight(to_tsvector('english', COALESCE(NEW.bio,'')), 'C') ||

setweight(to_tsvector('english', COALESCE(NEW.strength_topics,'')), 'C') ||

setweight(to_tsvector('english', COALESCE(NEW.location,'')), 'C');

RETURN NEW;

END;

\$\$ LANGUAGE plpgsql;

CREATE TRIGGER experts_search_vector_update

BEFORE INSERT OR UPDATE ON experts

FOR EACH ROW EXECUTE FUNCTION update_expert_search_vector();

## **2.9 Indexing Strategy**

| **Index** | **Type** | **Purpose** |
| --- | --- | --- |
| experts.search_vector | GIN | Full-text search across all text fields |
| experts.primary_email | UNIQUE B-Tree | Duplicate email detection on add/edit |
| experts.linkedin_url | UNIQUE B-Tree | Duplicate LinkedIn URL detection |
| experts.sector_id, region_id | B-Tree composite | Combined sector + region filter |
| experts.expert_status_id | B-Tree | Expert status filter on list page |
| experts.expert_id | UNIQUE B-Tree | Fast lookup by human-readable ID |
| experts.created_at | B-Tree | Default sort on list page |
| expert_employment.expert_id | B-Tree | Load all jobs for one expert |
| expert_employment.company | B-Tree (lower) | Company name search |
| expert_rates.expert_id | B-Tree | Load all rates for one expert |
| expert_projects.expert_id | B-Tree | All projects for one expert |
| expert_projects.project_id | B-Tree | All experts in one project |
| lookup_values.category | B-Tree | Populate UI dropdowns by category |

# **3\. Backend Design (FastAPI)**

## **3.1 Folder Structure**

backend/

├── app/

│ ├── main.py # FastAPI app, CORS, middleware

│ ├── config.py # Settings (pydantic-settings)

│ ├── database.py # Async engine + session factory

│ ├── models/

│ │ └── expert.py # SQLAlchemy ORM model

│ ├── schemas/

│ │ └── expert.py # Pydantic request / response schemas

│ ├── routers/

│ │ ├── experts.py # CRUD + search endpoints

│ │ └── files.py # Upload / presigned URL endpoints

│ ├── services/

│ │ ├── expert_service.py

│ │ └── file_service.py

│ └── utils/

│ ├── duplicate.py # Duplicate detection helpers

│ └── email_export.py # Email-ready export builder

├── alembic/ # Migrations

├── tests/

├── seed.py # Seed from Excel

├── Dockerfile

└── requirements.txt

## **3.2 API Endpoint Design**

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| **GET** | /api/v1/experts | List experts (paginated, filtered, sorted) |
| **POST** | /api/v1/experts | Create new expert (with duplicate check) |
| **GET** | /api/v1/experts/{id} | Get single expert by UUID or Expert ID |
| **PATCH** | /api/v1/experts/{id} | Partial update (PATCH, not PUT) |
| **DELETE** | /api/v1/experts/{id} | Soft-delete expert (is_deleted = true) |
| **GET** | /api/v1/experts/search | Full-text search with filters |
| **POST** | /api/v1/experts/export | Email-ready export for selected IDs |
| **POST** | /api/v1/files/upload | Upload profile PDF, returns URL |
| **GET** | /api/v1/files/presigned | Generate presigned download URL |
| **GET** | /api/v1/lookups/{category} | Fetch dropdown values (sectors, regions…) |
| **GET** | /api/v1/health | Liveness probe for Docker / ECS |

## **3.3 Duplicate Detection Logic**

Duplicate detection runs at write time (POST and PATCH). The service layer queries for existing rows with the same primary_email or linkedin_url (case-insensitive). The response distinguishes between an exact duplicate and a near-match so the UI can show the appropriate warning.

async def check_duplicates(db, email: str, linkedin: str, exclude_id=None):

q = select(Expert).where(

or_(func.lower(Expert.primary_email) == email.lower(),

func.lower(Expert.linkedin_url) == linkedin.lower())

)

if exclude_id:

q = q.where(Expert.id != exclude_id)

result = await db.execute(q)

conflicts = result.scalars().all()

if conflicts:

raise HTTPException(409, detail={

'message': 'Duplicate expert detected',

'conflicts': \[{'id': str(e.id), 'name': f'{e.first_name} {e.last_name}'} for e in conflicts\]

})

## **3.4 File Upload Strategy**

Files are uploaded directly from the browser to S3 using a presigned POST URL (generated by the backend). This avoids routing large binary files through the API server, reducing latency and infrastructure cost.

- Frontend requests a presigned URL from /api/v1/files/upload.
- Backend generates a 15-minute presigned S3 URL, scoped to the expert's folder.
- Frontend uploads the file directly to S3 using the presigned URL.
- On success, frontend sends the resulting S3 object key back to the backend.
- Backend stores the key as profile_pdf_url on the expert record.

# **4\. Frontend Design (Next.js)**

## **4.1 Folder Structure**

frontend/

├── app/

│ ├── layout.tsx # Root layout (nav, providers)

│ ├── page.tsx # Redirect to /experts

│ └── experts/

│ ├── page.tsx # Expert list page

│ ├── new/page.tsx # Add expert form

│ └── \[id\]/

│ ├── page.tsx # Expert profile (read)

│ └── edit/page.tsx # Edit expert

├── components/

│ ├── ExpertTable.tsx # Sortable, paginated table

│ ├── ExpertCard.tsx # Card view alternative

│ ├── SearchBar.tsx # Debounced search input

│ ├── FilterPanel.tsx # Sector / Region / Status filters

│ ├── ExpertForm.tsx # Add + Edit shared form

│ ├── DuplicateWarning.tsx # Conflict modal

│ ├── EmailExport.tsx # Multi-select export panel

│ └── FileUpload.tsx # PDF upload widget

├── lib/

│ ├── api.ts # Typed axios/fetch client

│ └── validations.ts # Zod schemas (mirrors Pydantic)

└── types/

└── expert.ts # TypeScript Expert interface

## **4.2 State Management**

React Query (TanStack Query) handles all server state - fetching, caching, background refresh, and optimistic updates. Local UI state (modal open, selected rows, filter panel) lives in useState. No global state manager (Redux/Zustand) is needed at MVP scale.

Key React Query patterns used: useInfiniteQuery for the list page (virtual scroll ready), useMutation for create/update/delete with automatic cache invalidation, and useQuery with staleTime:30s for the detail page.

## **4.3 Search and Filtering Implementation**

Search input is debounced (300 ms) before being sent to the backend. Filters are stored as URL search params so the state is bookmarkable and shareable.

// SearchBar.tsx - debounced search

const \[query, setQuery\] = useState('');

const debouncedQuery = useDebounce(query, 300);

// Sync filters to URL

const router = useRouter();

const searchParams = useSearchParams();

function updateFilter(key: string, value: string) {

const params = new URLSearchParams(searchParams.toString());

value ? params.set(key, value) : params.delete(key);

router.replace(\`/experts?\${params.toString()}\`);

}

## **4.4 Form Validation**

Zod schemas mirror the Pydantic models exactly, providing identical validation in the browser and on the server. React Hook Form handles form state and integrates with the Zod resolver.

const expertSchema = z.object({

first_name: z.string().min(1, 'Required'),

last_name: z.string().min(1, 'Required'),

primary_email: z.string().email('Invalid email'),

linkedin_url: z.string().url('Must be a valid URL').optional(),

hourly_rate: z.number().positive().optional(),

region: z.enum(\['APAC','EMEA','Americas','Global'\]),

});

# **5\. Search Strategy**

## **5.1 PostgreSQL Full-Text Search**

PostgreSQL full-text search is used for MVP. A weighted tsvector column (search_vector) is maintained by a database trigger. Queries are translated to tsquery using websearch_to_tsquery, which supports natural language input without SQL injection risk.

\-- Search query with ranking

SELECT \*,

ts_rank(search_vector, query) AS rank

FROM experts,

websearch_to_tsquery('english', :q) query

WHERE search_vector @@ query

AND (:sector IS NULL OR primary_sector = :sector)

AND (:region IS NULL OR region = :region)

AND (:status IS NULL OR expert_status = :status)

AND (:emp IS NULL OR employment_status = :emp)

ORDER BY rank DESC

LIMIT :limit OFFSET :offset;

## **5.2 Search Weights**

| **Weight** | **Priority** | **Fields** |
| --- | --- | --- |
| A (highest) | 1.0 | First Name, Last Name |
| B   | 0.4 | Title / Headline, Primary Sector, Expert Function |
| C   | 0.2 | Bio, Location, Strength Topics |
| D (lowest) | 0.1 | Notes, Employment History |

## **5.3 Future Search Upgrade Path**

For 10,000+ records, consider migrating to Elasticsearch or OpenSearch. The current API contract is identical - only the backend service implementation changes. Alternatively, pg_trgm trigram indexes provide similarity-based (fuzzy) search within PostgreSQL at no infrastructure cost.

# **6\. Email Export Feature**

## **6.1 How It Works**

Users select one or more expert rows on the list page. Clicking 'Export to Email' sends the selected UUIDs to POST /api/v1/experts/export. The backend returns an HTML fragment that is safe to paste into any email client (Gmail, Outlook, Apple Mail).

## **6.2 Export Format**

The export is a styled HTML table. Each row contains: Expert Name, Title/Headline, Primary Sector, Location, Hourly Rate (Currency), and LinkedIn URL as a live hyperlink. A plain-text Markdown version is also returned in the same response for non-HTML email clients.

The export endpoint accepts: { expert_ids: string\[\], format: 'html' | 'markdown' | 'csv' }. CSV is useful for pasting into Excel or CRMs. All three formats are generated server-side from the same data.

## **6.3 Sample HTML Export (single expert)**

&lt;table border='1' cellpadding='8' style='border-collapse:collapse; font-family:Arial;'&gt;

&lt;thead&gt;&lt;tr style='background:#1B3A6B; color:#fff;'&gt;

&lt;th&gt;Name&lt;/th&gt;&lt;th&gt;Title&lt;/th&gt;&lt;th&gt;Sector&lt;/th&gt;

&lt;th&gt;Location&lt;/th&gt;&lt;th&gt;Rate&lt;/th&gt;&lt;th&gt;LinkedIn&lt;/th&gt;

&lt;/tr&gt;&lt;/thead&gt;

&lt;tbody&gt;&lt;tr&gt;

&lt;td&gt;Syamal Ram Kishore&lt;/td&gt;

&lt;td&gt;Co-Founder & Partner, Hexawel Healthcare&lt;/td&gt;

&lt;td&gt;Healthcare & Life Sciences&lt;/td&gt;

&lt;td&gt;Hyderabad, India&lt;/td&gt;

&lt;td&gt;INR 10,000 / hr&lt;/td&gt;

&lt;td&gt;&lt;a href='<https://linkedin.com/in/...'&gt;Profile&lt;/a&gt;&lt;/td>&gt;

&lt;/tr&gt;&lt;/tbody&gt;

&lt;/table&gt;

# **7\. File Storage**

## **7.1 Storage Options**

| **Option** | **Pros** | **Cons** |
| --- | --- | --- |
| Local Disk | Zero cost, simple dev setup | Not scalable, lost on container restart |
| AWS S3 | Infinitely scalable, 99.999% durability, CDN-ready | AWS dependency, slight added cost |
| Google GCS | Similar to S3, good for GCP stack | Not ideal for mixed AWS stack |
| Cloudflare R2 | No egress fees, S3-compatible API | Newer, smaller ecosystem |

## **7.2 Recommended Approach**

Use AWS S3 for production and MinIO (S3-compatible) for local development. This gives identical code paths in both environments - only the endpoint URL and credentials differ, configured via environment variables.

- Bucket name: hasamex-expert-profiles
- Key pattern: experts/{expert_id}/profile.pdf
- Access: Private bucket. Presigned GET URLs expire after 1 hour.
- Max file size: 50 MB, enforced by API validation and S3 policy.
- Accepted MIME types: application/pdf only.

# **8\. Data Seeding**

## **8.1 Strategy**

A standalone seed.py script reads the Excel file with openpyxl, maps each column to the SQLAlchemy model, validates with Pydantic, and inserts via SQLAlchemy's async session. Idempotent: re-running the script skips rows where expert_id already exists.

\# seed.py - simplified example

import openpyxl, asyncio

from app.database import async_session

from app.models.expert import Expert

from app.schemas.expert import ExpertCreate

COLUMN_MAP = {

'Expert ID': 'expert_id',

'First Name': 'first_name',

'Last Name': 'last_name',

'Primary Email 1': 'primary_email',

'LinkedIn URL': 'linkedin_url',

\# ... all other columns

}

async def seed():

wb = openpyxl.load_workbook('data/experts.xlsx')

ws = wb\['Current DB'\]

headers = \[c.value for c in ws\[1\]\]

async with async_session() as db:

for row in ws.iter_rows(min_row=2, values_only=True):

data = {COLUMN_MAP\[h\]: v for h, v in zip(headers, row) if h in COLUMN_MAP}

existing = await db.get(Expert, data\['expert_id'\])

if not existing:

db.add(Expert(\*\*data))

await db.commit()

asyncio.run(seed())

## **8.2 Seeded Records from HEB Database**

The following 10 expert records from the provided Excel file are seeded into the application on first run:

| **ID** | **Name** | **Sector** | **Function** | **Rate** |
| --- | --- | --- | --- | --- |
| EX-00001 | Syamal Ram Kishore | Healthcare & Life Sciences | Strategy | INR 10,000 |
| EX-00002 | Ravinder Singh | Energy | Engineering | USD 400 |
| EX-00003 | Siriwat Wangsook | Industrials | Engineering | USD 300 |
| EX-00004 | Vinod Alahari | Industrials | Marketing | USD 250 |
| EX-00005 | Majdi Baroud | Real Estate | Strategy | USD 550 |
| EX-00006 | Neeraj Agrawal | Energy | Engineering | USD 600 |
| EX-00007 | Sourabh Kumar | Energy | Strategy | USD 500 |
| EX-00008 | Dika Sona | Industrials | Strategy | USD 250 |
| EX-00009 | Mohammad Karbassian | Industrials | Other | -   |
| EX-00010 | Alessandro Locatello | TMT | Engineering | -   |

# **9\. Production Readiness**

## **9.1 Authentication Strategy**

For MVP, use JWT Bearer tokens with a single admin account. For production, integrate Auth0 or AWS Cognito - the FastAPI dependency injection model makes swapping auth providers straightforward.

- Access tokens: JWT, 1-hour expiry, RS256 signed.
- Refresh tokens: Stored in HttpOnly cookies, 7-day expiry.
- API key option: Long-lived keys for service-to-service calls (future CRM integrations).
- Role model (future): Admin, Editor, Viewer. Enforced via FastAPI dependency.

## **9.2 Logging**

Structured JSON logging via Python's structlog library. Every API request logs: method, path, status_code, duration_ms, user_id. Shipped to CloudWatch Logs in production.

## **9.3 Error Handling**

A global FastAPI exception handler normalises all errors to a consistent shape: { error: string, detail: any, request_id: string }. Validation errors from Pydantic are re-shaped to field-level messages for the frontend.

## **9.4 Rate Limiting**

slowapi provides in-process rate limiting backed by an in-memory store - no Redis required. Unauthenticated endpoints are limited to 60 requests/minute per IP. Authenticated endpoints are limited to 1,000 requests/minute per user. File upload endpoints are limited to 10 requests/minute. For multi-instance deployments at scale, the in-memory store can be swapped for a shared backend via the slowapi limiter configuration without changing any endpoint code.

## **9.5 API Security Checklist**

| **Security Control** | **Status** |
| --- | --- |
| HTTPS only (HSTS header enforced) | **MVP** |
| CORS allow-list (not wildcard) | **MVP** |
| SQL injection: parameterised queries via SQLAlchemy | **MVP** |
| Input validation: Pydantic + Zod (server + client) | **MVP** |
| Secrets in environment variables / AWS Secrets Manager | **MVP** |
| File upload: MIME-type validation + virus scan (ClamAV) | **Post-MVP** |
| WAF (AWS WAF) on ALB | **Production** |
| Penetration test | **Pre-launch** |

# **10\. Deployment**

## **10.1 Docker Compose (Local Development)**

\# docker-compose.yml

version: '3.9'

services:

db:

image: postgres:15-alpine

environment:

POSTGRES_DB: hasamex

POSTGRES_PASSWORD: \${DB_PASSWORD}

volumes: \['pgdata:/var/lib/postgresql/data'\]

ports: \['5432:5432'\]

minio:

image: minio/minio

command: server /data --console-address ':9001'

ports: \['9000:9000', '9001:9001'\]

backend:

build: ./backend

env_file: .env

depends_on: \[db, minio\]

ports: \['8000:8000'\]

command: uvicorn app.main:app --host 0.0.0.0 --reload

frontend:

build: ./frontend

env_file: .env

depends_on: \[backend\]

ports: \['3000:3000'\]

volumes:

pgdata:

## **10.2 CI/CD Pipeline (GitHub Actions)**

- On pull request: lint (ruff + eslint), type-check (mypy + tsc), unit tests, build Docker images.
- On merge to main: integration tests, Docker build + push to ECR, deploy to staging via ECS.
- On release tag: deploy to production, run smoke tests, notify Slack on success/failure.

## **10.3 Hosting Options**

| **Option** | **Best For** | **Estimated Cost / Month** |
| --- | --- | --- |
| AWS ECS + RDS | Production (recommended) | ~\$150-300 |
| Railway.app | Fast MVP deploy | ~\$20-50 |
| Render.com | Simple PaaS, Docker support | ~\$25-60 |
| Fly.io | Global edge, low latency | ~\$30-80 |
| Self-hosted VPS | Cost-sensitive | ~\$20-40 |

# **11\. Development Roadmap**

## **Phase 1 - Foundation (Days 1-2)**

Goal: Working local environment with database and basic CRUD API

- Initialise Git monorepo (frontend/, backend/, docker-compose.yml, .env.example).
- Write and run Alembic migration for the experts table with all indexes.
- Implement seed.py - import all 10 records from the Excel file.
- Build FastAPI CRUD endpoints: GET list, GET by ID, POST, PATCH, DELETE.
- Add Pydantic schemas with email + URL validation.
- Add duplicate detection (email + LinkedIn URL).
- Write pytest unit tests for services and duplicate logic.

## **Phase 2 - Frontend Core (Days 3-5)**

Goal: Usable UI with list, search, profile view, and add/edit forms

- Set up Next.js 14 App Router, Tailwind CSS, React Query, and Axios client.
- Build ExpertTable component (sortable columns, pagination, row selection).
- Add SearchBar (debounced) and FilterPanel (Sector, Region, Status, Employment).
- Build ExpertForm component shared by Add and Edit views.
- Implement Zod validation matching Pydantic schemas.
- Add DuplicateWarning modal triggered by API 409 response.
- Expert detail page with LinkedIn URL button and PDF link.

## **Phase 3 - Advanced Features (Days 6-8)**

Goal: File upload, email export, and polished UX

- Implement file upload flow: presigned URL generation, direct S3 upload, URL storage.
- Build EmailExport panel: multi-row selection, HTML/CSV export, copy-to-clipboard.
- Add LinkedIn URL quick-open (open in new tab from list and profile views).
- Toast notifications for all save/delete/export actions.
- Loading skeletons and optimistic UI updates for PATCH operations.

## **Phase 4 - Production Hardening (Days 9-10)**

Goal: Secure, monitored, and deployable to production

- Add JWT authentication (login page + protected routes).
- Integrate slowapi rate limiting and structured logging.
- Write GitHub Actions CI/CD pipeline.
- Deploy to staging (Railway or Render) and run full walkthrough.
- Write Architecture Note (1 page) and Walkthrough document.
- Record demo video or write step-by-step demo guide.

# **12\. Future Scalability**

## **12.1 Database Scaling Path**

PostgreSQL handles millions of rows comfortably with proper indexing. The GIN index on search_vector scales to hundreds of thousands of experts without degradation. When full-text search becomes insufficient (typo-tolerance, semantic search), the API service layer can be replaced with Elasticsearch without changing the frontend or database schema.

- 0-10K experts: Single PostgreSQL instance, no changes needed.
- 10K-500K experts: Add read replica for search queries. Migrate to pg_trgm for fuzzy search.
- 500K+ experts: Add Elasticsearch sidecar. Keep PostgreSQL as source of truth.

## **12.2 API Scaling Path**

- FastAPI + asyncio handles 1,000+ concurrent requests on a single instance.
- Horizontal scaling: Add more ECS tasks behind the ALB - stateless by design.
- Background jobs: Use Celery for bulk email exports and large CSV downloads when needed at scale.

## **12.3 Feature Expansion**

| **Feature** | **Implementation Path** |
| --- | --- |
| Multi-team access | Add organisations table, FK on experts, row-level security |
| CRM integration | Webhook events on expert create/update; REST API key auth |
| AI profile enrichment | OpenAI API call on save to auto-populate bio/topics |
| Expert scheduling | Calendly / Cal.com embed on profile page |
| Bulk import | Admin CSV/Excel upload endpoint with background job |
| Audit trail | Append-only expert_history table, populated by trigger |
| Mobile app | React Native sharing same FastAPI backend |

## **12.4 Architecture Assumptions & Trade-offs**

These are intentional shortcuts for MVP speed. Each is documented here for transparent evaluation.

- No auth at MVP: Fastest path to a working demo. JWT auth is Phase 4 (Day 9).
- Normalized schema: Six tables instead of one. Adds minor JOIN complexity in queries but eliminates data inconsistency, enables proper filtering on employment history and project membership, and makes UI dropdowns self-maintaining via lookup_values.
- Local file storage: In MVP, profile PDFs are stored locally via MinIO. The S3 swap is environment-variable only - no code change required.
- No audit log: Added in a future phase via a simple expert_history trigger.
- React Query over Redux: Sufficient for MVP data patterns; Redux only if cross-page state sharing becomes complex.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Hasamex Expert Database MVP - Implementation Plan**

Next.js · FastAPI · PostgreSQL · Docker · AWS