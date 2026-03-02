# 🌐 Деплой проекта

## Frontend (Vercel)

### 1. Подготовка

```bash
cd frontend

# Обновите API URL для production
# Создайте файл .env.production
echo "VITE_API_URL=https://your-backend-url.railway.app/api" > .env.production
echo "VITE_WS_URL=wss://your-backend-url.railway.app/api" >> .env.production
```

### 2. Деплой на Vercel

```bash
# Установите Vercel CLI (если нет)
npm install -g vercel

# Деплой
cd frontend
vercel --prod
```

### 3. Настройка в Vercel Dashboard

1. Зайдите на https://vercel.com/dashboard
2. Import project из вашего GitHub репозитория
3. Укажите:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Добавьте Environment Variables:
   - `VITE_API_URL`: URL вашего backend
   - `VITE_WS_URL`: WebSocket URL backend

---

## Backend (Railway)

### 1. Подготовка

```bash
cd backend

# Создайте Railway проект
# https://railway.app/new
```

### 2. Деплой

#### Вариант A: Через GitHub

1. Зайдите на https://railway.app
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите ваш репозиторий
5. Укажите:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### Вариант B: Через Docker

```bash
# Build и push Docker image
docker build -f backend/Dockerfile.railway -t your-username/livecodeinno-backend .
docker push your-username/livecodeinno-backend

# Deploy on Railway
railway up
```

### 3. Настройка базы данных

1. В Railway Dashboard добавьте PostgreSQL плагин
2. Скопируйте `DATABASE_URL` из переменных окружения
3. Backend автоматически подключится

### 4. Environment Variables

Добавьте в Railway Dashboard:

```env
DATABASE_URL=postgresql://...
RUN_TIMEOUT_SEC=10
PY_IMAGE=python:3.11-slim
CORS_ORIGINS=https://your-frontend.vercel.app
PORT=8000
```

---

## Backend (Render)

### 1. Создайте аккаунт

https://render.com

### 2. Создайте Web Service

1. New → Web Service
2. Connect GitHub репозиторий
3. Configure:
   - **Name**: livecodeinno-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

### 3. Добавьте базу данных

1. New → PostgreSQL
2. Скопируйте `DATABASE_URL`
3. Добавьте в Environment Variables веб-сервиса

### 4. Environment Variables

```env
DATABASE_URL=<from Render PostgreSQL>
RUN_TIMEOUT_SEC=10
PY_IMAGE=python:3.11-slim
CORS_ORIGINS=https://your-frontend.vercel.app
PORT=10000
```

---

## Backend (Vercel Serverless)

### 1. Создайте `vercel.json` в backend

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app/main.py"
    }
  ],
  "env": {
    "DATABASE_URL": "@postgres_url"
  }
}
```

### 2. Деплой

```bash
cd backend
vercel --prod
```

**Note**: Vercel Serverless не поддерживает WebSocket. Используйте Railway или Render для backend с WebSocket.

---

## Обновление frontend URL

После деплоя backend:

1. Скопируйте URL backend (например: `https://livecodeinno-backend.railway.app`)
2. Обновите frontend:

```bash
cd frontend

# Для Vercel
vercel env add VITE_API_URL https://livecodeinno-backend.railway.app/api
vercel env add VITE_WS_URL wss://livecodeinno-backend.railway.app/api

# Перезадеплойте
vercel --prod
```

---

## Проверка

### Frontend URL
```
https://your-project.vercel.app
```

### Backend URL
```
https://your-backend.railway.app
https://your-backend.railway.app/health
https://your-backend.railway.app/docs
```

### WebSocket URL
```
wss://your-backend.railway.app/api/ws/rooms/{room_id}
ws://your-backend.railway.app/yjs/{room_id}
```

---

## Production Checklist

- [ ] Backend деплоится на Railway/Render
- [ ] PostgreSQL подключен к backend
- [ ] CORS настроен для frontend домена
- [ ] Frontend деплоится на Vercel
- [ ] Environment Variables настроены
- [ ] WebSocket работает через WSS
- [ ] Тестирование коллаборации работает
- [ ] Python код выполняется (Pyodide)
- [ ] SQL код выполняется (PGlite)
- [ ] Leaderboard сохраняется в БД

---

## Troubleshooting

### WebSocket не подключается

Проверьте:
1. Используется ли `wss://` для production
2. CORS настроен правильно
3. Порт открыт в firewall

### Ошибка CORS

Добавьте в backend `.env`:
```env
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
```

### База данных не подключается

Проверьте `DATABASE_URL` в environment variables backend.

---

## Альтернативные платформы

### Frontend
- ✅ Vercel (рекомендуется)
- ✅ Netlify
- ✅ Cloudflare Pages
- ✅ GitHub Pages

### Backend
- ✅ Railway (рекомендуется для WebSocket)
- ✅ Render (рекомендуется для WebSocket)
- ⚠️ Vercel Serverless (нет WebSocket)
- ⚠️ Heroku (платный)
- ✅ DigitalOcean App Platform

### Database
- ✅ Railway PostgreSQL
- ✅ Render PostgreSQL
- ✅ Supabase
- ✅ Neon (serverless PostgreSQL)
