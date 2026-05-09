# Smart Plant Care Web App

A full-stack web app to help users manage plant care using AI-assisted recommendations.

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: FastAPI
- Database: PostgreSQL (coming soon)

---

## Features (WIP)

### Plant Profile Management
Users can:
- Create plant profiles manually
- Generate plant information with AI assistance
- Edit and manage plant details

### AI-Generated Plant Info
AI can automatically generate:
- Scientific name
- Lighting requirements
- Watering frequency
- Harvest frequency
- Pet-friendly information
- General care notes

### Care Reminders
The app can generate reminders for:
- Watering
- Harvesting
- Fertilizing (future feature)

### Plant Observation Tracking
Users can:
- Create observation projects for unhealthy plants
- Track symptoms such as yellow leaves or black spots
- Store follow-up observation logs
- Receive AI-generated diagnosis suggestions

---

## Database Design (Planned)

### plants
Stores plant profile information.

| Column | Description |
|---|---|
| id | Plant ID |
| nickname | User-defined plant nickname |
| common_name | Common plant name |
| scientific_name | Scientific name |
| pet_friendly | Whether the plant is pet-safe |
| lighting | Lighting requirement |
| watering_frequency_days | Watering frequency |
| harvest_frequency_days | Harvest frequency |
| notes | Additional notes |
| created_at | Creation timestamp |
| updated_at | Last updated timestamp |

---

### care_tasks
Stores watering and harvesting reminders.

| Column | Description |
|---|---|
| id | Task ID |
| plant_id | Related plant |
| task_type | watering / harvest / fertilizing |
| due_date | Scheduled task date |
| status | pending / done / skipped |
| completed_at | Completion timestamp |
| created_at | Creation timestamp |

---

### observation_projects
Stores plant health monitoring projects.

| Column | Description |
|---|---|
| id | Observation project ID |
| plant_id | Related plant |
| title | Observation title |
| description | User description |
| ai_diagnosis | AI-generated analysis |
| severity | low / medium / high |
| status | active / resolved |
| start_date | Observation start date |
| next_check_date | Next scheduled check |
| created_at | Creation timestamp |

---

### observation_logs
Stores follow-up observation records.

| Column | Description |
|---|---|
| id | Log ID |
| project_id | Related observation project |
| note | Observation note |
| image_url | Optional image |
| created_at | Creation timestamp |

---

## Current Progress
- [x] Initial React dashboard UI
- [x] Project architecture planning
- [x] Database schema planning
- [x] Initial FastAPI backend setup
- [x] GET /plants API
- [x] POST /plants API
- [ ] PostgreSQL integration
- [ ] AI integration
- [ ] Deployment

---

## Future Improvements
- Plant image recognition
- AI-powered disease detection
- User authentication
- Calendar view
- Mobile responsive improvements
- Email notifications