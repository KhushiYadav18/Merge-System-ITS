# Merge-System-ITS

Adaptive Recommendation System for Grade 6-8 math using:

- Django + Django REST Framework (backend)
- React + Vite (frontend)

## Project Structure

- `backend/` Django API (auth, chapters, recommendation engine)
- `frontend/` React UI (login, dashboard, simulator, results)

## Prerequisites

Install these first:

- Python 3.12+
- Pipenv
- Node.js 20+
- npm

## 1) Backend Setup

From project root:

```bash
cd backend
pipenv install
pipenv run python manage.py migrate
```

Run backend server:

```bash
pipenv run python manage.py runserver
```

Backend URL:

- `http://127.0.0.1:8000`

## 2) Frontend Setup

Open a new terminal from project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://127.0.0.1:5173`

## 3) How to Use

1. Open frontend in browser.
2. Register a new user (or login).
3. On dashboard, select a chapter.
4. In simulator:
   - pick a prebuilt case, or
   - edit payload fields manually
5. Submit payload.
6. View recommendation result page.

## API Endpoints

Auth:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`

Chapters:

- `GET /api/chapters/`
- `GET /api/chapters/<chapter_id>/`

Recommendation:

- `POST /api/recommend/`

Base API URL:

- `http://127.0.0.1:8000/api`

## Notes

- CORS is enabled for local development.
- Chapter metadata is currently static in backend data files.
- Recommendation payload is strictly validated on backend before scoring.

## Troubleshooting

If backend fails to start:

```bash
cd backend
pipenv run python manage.py check
```

If frontend has dependency issues:

```bash
cd frontend
npm install
npm run build
```
