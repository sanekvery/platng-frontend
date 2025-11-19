# 🔌 Руководство по интеграции с бэкендом

**Последнее обновление**: 18 ноября 2025

---

## 📋 Обзор

Это руководство объясняет, как подключить фронтенд PlatNG к микросервисам бэкенда. Фронтенд разработан для работы с 6 независимыми микросервисами.

---

## 🏗️ Архитектура бэкенда

### Обзор микросервисов

| Сервис | Порт | Base URL | Назначение |
|--------|------|----------|------------|
| **Auth Service** | 5001 | `/api/v1` | Аутентификация пользователей, регистрация, профиль |
| **Event Service** | 5002 | `/api/v1` | События, категории, площадки, организаторы |
| **Payments Service** | 5003 | `/api/v1` | Заказы, билеты, интеграция с Paystack |
| **Notifications Service** | 5004 | `/api/v1` | Уведомления пользователей, email-алерты |
| **Favorites Service** | 5005 | `/api/v1` | Избранное пользователя, лайки |
| **Partner Service** | 5006 | `/api/v1` | Управление партнерами, дашборды |

---

## ⚙️ Настройка

### Шаг 1: Создайте файл окружения

Скопируйте пример файла и настройте для вашего окружения:

```bash
cp .env.example .env.local
```

### Шаг 2: Настройте URL API

**Для локальной разработки:**

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_AUTH_API=http://localhost:5001/api/v1
NEXT_PUBLIC_EVENT_API=http://localhost:5002/api/v1
NEXT_PUBLIC_PAYMENTS_API=http://localhost:5003/api/v1
NEXT_PUBLIC_NOTIFICATIONS_API=http://localhost:5004/api/v1
NEXT_PUBLIC_FAVORITES_API=http://localhost:5005/api/v1
NEXT_PUBLIC_PARTNER_API=http://localhost:5006/api/v1

# Paystack (Nigerian Payments)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Конфигурация приложения
NEXT_PUBLIC_APP_NAME=PlatNG
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

**Для Production:**

```bash
# .env.production
NEXT_PUBLIC_AUTH_API=https://auth.platng.com/api/v1
NEXT_PUBLIC_EVENT_API=https://events.platng.com/api/v1
NEXT_PUBLIC_PAYMENTS_API=https://payments.platng.com/api/v1
NEXT_PUBLIC_NOTIFICATIONS_API=https://notifications.platng.com/api/v1
NEXT_PUBLIC_FAVORITES_API=https://favorites.platng.com/api/v1
NEXT_PUBLIC_PARTNER_API=https://partners.platng.com/api/v1

# Paystack LIVE ключ
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

### Шаг 3: Перезапустите сервер разработки

```bash
npm run dev
```

Фронтенд автоматически подключится к бэкенд сервисам!

---

## 🔐 Процесс аутентификации

### Как это работает

1. **Запрос на вход**:
   ```typescript
   // Пользователь вводит email/пароль
   POST /auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Ответ бэкенда**:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIs...",
     "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
     "token_type": "Bearer",
     "user": {
       "id": 1,
       "email": "user@example.com",
       "full_name": "John Doe"
     }
   }
   ```

3. **Фронтенд сохраняет токены**:
   - Access token → Память (tokenStore)
   - Refresh token → Память (tokenStore)
   - Индикатор сессии → sessionStorage

4. **Последующие запросы**:
   ```typescript
   // Все API запросы автоматически включают:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

5. **Обновление токена** (автоматическое):
   ```typescript
   // Когда access token истекает (401):
   POST /auth/refresh
   // Фронтенд автоматически повторяет исходный запрос
   ```

---

## 📡 Справочник API эндпоинтов

### Auth Service (Порт 5001)

```typescript
// Регистрация
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+234 123 456 7890"
}

// Вход
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Обновление токена
POST /auth/refresh
Headers: { Cookie: refresh_token=... }

// Получить текущего пользователя
GET /auth/profile
Headers: { Authorization: Bearer ... }

// Обновить профиль
PATCH /auth/profile
Headers: { Authorization: Bearer ... }
{
  "full_name": "Jane Doe",
  "phone": "+234 987 654 3210"
}

// Изменить пароль
POST /auth/change-password
Headers: { Authorization: Bearer ... }
{
  "old_password": "password123",
  "new_password": "newpassword456"
}

// Google OAuth
POST /auth/google
{
  "token": "google-id-token"
}
```

### Event Service (Порт 5002)

