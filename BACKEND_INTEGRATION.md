# 🔌 Backend Integration Guide

**Last Updated**: November 18, 2025

---

## 📋 Overview

This guide explains how to connect the PlatNG Frontend to the backend microservices. The frontend is designed to work with 6 independent microservices.

---

## 🏗️ Backend Architecture

### Microservices Overview

| Service | Port | Base URL | Purpose |
|---------|------|----------|---------|
| **Auth Service** | 5001 | `/api/v1` | User authentication, registration, profile |
| **Event Service** | 5002 | `/api/v1` | Events, categories, venues, organizers |
| **Payments Service** | 5003 | `/api/v1` | Orders, tickets, Paystack integration |
| **Notifications Service** | 5004 | `/api/v1` | User notifications, email alerts |
| **Favorites Service** | 5005 | `/api/v1` | User favorites, likes |
| **Partner Service** | 5006 | `/api/v1` | Partner management, dashboards |

---

## ⚙️ Configuration

### Step 1: Create Environment File

Copy the example file and configure for your environment:

```bash
cp .env.example .env.local
```

### Step 2: Configure API URLs

**For Local Development:**

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

# App Configuration
NEXT_PUBLIC_APP_NAME=PlatNG
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

**For Production:**

```bash
# .env.production
NEXT_PUBLIC_AUTH_API=https://auth.platng.com/api/v1
NEXT_PUBLIC_EVENT_API=https://events.platng.com/api/v1
NEXT_PUBLIC_PAYMENTS_API=https://payments.platng.com/api/v1
NEXT_PUBLIC_NOTIFICATIONS_API=https://notifications.platng.com/api/v1
NEXT_PUBLIC_FAVORITES_API=https://favorites.platng.com/api/v1
NEXT_PUBLIC_PARTNER_API=https://partners.platng.com/api/v1

# Paystack LIVE key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

### Step 3: Restart Development Server

```bash
npm run dev
```

The frontend will automatically connect to the backend services!

---

## 🔐 Authentication Flow

### How It Works

1. **Login Request**:
   ```typescript
   // User enters email/password
   POST /auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Backend Response**:
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

3. **Frontend Stores Tokens**:
   - Access token → Memory (tokenStore)
   - Refresh token → Memory (tokenStore)
   - Session indicator → sessionStorage

4. **Subsequent Requests**:
   ```typescript
   // All API requests automatically include:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

5. **Token Refresh** (automatic):
   ```typescript
   // When access token expires (401):
   POST /auth/refresh
   // Frontend automatically retries original request
   ```

---

## 📡 API Endpoints Reference

### Auth Service (Port 5001)

```typescript
// Register
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+234 123 456 7890"
}

// Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Refresh Token
POST /auth/refresh
Headers: { Cookie: refresh_token=... }

// Get Current User
GET /auth/profile
Headers: { Authorization: Bearer ... }

// Update Profile
PATCH /auth/profile
Headers: { Authorization: Bearer ... }
{
  "full_name": "Jane Doe",
  "phone": "+234 987 654 3210"
}

// Change Password
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

### Event Service (Port 5002)

```typescript
// List Events (with filters)
GET /events?city=Lagos&category_id=1&is_free=true&page=1&limit=20
Headers: { Authorization: Bearer ... } // Optional

// Get Single Event
GET /events/123
Headers: { Authorization: Bearer ... } // Optional

// Search Events
GET /events/search?q=tech conference&city=Lagos

// Get Featured Events
GET /events/featured

// Get Upcoming Events
GET /events/upcoming?limit=10

// Get Categories
GET /categories

// Get Venues
GET /venues

// Get Organizers
GET /organizers
```

### Favorites Service (Port 5005)

```typescript
// Get User Favorites
GET /favorites
Headers: { Authorization: Bearer ... }

// Add to Favorites
POST /favorites
Headers: { Authorization: Bearer ... }
{
  "event_id": 123
}

// Remove from Favorites
DELETE /favorites/456
Headers: { Authorization: Bearer ... }
```

### Payments Service (Port 5003)

```typescript
// Create Order
POST /orders
Headers: { Authorization: Bearer ... }
{
  "event_id": 123,
  "tickets": [
    { "ticket_id": 1, "quantity": 2 },
    { "ticket_id": 2, "quantity": 1 }
  ]
}

// Get Order
GET /orders/789
Headers: { Authorization: Bearer ... }

// Verify Payment (Paystack callback)
POST /orders/verify
Headers: { Authorization: Bearer ... }
{
  "reference": "paystack-reference-123",
  "order_id": 789
}

// Get User Tickets
GET /tickets
Headers: { Authorization: Bearer ... }
```

### Notifications Service (Port 5004)

```typescript
// Get User Notifications
GET /notifications
Headers: { Authorization: Bearer ... }

// Mark as Read
PATCH /notifications/123/read
Headers: { Authorization: Bearer ... }

// Mark All as Read
POST /notifications/read-all
Headers: { Authorization: Bearer ... }
```

### Partner Service (Port 5006)

