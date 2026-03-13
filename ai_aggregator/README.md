# AI News Aggregator (Django + React)

A high-end, automated news aggregation system for the 'AI Insights' ecosystem.

## 🚀 Getting Started

### 1. Backend (Django)
```bash
cd backend
# (Optional) Create a virtual environment
# python -m venv venv
# .\venv\Scripts\activate

# The dependencies are already installed in your environment, but for a new setup:
# pip install django djangorestframework django-cors-headers requests

# Run migrations
python manage.py migrate

# Sync news for the first time
python manage.py sync_ai_news

# Start the server
python manage.py runserver
```

### 2. Frontend (React + Vite)
```bash
cd frontend
# Install dependencies
npm install

# Start the dev server
npm run dev
```

## 🛠 Features
- **Automated Sync**: Management command `sync_ai_news` fetches from Hacker News and NewsAPI.
- **Deduplication**: Unique URL and ID checking ensures no duplicate articles.
- **REST API**: Django REST Framework provides clean JSON endpoints.
- **Modern UI**: React component with Framer Motion animations and Glassmorphism styling.
- **CORS Enabled**: Pre-configured for seamless backend-frontend communication.

## 🔑 API Keys
To enable The News API, update the `NEWS_API_KEY` in:
`backend/api/management/commands/sync_ai_news.py`