```typescript
// Список событий (с фильтрами)
GET /events?city=Lagos&category_id=1&is_free=true&page=1&limit=20
Headers: { Authorization: Bearer ... } // Опционально

// Получить одно событие
GET /events/123
Headers: { Authorization: Bearer ... } // Опционально

// Поиск событий
GET /events/search?q=tech conference&city=Lagos

// Получить избранные события
GET /events/featured

// Получить предстоящие события
GET /events/upcoming?limit=10

// Получить категории
GET /categories

// Получить площадки
GET /venues

// Получить организаторов
GET /organizers
```

### Favorites Service (Порт 5005)

```typescript
// Получить избранное пользователя
GET /favorites
Headers: { Authorization: Bearer ... }

// Добавить в избранное
POST /favorites
Headers: { Authorization: Bearer ... }
{
  "event_id": 123
}

// Удалить из избранного
DELETE /favorites/456
Headers: { Authorization: Bearer ... }
```

### Payments Service (Порт 5003)

```typescript
// Создать заказ
POST /orders
Headers: { Authorization: Bearer ... }
{
  "event_id": 123,
  "tickets": [
    { "ticket_id": 1, "quantity": 2 },
    { "ticket_id": 2, "quantity": 1 }
  ]
}

// Получить заказ
GET /orders/789
Headers: { Authorization: Bearer ... }

// Верифицировать платеж (Paystack callback)
POST /orders/verify
Headers: { Authorization: Bearer ... }
{
  "reference": "paystack-reference-123",
  "order_id": 789
}

// Получить билеты пользователя
GET /tickets
Headers: { Authorization: Bearer ... }
```

### Notifications Service (Порт 5004)

```typescript
// Получить уведомления пользователя
GET /notifications
Headers: { Authorization: Bearer ... }

// Отметить как прочитанное
PATCH /notifications/123/read
Headers: { Authorization: Bearer ... }

// Отметить все как прочитанные
POST /notifications/read-all
Headers: { Authorization: Bearer ... }
```

### Partner Service (Порт 5006)

```typescript
// Получить дашборд партнера
GET /partners/dashboard
Headers: { Authorization: Bearer ... }

// Получить события партнера
GET /partners/events
Headers: { Authorization: Bearer ... }

// Получить аналитику партнера
GET /partners/analytics?start_date=2025-01-01&end_date=2025-12-31
Headers: { Authorization: Bearer ... }
```

---

## 🔒 Настройка CORS

### Настройка CORS на бэкенде

Каждый бэкенд сервис должен разрешать запросы с фронтенда:

```python
# Python (FastAPI/Flask)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "https://platng.com",      # Production
        "https://www.platng.com",  # Production www
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```javascript
// Node.js (Express)
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://platng.com',
    'https://www.platng.com'
  ],
  credentials: true
}));
```

---

## 🧪 Тестирование подключения к бэкенду

### Шаг 1: Проверьте что бэкенд запущен

```bash
# Тест каждого сервиса
curl http://localhost:5001/health  # Auth Service
curl http://localhost:5002/health  # Event Service
curl http://localhost:5003/health  # Payments Service
curl http://localhost:5004/health  # Notifications Service
curl http://localhost:5005/health  # Favorites Service
curl http://localhost:5006/health  # Partner Service
```

### Шаг 2: Тест с фронтенда

```bash
# Запустите фронтенд
npm run dev

# Откройте браузер
open http://localhost:3000
```

### Шаг 3: Проверьте консоль браузера

Откройте DevTools → Console. Вы должны увидеть:
- ✅ Нет CORS ошибок
- ✅ API запросы идут на правильные URL
- ✅ 200 ответы (или соответствующие коды статусов)

### Шаг 4: Тест аутентификации

1. Перейдите на `/en/register`
2. Создайте аккаунт
3. Проверьте что токен получен
4. Проверьте что пользователь перенаправлен на дашборд

---

## 🐛 Устранение неполадок

### Проблема: CORS ошибки

**Ошибка в консоли:**
```
Access to fetch at 'http://localhost:5001/api/v1/auth/login'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Решение:**
1. Включите CORS на бэкенде (см. Настройка CORS выше)
2. Убедитесь что `credentials: true` установлен
3. Проверьте что разрешенные origins включают `http://localhost:3000`

### Проблема: 401 Unauthorized

**Ошибка**: API возвращает 401 для защищенных маршрутов

