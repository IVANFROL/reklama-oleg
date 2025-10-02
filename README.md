# Корпоративный сайт с личным кабинетом

Веб-приложение с функционалом личного кабинета, просмотра рекламы и системы заявок.

## Технологии

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js 14 с TypeScript
- **База данных**: SQLite (можно заменить на PostgreSQL)
- **Стили**: Tailwind CSS

## Функционал

### Для пользователей:
- Регистрация и авторизация
- Просмотр баланса игровой валюты
- Просмотр рекламы с получением награды
- Отправка заявок
- Просмотр статуса своих заявок

### Для администратора:
- Просмотр всех заявок
- Изменение статуса заявок (одобрить/отклонить)
- Фильтрация заявок по статусу

## Установка и запуск

### Backend (FastAPI)

1. Перейдите в папку backend:
```bash
cd backend
```

2. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Запустите сервер:
```bash
python main.py
```

Backend будет доступен по адресу: http://localhost:8000

### Frontend (Next.js)

1. Перейдите в папку frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите сервер разработки:
```bash
npm run dev
```

Frontend будет доступен по адресу: http://localhost:3000

## API Endpoints

### Аутентификация
- `POST /register` - Регистрация пользователя
- `POST /token` - Авторизация
- `GET /me` - Получение данных текущего пользователя
- `GET /balance` - Получение баланса пользователя

### Реклама
- `GET /ads` - Получение списка доступной рекламы
- `POST /ads/view` - Просмотр рекламы (получение награды)

### Заявки
- `POST /applications` - Создание заявки
- `GET /applications` - Получение заявок пользователя
- `GET /admin/applications` - Получение всех заявок (админ)
- `PUT /admin/applications/{id}` - Обновление статуса заявки

## Структура проекта

```
├── backend/
│   ├── main.py              # Основной файл FastAPI
│   ├── models.py            # Модели базы данных
│   ├── schemas.py           # Pydantic схемы
│   ├── auth.py              # Аутентификация
│   ├── database.py          # Настройка базы данных
│   ├── config.py            # Конфигурация
│   └── requirements.txt     # Python зависимости
├── frontend/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React компоненты
│   ├── lib/                 # Утилиты и API клиент
│   └── package.json         # Node.js зависимости
└── README.md
```

## Использование

1. Запустите backend и frontend серверы
2. Откройте http://localhost:3000 в браузере
3. Зарегистрируйтесь или войдите в систему
4. Просматривайте рекламу для получения игровой валюты
5. Отправляйте заявки через личный кабинет
6. Для админ панели перейдите на http://localhost:3000/admin

## Настройка базы данных

По умолчанию используется SQLite. Для продакшена рекомендуется PostgreSQL:

1. Установите PostgreSQL
2. Создайте базу данных
3. Обновите `DATABASE_URL` в `backend/config.py`
4. Установите `psycopg2-binary` вместо `psycopg2-binary` в `requirements.txt`
# reklama-oleg
