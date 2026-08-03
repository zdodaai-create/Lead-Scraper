# 🚀 Lead Finder - Production Deployment Guide

This guide details how to deploy the **Lead Finder** application (FastAPI Backend + React Vite Frontend) to production hosting providers like **Render / Railway** (Backend) and **Vercel / Netlify** (Frontend).

---

## 1. Environment Variables Check

Ensure your `backend/.env` has production-ready keys:

```env
SECRET_KEY=leadfinder_super_secret_jwt_key_2026_change_in_prod
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database (Use PostgreSQL URL in production or default SQLite)
DATABASE_URL=sqlite:///./lead_finder.db

# Official Google Places API Key
GOOGLE_PLACES_API_KEY=AIzaSyB4i3jLrH39KFEA3BQMgwc1B3AU8mIlzEI

# Strict Live Mode (No Mock Data)
DEMO_MODE=false

WEBSITE_TIMEOUT_SECONDS=4
MAX_CONCURRENT_ENRICHMENTS=15
```

---

## 2. Deploying Backend (Python FastAPI)

### Option A: Deploy on Render.com (Recommended - Free / Low Cost)
1. Push your project to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
3. Connect your repository.
4. Set Build & Command settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python run.py` or `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables under **Environment**:
   - Add `GOOGLE_PLACES_API_KEY`, `SECRET_KEY`, `DEMO_MODE=false`.
6. Click **Create Web Service**. Render will output your API URL (e.g. `https://lead-finder-api.onrender.com`).

---

## 3. Deploying Frontend (React + Vite)

### Option A: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) -> **New Project**.
2. Import your GitHub repository.
3. Set Build & Output Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com` (Your deployed backend URL)
5. Click **Deploy**.

---

## 4. Production Checklist

- [x] Verified Google Places API (New v1) endpoint integration.
- [x] Verified live business leads with real Place IDs (`ChIJ...`).
- [x] Verified website email & phone enrichment engine.
- [x] Verified 3-tier dynamic cascading location dropdowns (Country -> State -> District).
- [x] Clean database schema auto-migrations.
