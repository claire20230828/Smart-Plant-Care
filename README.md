# Smart Plant Care Web App

A full-stack web app to help users manage plant care using AI-assisted recommendations (AI features planned).

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite, React Router
- **Backend:** FastAPI (Python)
- **Storage:** In-memory plant list (temporary); PostgreSQL planned

---

## Quick start

### Backend

```bash
cd backend
# use your venv / conda; install deps if needed
uvicorn app.main:app --reload
```

API base defaults to `http://127.0.0.1:8000` (matches the frontend).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`). CORS allows localhost on common Vite ports.

---

## App routes

| Path | Description |
|------|-------------|
| `/` | **Dashboard** — stats, **Upcoming Watering** (due overdue / today / tomorrow), Active Observation mock |
| `/plants` | **My Plants** — card grid (3 columns on large screens), add / edit / delete |

---

## Features (implemented vs planned)

### Plant profile management (in progress)

- Create, read, update, delete plants via REST API
- **Add / edit** modal (`AddPlantModal`) shared by Dashboard and My Plants
- Frontend API client: `frontend/src/api/plants.ts`
- **My Plants** page: gradient placeholders instead of photos (for now); pet-safe badge; care summary; **Report Issue** button (no backend yet)

### Watering reminders (MVP)

- Each plant has `created_at` and `last_watered_at` (ISO date `YYYY-MM-DD`)
- Next due = `last_watered_at + watering_frequency_days` (calendar days)
- Dashboard **Upcoming Watering** lists only: **overdue**, **due today**, or **due in 1 day**
- **Log watering** calls `POST /plants/{id}/record-watering` and sets `last_watered_at` to today (status pill is read-only so users don’t mis-tap)
- **Overdue Water** stat uses live counts; **Monitoring** / **Critical Alerts** are static placeholders until observation/alert data exists

### AI-generated plant info (planned)

- Scientific name, lighting, watering / harvest frequency, pet-friendly flag, notes — form is manual today; AI wiring TBD

### Care reminders (planned beyond watering)

- Harvest scheduling like watering — possible `last_harvested_at` + `record-harvest` pattern
- Fertilizing — future

### Plant observation tracking (planned)

- Observation projects / logs in README schema below; UI shows a static “Active Observation” panel on the dashboard only

---

## API summary (plants)

| Method | Path | Description |
|--------|------|--------------|
| `GET` | `/plants` | List plants |
| `POST` | `/plants` | Create plant (sets `created_at`, `last_watered_at` to server date) |
| `PUT` | `/plants/{id}` | Update plant (preserves `created_at` / `last_watered_at`) |
| `DELETE` | `/plants/{id}` | Delete plant |
| `POST` | `/plants/{id}/record-watering` | Set `last_watered_at` to today |

---

## Project layout (high level)

```
backend/app/
  main.py          # FastAPI app, CORS
  routes/plants.py # Plant CRUD + record-watering
frontend/src/
  api/plants.ts              # fetch helpers & types
  components/AddPlantModal.tsx
  pages/DashboardPage.tsx
  pages/MyPlantsPage.tsx
  lib/wateringSchedule.ts     # due-date math & “upcoming” filter
  App.tsx                     # routes
  App.css
```

---

## Database design (planned)

### plants

Stores plant profile information.

| Column | Description |
|--------|-------------|
| id | Plant ID |
| nickname | User-defined plant nickname |
| scientific_name | Scientific name |
| pet_friendly | Whether the plant is pet-safe |
| lighting | Lighting requirement |
| watering_frequency_days | Days between waterings |
| harvest_frequency_days | Harvest cadence (optional) |
| notes | Additional notes |
| created_at | Creation date (ISO date; **implemented** in in-memory API) |
| last_watered_at | Last confirmed watering (ISO date; **implemented**) |
| updated_at | Last updated timestamp (planned for DB) |

### care_tasks

Stores watering and harvesting reminders.

| Column | Description |
|--------|-------------|
| id | Task ID |
| plant_id | Related plant |
| task_type | watering / harvest / fertilizing |
| due_date | Scheduled task date |
| status | pending / done / skipped |
| completed_at | Completion timestamp |
| created_at | Creation timestamp |

### observation_projects

Stores plant health monitoring projects.

| Column | Description |
|--------|-------------|
| id | Observation project ID |
| plant_id | Related plant |
| title | Observation title |
| description | User description |
| ai_diagnosis | AI-generated analysis |
| severity | low / medium / high |
| status | active / resolved |
| start_date | Observation start |
| next_check_date | Next scheduled check |
| created_at | Creation timestamp |

### observation_logs

Stores follow-up observation records.

| Column | Description |
|--------|-------------|
| id | Log ID |
| project_id | Related observation project |
| note | Observation note |
| image_url | Optional image |
| created_at | Creation timestamp |

---

## Current progress

- [x] React dashboard + My Plants pages with React Router
- [x] FastAPI plant APIs: GET, POST, PUT, DELETE
- [x] `POST /plants/{id}/record-watering` for watering log
- [x] Centralized frontend API module (`api/plants.ts`)
- [x] Add/Edit plant modal component (`AddPlantModal`)
- [x] In-memory `created_at` / `last_watered_at` + watering schedule UX
- [x] Dashboard typography (Google Fonts) and stat card layout
- [x] Dev-focused CORS for localhost (including alternate Vite ports)
- [ ] PostgreSQL integration
- [ ] AI integration
- [ ] Real observation / monitoring / alerts data
- [ ] Deployment

---

## Future improvements

- Plant image upload / `image_url`
- AI-powered plant info and disease hints
- User authentication
- Calendar view
- Email / push notifications
- Harvest tracking API (`last_harvested_at`)
