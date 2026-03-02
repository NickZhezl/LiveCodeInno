# 🚀 Vercel Deployment Guide

## Полная инструкция по деплою через `vercel --prod`

### 📋 Предварительные требования

1. **Vercel аккаунт**: https://vercel.com/signup
2. **Vercel CLI**: `npm install -g vercel`
3. **База данных**: Vercel Postgres или Supabase

---

## 🎯 Вариант 1: Vercel Postgres (рекомендуется)

### Шаг 1: Создайте Vercel Postgres

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Storage → Add Database → Create Database
3. Выберите регион (ближайший к вам)
4. Скопируйте `POSTGRES_URL`

### Шаг 2: Настройте проект

```bash
cd c:\Users\User\LiveCodeInno

# Логин в Vercel
vercel login

# Инициализация проекта
vercel link
```

### Шаг 3: Добавьте переменные окружения

```bash
# Добавьте DATABASE_URL
vercel env add DATABASE_URL

# Вставьте ваш POSTGRES_URL при prompt
```

### Шаг 4: Деплой

```bash
# Деплой в production
vercel --prod
```

---

## 🎯 Вариант 2: Supabase (бесплатно)

### Шаг 1: Создайте Supabase проект

1. https://supabase.com
2. New Project
3. Скопируйте Connection String (URI mode)

### Шаг 2: Настройте Vercel

```bash
# Добавьте DATABASE_URL из Supabase
vercel env add DATABASE_URL

# Формат: postgresql://user:password@host:port/dbname
```

### Шаг 3: Деплой

```bash
vercel --prod
```

---

## 🎯 Вариант 3: Neon (бесплатный serverless PostgreSQL)

### Шаг 1: Создайте Neon

1. https://neon.tech
2. Sign Up
3. Create Project
4. Скопируйте Connection String

### Шаг 2: Настройте Vercel

```bash
vercel env add DATABASE_URL
```

### Шаг 3: Деплой

```bash
vercel --prod
```

---

## 📁 Структура проекта для Vercel

```
LiveCodeInno/
├── api/
│   └── index.py          # Vercel Serverless Functions
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── requirements.txt      # Python зависимости
├── vercel.json          # Vercel конфигурация
└── ...
```

---

## 🔧 Конфигурация

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

---

## 🌐 После деплоя

### URL вашего приложения:
```
https://your-project.vercel.app
```

### API endpoints:
```
https://your-project.vercel.app/api/health
https://your-project.vercel.app/api/rooms
https://your-project.vercel.app/api/rooms/{id}/leaderboard
```

### WebSocket:
```
wss://your-project.vercel.app/api/ws/rooms/{id}
wss://your-project.vercel.app/api/yjs/{id}
```

---

## 🐛 Troubleshooting

### Ошибка: "Database URL is required"

```bash
vercel env add DATABASE_URL your_postgres_url
vercel --prod
```

### Ошибка: "Module not found"

Проверьте `requirements.txt`:
```bash
cat requirements.txt
```

### Ошибка: "Build failed"

Проверьте логи:
```bash
vercel logs
```

### WebSocket не подключается

Убедитесь что используется `wss://` для production:
```typescript
const WS_BASE = window.location.protocol === 'https:' 
  ? 'wss:' 
  : 'ws:'
```

---

## 📊 Monitoring

### Просмотр логов:
```bash
vercel logs
```

### Логи в реальном времени:
```bash
vercel logs --follow
```

### Деплой история:
```bash
vercel ls
```

---

## 🔄 Обновление

Для обновления после изменений:

```bash
# Проверьте изменения
git status

# Закоммитьте
git add .
git commit -m "Update"

# Задеплойте
vercel --prod
```

---

## 💰 Тарифы

### Vercel Free:
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (10s timeout)
- ✅ Vercel Postgres (1MB storage)

### Vercel Pro ($20/month):
- ✅ 1TB bandwidth
- ✅ Serverless functions (60s timeout)
- ✅ Vercel Postgres (10GB storage)

---

## 🎁 Альтернативы

### Если нужно больше ресурсов:

1. **Railway** - backend с PostgreSQL
   - https://railway.app
   - $5/month

2. **Render** - backend с PostgreSQL
   - https://render.com
   - Free tier available

3. **Supabase** - PostgreSQL + Realtime
   - https://supabase.com
   - Free tier: 500MB

---

## ✅ Checklist

- [ ] Vercel аккаунт создан
- [ ] Vercel CLI установлен: `npm install -g vercel`
- [ ] База данных создана (Vercel Postgres/Supabase/Neon)
- [ ] DATABASE_URL добавлен в Vercel: `vercel env add DATABASE_URL`
- [ ] Проект залит на GitHub (опционально)
- [ ] Деплой выполнен: `vercel --prod`
- [ ] API работает: https://your-project.vercel.app/api/health
- [ ] WebSocket работает
- [ ] Frontend отображается

---

## 🎉 Готово!

Ваше приложение доступно по адресу:
```
https://your-project.vercel.app
```

Для обновления просто сделайте:
```bash
vercel --prod
```