**Решение:**
1. Проверьте что пользователь залогинен: `tokenStore.getAccessToken()`
2. Проверьте что токен не истек
3. Попробуйте войти снова
4. Проверьте JWT конфигурацию бэкенда

### Проблема: Network Request Failed

**Ошибка**: Network request failed / ERR_CONNECTION_REFUSED

**Решение:**
1. Проверьте что бэкенд сервис запущен: `curl http://localhost:5001/health`
2. Проверьте что `.env.local` имеет правильные URL
3. Проверьте что firewall/антивирус не блокирует порты
4. Перезапустите бэкенд сервисы

### Проблема: 404 Not Found

**Ошибка**: API эндпоинт возвращает 404

**Решение:**
1. Проверьте что бэкенд маршрут существует
2. Проверьте версию API в URL (`/api/v1/...`)
3. Проверьте что метод (GET, POST, и т.д.) совпадает с бэкендом
4. Просмотрите логи бэкенда на ошибки маршрутизации

### Проблема: Обновление токена не работает

**Ошибка**: Пользователь часто разлогинивается

**Решение:**
1. Проверьте что refresh token cookie установлена с `HttpOnly`
2. Проверьте `withCredentials: true` в axios конфиге
3. Проверьте что эндпоинт обновления бэкенда работает
4. Убедитесь что CORS разрешает credentials

---

## 📊 Примеры запросов/ответов

### Полный процесс входа

**1. Запрос фронтенда:**
```typescript
// Пользователь нажимает "Войти"
const { mutate: login } = useLogin();

login(
  { email: 'user@example.com', password: 'password123' },
  {
    onSuccess: (data) => {
      // Фронтенд автоматически:
      // 1. Сохраняет токены в tokenStore
      // 2. Сохраняет пользователя в authStore
      // 3. Перенаправляет на /discover
    }
  }
);
```

**2. HTTP запрос:**
```http
POST http://localhost:5001/api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**3. Ответ бэкенда:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_verified": true
  }
}
```

**4. Хранилище фронтенда:**
```typescript
// tokenStore (память)
tokenStore.setAccessToken('eyJhbGciOiJIUzI1NiIs...');
tokenStore.setRefreshToken('refresh-token-from-cookie');

// authStore (сохраняется в localStorage)
authStore.setAuth(user, null); // токен не сохраняется для безопасности
```

**5. Последующие запросы:**
```http
GET http://localhost:5002/api/v1/events HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 🔄 Синхронизация данных

### Real-time обновления (Опционально)

Если бэкенд поддерживает WebSockets:

```typescript
// lib/websocket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_NOTIFICATIONS_API!, {
  auth: {
    token: tokenStore.getAccessToken()
  }
});

// Слушайте уведомления
socket.on('notification', (data) => {
  // Обновите UI
  queryClient.invalidateQueries(['notifications']);
});
```

### Polling для обновлений

```typescript
// Автоматическое обновление каждые 30 секунд
const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  refetchInterval: 30000, // 30 секунд
});
```

---

## 📝 Типы API ответов

Все API ответы следуют этой структуре:

**Успешный ответ:**
```typescript
{
  "success": true,
  "data": { /* фактические данные */ },
  "message": "Operation successful"
}
```

**Ответ с ошибкой:**
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "constraint": "email"
    }
  }
}
```

**Ответ с пагинацией:**
```typescript
{
  "success": true,
  "data": {
    "items": [/* массив элементов */],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

## 🎯 Требования к бэкенду

### Минимальные требования к бэкенду

Для корректной работы фронтенда, бэкенд должен предоставлять:

1. ✅ **Эндпоинты аутентификации** (`/auth/login`, `/auth/register`, `/auth/refresh`)
2. ✅ **Настройку CORS** (разрешить origin фронтенда)
3. ✅ **JWT токены** (access + refresh)
4. ✅ **Ответы с ошибками** (консистентный формат)
5. ✅ **Пагинация** (page, limit, total)

### Опционально, но рекомендуется

- Эндпоинты проверки здоровья (`/health`)
- Версионирование API (`/api/v1`)
- Rate limiting
- Логирование запросов
- WebSocket поддержка для real-time обновлений

---

## 📚 Дополнительные ресурсы

- [Документация Axios](https://axios-http.com/docs/intro)
- [Документация React Query](https://tanstack.com/query/latest)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Документация CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Руководство по интеграции с бэкендом поддерживается**: PlatNG Development Team
**Поддержка**: dev@platng.com
