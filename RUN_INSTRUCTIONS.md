# LiveCodeInno - Запуск проекта

## Быстрый старт с Docker Compose

### 1. Запуск всех сервисов

```bash
# Из корневой директории проекта
docker-compose up -d
```

Это запустит:
- **PostgreSQL** на порту 5432
- **Backend (FastAPI)** на порту 8000
- **Frontend (React)** на порту 5173

### 2. Проверка работы

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/health
- API Docs: http://localhost:8000/docs

### 3. Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только frontend
docker-compose logs -f frontend

# Только база данных
docker-compose logs -f postgres
```

### 4. Остановка

```bash
docker-compose down
```

---

## Запуск для разработки

### Backend (Python/FastAPI)

```bash
cd backend

# Создать виртуальное окружение (если нет)
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
python run_server.py
```

Backend будет на: http://localhost:8000

### Frontend (React/Vite)

```bash
cd frontend

# Установить зависимости (если не установлены)
npm install

# Запустить dev сервер
npm run dev
```

Frontend будет на: http://localhost:5173

### PostgreSQL (через Docker)

```bash
# Запустить только базу данных
docker-compose up -d postgres
```

База данных: localhost:5432
- User: `postgres`
- Password: `postgres`
- Database: `livecodeinno`

---

## Структура проекта

```
LiveCodeInno/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI приложение
│   │   ├── models.py        # SQLAlchemy модели
│   │   ├── routes.py        # REST API endpoints
│   │   ├── schemas.py       # Pydantic схемы
│   │   ├── database.py      # DB подключение
│   │   ├── config.py        # Конфигурация
│   │   ├── ws/
│   │   │   └── routes.py    # WebSocket handlers
│   │   └── exec/
│   │       └── docker_runner.py  # Code execution
│   ├── requirements.txt
│   ├── run_server.py
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts    # API клиент
│   │   ├── components/
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── ...
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env
```

---

## API Endpoints

### Rooms
- `POST /api/rooms` - Создать комнату
- `GET /api/rooms/{id}` - Получить комнату
- `PUT /api/rooms/{id}?language=python` - Обновить язык

### Leaderboard
- `GET /api/rooms/{id}/leaderboard` - Получить таблицу лидеров
- `POST /api/rooms/{id}/leaderboard` - Добавить запись

### Code Versions
- `GET /api/rooms/{id}/code` - Получить версии кода
- `POST /api/rooms/{id}/code` - Сохранить версию кода

### WebSocket
- `WS /api/ws/rooms/{id}` - Real-time обновления (курсоры, запуск кода)
- `WS /yjs/{id}` - Collaborative editing (Yjs)

---

## Troubleshooting

### Ошибка: "Port already in use"

```bash
# Освободить порт 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Или изменить порт в docker-compose.yml
```

### Ошибка: "Database connection failed"

```bash
# Перезапустить базу данных
docker-compose restart postgres

# Проверить логи
docker-compose logs postgres
```

### Ошибка: "Docker daemon not running"

```bash
# Убедитесь что Docker Desktop запущен
# Windows: Проверьте иконку Docker в трее
```

### Сброс базы данных

```bash
# Удалить все данные базы
docker-compose down -v

# Запустить заново
docker-compose up -d
```

---

## Тестирование

1. Откройте http://localhost:5173
2. Введите имя и ID комнаты (например: `test123`)
3. Выберите язык (Python или SQL)
4. Нажмите "Start"
5. Скопируйте ссылку и откройте в другом браузере для тестирования коллаборации
