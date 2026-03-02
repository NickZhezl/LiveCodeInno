# 🚀 LiveCodeInno - Быстрый старт

## Вариант 1: Автоматический запуск (рекомендуется)

Просто запустите файл **`start.bat`** в корневой папке проекта:

```
LiveCodeInno/
└── start.bat  ← Дважды кликните
```

Это автоматически запустит:
- ✅ Backend (FastAPI) на http://localhost:8000
- ✅ Frontend (React) на http://localhost:5173

---

## Вариант 2: Ручной запуск

### 1. Backend (в одном терминале)

```bash
cd backend

# Активировать виртуальное окружение
.venv\Scripts\activate

# Запустить сервер (использует SQLite)
set DATABASE_URL=sqlite+aiosqlite:///./livecodeinno.db
python run_quick.py
```

Backend будет доступен на: **http://localhost:8000**

### 2. Frontend (в другом терминале)

```bash
cd frontend

# Запустить dev сервер
npm run dev
```

Frontend будет доступен на: **http://localhost:5173**

---

## Проверка работы

1. Откройте браузер: **http://localhost:5173**
2. Введите имя (например: `Alice`)
3. Введите ID комнаты (например: `test123`)
4. Выберите язык (Python или SQL)
5. Нажмите **Start**

---

## API Документация

После запуска backend, откройте:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## Тестирование коллаборации

1. Откройте http://localhost:5173 в **двух разных браузерах** (или инкогнито)
2. Введите разные имена (`Alice` и `Bob`)
3. Используйте **одинаковый ID комнаты** (`test123`)
4. Начните печатать в одном окне - текст появится в обоих!

---

## Остановка

- **Backend**: Закройте терминал или нажмите `Ctrl+C`
- **Frontend**: Закройте терминал или нажмите `Ctrl+C`

---

## Использование с PostgreSQL (Production)

Для полноценной работы с PostgreSQL:

### 1. Запустите PostgreSQL

```bash
# Через Docker
docker run -d --name livecode-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=livecodeinno \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. Обновите .env

Создайте файл `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/livecodeinno
```

### 3. Запустите backend

```bash
cd backend
.venv\Scripts\activate
python run_server.py
```

---

## Структура проекта

```
LiveCodeInno/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI приложение
│   │   ├── models.py        # Модели БД
│   │   ├── routes.py        # API endpoints
│   │   └── ...
│   ├── .venv/               # Виртуальное окружение
│   ├── requirements.txt
│   └── run_quick.py         # Быстрый старт (SQLite)
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts    # API клиент
│   │   ├── components/
│   │   └── ...
│   └── package.json
│
├── start.bat                # Автозапуск
└── RUN_INSTRUCTIONS.md      # Полная документация
```

---

## Технологии

| Компонент | Технология |
|-----------|------------|
| Frontend | React + Vite + TypeScript |
| Backend | FastAPI + Python |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Real-time | WebSocket |
| Collab Editing | Yjs |
| Python Execution | Pyodide (browser) |
| SQL Execution | PGlite (browser) |

---

## Troubleshooting

### Ошибка: "Port 8000 already in use"

```bash
# Windows - найти процесс
netstat -ano | findstr :8000

# Убить процесс
taskkill /F /PID <номер_процесса>
```

### Ошибка: "npm not found"

Установите Node.js: https://nodejs.org/

### Ошибка: "Python not found"

Установите Python 3.11: https://www.python.org/downloads/

### Ошибка: "Module not found"

```bash
# Backend
cd backend
.venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## Контакты

Вопросы и предложения: создайте issue в репозитории.
