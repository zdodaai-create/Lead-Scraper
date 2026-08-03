# LEAD FINDER - Enterprise Business Lead Discovery & Contact Enrichment

**LEAD FINDER** is a production-ready, full-stack web application built to discover publicly available business leads from map & place data and enrich them by automatically visiting official public company websites to extract verified business emails and contact details.

---

## Key Features

1. **Google Places API Integration**: Leverages official Google Places APIs (Text Search & Details) for region + category searches (e.g. `Trivandrum` + `Software Companies`). Includes built-in mock fallback for instant evaluation without requiring a key upfront.
2. **Website Contact Enrichment**: Async `httpx` crawler + BeautifulSoup HTML parser visiting `/`, `/contact`, `/contact-us`, `/about`, `/about-us` to discover verified role emails (`info@`, `contact@`, `sales@`, `hello@`, `support@`) and phone numbers.
3. **SSRF Guard & Security**: Bulletproof Pre-flight DNS resolution and IP validation blocking private IP ranges (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.0.0/16`), intranet hostnames, and non-HTTP protocols.
4. **Multi-Criteria Deduplication**: Merges duplicate records by Place ID, normalized website domain, phone number, email, and company name + address.
5. **Dashboard & Metrics**: Summary cards (Total Leads, With Phone, With Email, With Website, Without Email), live search progress overlay, and full-featured lead management table.
6. **Lead Management**: Filter by Rating, Phone, Email, Website, City, or Category. Sort by Rating, Reviews, Company Name, Date. Update lead status (`New`, `Contacted`, `Follow Up`, `Interested`, `Converted`, `Not Interested`) and add internal notes.
7. **Saved Searches**: Save region, category, radius, and filter parameters for one-click re-execution.
8. **Export Engine**: Export full database or selected leads directly to Excel (`.xlsx`) via OpenPyXL or CSV (`.csv`) via Pandas.

---

## Project Structure

```
LEAD SCRAPER/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI entrypoint & router registration
│   │   ├── database/              # SQLAlchemy session & seeder
│   │   ├── models/                # User, Search, Lead DB models
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── routes/                # REST API endpoints (Auth, Search, Leads, Exports)
│   │   ├── services/              # Places API, SSRF Guard, Web Crawler, Deduplication, Exports
│   │   └── utils/
│   ├── .env                       # Environment configuration
│   ├── .env.example
│   ├── requirements.txt           # Python dependencies
│   └── run.py                     # Python server runner script
│
├── frontend/
│   ├── src/
│   │   ├── components/            # SearchForm, LeadTable, LeadDetailModal, ProgressOverlay, etc.
│   │   ├── pages/                 # Login, Register, Dashboard, SavedSearches, AllLeads, Exports, Settings
│   │   ├── services/              # Axios API client
│   │   ├── context/               # AuthContext provider
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind CSS directives
│   ├── index.html
│   ├── package.json               # Node dependencies
│   ├── vite.config.js             # Vite dev server & API proxy
│   └── tailwind.config.js
│
└── README.md
```

---

## Quick Start Guide

### 1. Backend Setup (FastAPI & Python)

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend
python run.py
```

The backend server will launch at `http://127.0.0.1:8000`. Interactive API Documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (React, Vite & Tailwind CSS)

```bash
cd frontend

# Install Node dependencies
npm install

# Run Vite development server
npm run dev
```

The frontend application will run at `http://localhost:3000`.

---

## Default Login Credentials

For quick evaluation, an admin account is seeded automatically upon first launch:
- **Email**: `demo@leadfinder.com`
- **Password**: `password123`

---

## Environment Variables Configuration

Copy `backend/.env.example` to `backend/.env`:

```env
SECRET_KEY=leadfinder_super_secret_jwt_key_2026_change_in_prod
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

DATABASE_URL=sqlite:///./lead_finder.db

# Option 1: Official Google Places API Key
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Option 2: Fallback Mock Generator (Set true if no API key is provided)
ENABLE_MOCK_FALLBACK=true

WEBSITE_TIMEOUT_SECONDS=8
MAX_CONCURRENT_ENRICHMENTS=5
```

---

## REST API Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | User registration |
| `/api/auth/login` | `POST` | JWT login token generation |
| `/api/auth/me` | `GET` | Get current user profile |
| `/api/search` | `POST` | Execute Places discovery & website contact enrichment pipeline |
| `/api/searches` | `GET` | List saved searches |
| `/api/searches/{id}` | `DELETE` | Delete saved search criteria |
| `/api/leads` | `GET` | List, search, filter, sort, and paginate leads |
| `/api/leads/{id}` | `PATCH` | Update lead status (`New`, `Contacted`, etc.) and internal notes |
| `/api/leads/{id}` | `DELETE` | Delete single lead record |
| `/api/leads/batch-delete` | `POST` | Delete multiple selected leads |
| `/api/export/excel` | `GET` | Stream Excel (.xlsx) file download |
| `/api/export/csv` | `GET` | Stream CSV (.csv) file download |
| `/api/export` | `POST` | Export selected lead IDs |