```typescript
// Get Partner Dashboard
GET /partners/dashboard
Headers: { Authorization: Bearer ... }

// Get Partner Events
GET /partners/events
Headers: { Authorization: Bearer ... }

// Get Partner Analytics
GET /partners/analytics?start_date=2025-01-01&end_date=2025-12-31
Headers: { Authorization: Bearer ... }
```

---

## 🔒 CORS Configuration

### Backend CORS Setup

Each backend service must allow requests from the frontend:

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

## 🧪 Testing Backend Connection

### Step 1: Check Backend is Running

```bash
# Test each service
curl http://localhost:5001/health  # Auth Service
curl http://localhost:5002/health  # Event Service
curl http://localhost:5003/health  # Payments Service
curl http://localhost:5004/health  # Notifications Service
curl http://localhost:5005/health  # Favorites Service
curl http://localhost:5006/health  # Partner Service
```

### Step 2: Test from Frontend

```bash
# Start frontend
npm run dev

# Open browser
open http://localhost:3000
```

### Step 3: Check Browser Console

Open DevTools → Console. You should see:
- ✅ No CORS errors
- ✅ API requests going to correct URLs
- ✅ 200 responses (or appropriate status codes)

### Step 4: Test Authentication

1. Go to `/en/register`
2. Create account
3. Check if token is received
4. Check if user is redirected to dashboard

---

## 🐛 Troubleshooting

### Problem: CORS Errors

**Error in Console:**
```
Access to fetch at 'http://localhost:5001/api/v1/auth/login'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
1. Enable CORS on backend (see CORS Configuration above)
2. Ensure `credentials: true` is set
3. Check allowed origins include `http://localhost:3000`

### Problem: 401 Unauthorized

**Error**: API returns 401 for protected routes

**Solution:**
1. Check if user is logged in: `tokenStore.getAccessToken()`
2. Check if token is expired
3. Try logging in again
4. Check backend JWT configuration

### Problem: Network Request Failed

**Error**: Network request failed / ERR_CONNECTION_REFUSED

**Solution:**
1. Verify backend service is running: `curl http://localhost:5001/health`
2. Check `.env.local` has correct URLs
3. Check firewall/antivirus not blocking ports
4. Restart backend services

### Problem: 404 Not Found

**Error**: API endpoint returns 404

**Solution:**
1. Verify backend route exists
2. Check API version in URL (`/api/v1/...`)
3. Check method (GET, POST, etc.) matches backend
4. Review backend logs for routing errors

### Problem: Token Refresh Not Working

**Error**: User gets logged out frequently

**Solution:**
1. Check refresh token cookie is set with `HttpOnly`
2. Verify `withCredentials: true` in axios config
3. Check backend refresh endpoint works
4. Ensure CORS allows credentials

---

## 📊 Request/Response Examples

### Complete Login Flow

**1. Frontend Request:**
```typescript
// User clicks "Login"
const { mutate: login } = useLogin();

login(
  { email: 'user@example.com', password: 'password123' },
  {
    onSuccess: (data) => {
      // Frontend automatically:
      // 1. Stores tokens in tokenStore
      // 2. Saves user in authStore
      // 3. Redirects to /discover
    }
  }
);
```

**2. HTTP Request:**
```http
POST http://localhost:5001/api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**3. Backend Response:**
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

**4. Frontend Storage:**
```typescript
// tokenStore (memory)
tokenStore.setAccessToken('eyJhbGciOiJIUzI1NiIs...');
tokenStore.setRefreshToken('refresh-token-from-cookie');

// authStore (persisted to localStorage)
authStore.setAuth(user, null); // token not persisted for security
```

**5. Subsequent Requests:**
```http
GET http://localhost:5002/api/v1/events HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 🔄 Data Sync

### Real-time Updates (Optional)

If backend supports WebSockets:

```typescript
// lib/websocket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_NOTIFICATIONS_API!, {
  auth: {
    token: tokenStore.getAccessToken()
  }
});

// Listen for notifications
socket.on('notification', (data) => {
  // Update UI
  queryClient.invalidateQueries(['notifications']);
});
```

### Polling for Updates

```typescript
// Automatically refetch every 30 seconds
const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  refetchInterval: 30000, // 30 seconds
});
```

---

## 📝 API Response Types

All API responses follow this structure:

**Success Response:**
```typescript
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful"
}
```

**Error Response:**
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

**Pagination Response:**
```typescript
{
  "success": true,
  "data": {
    "items": [/* array of items */],
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

## 🎯 Backend Requirements

### Minimum Backend Requirements

For the frontend to work correctly, backend must provide:

1. ✅ **Authentication endpoints** (`/auth/login`, `/auth/register`, `/auth/refresh`)
2. ✅ **CORS configuration** (allow frontend origin)
3. ✅ **JWT tokens** (access + refresh)
4. ✅ **Error responses** (consistent format)
5. ✅ **Pagination** (page, limit, total)

### Optional but Recommended

- Health check endpoints (`/health`)
- API versioning (`/api/v1`)
- Rate limiting
- Request logging
- WebSocket support for real-time updates

---

## 📚 Additional Resources

- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Query Documentation](https://tanstack.com/query/latest)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Backend Integration Guide Maintained By**: PlatNG Development Team
**Support**: dev@platng.com
