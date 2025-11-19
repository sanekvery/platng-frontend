# 🚀 PlatNG Frontend - Deployment Guide

**Инструкции для деплоя фронтенда**

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Создайте файл `.env.production`:

```bash
# Production API URLs (замените на реальные URL)
NEXT_PUBLIC_API_BASE_URL=https://api.platng.com
NEXT_PUBLIC_AUTH_API=https://api.platng.com/api/v1
NEXT_PUBLIC_EVENT_API=https://events-api.platng.com/api/v1
NEXT_PUBLIC_FAVORITES_API=https://favorites-api.platng.com/api/v1
NEXT_PUBLIC_NOTIFICATIONS_API=https://notifications-api.platng.com/api/v1
NEXT_PUBLIC_PARTNER_API=https://partner-api.platng.com/api/v1

# Google OAuth (продакшн)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_google_client_id

# Paystack (продакшн)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_NAME=PlatNG
NEXT_PUBLIC_APP_URL=https://platng.com
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

### 2. Build Verification

```bash
# Проверка TypeScript
npm run type-check

# Проверка линтера
npm run lint

# Форматирование кода
npm run format

# Production build
npm run build

# Проверка production build
npm run start
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Почему Vercel:**
- ✅ Создана командой Next.js
- ✅ Автоматический деплой из Git
- ✅ Edge Network (CDN)
- ✅ Serverless Functions
- ✅ Automatic HTTPS
- ✅ Preview deployments для PR

**Шаги:**

1. **Подключите GitHub/GitLab**
   ```bash
   # Создайте Git репозиторий (если еще нет)
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Импортируйте проект в Vercel**
   - Зайдите на https://vercel.com
   - Click "Add New" → "Project"
   - Импортируйте ваш GitHub репозиторий
   - Vercel автоматически определит Next.js

3. **Настройте Environment Variables**
   - Settings → Environment Variables
   - Добавьте все переменные из `.env.production`
   - Отдельно для Production, Preview, Development

4. **Deploy**
   ```bash
   # Vercel CLI (опционально)
   npm i -g vercel
   vercel --prod
   ```

**Результат**: Ваш сайт будет на `https://your-project.vercel.app`

---

### Option 2: Netlify

**Шаги:**

1. **netlify.toml** (создайте в корне проекта)
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy**
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod
   ```

---

### Option 3: Docker (Self-Hosted)

**Dockerfile:**

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Build & Run:**
```bash
# Build image
docker build -t platng-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.platng.com \
  -e NEXT_PUBLIC_AUTH_API=https://api.platng.com/api/v1 \
  platng-frontend
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=https://api.platng.com
      - NEXT_PUBLIC_AUTH_API=https://api.platng.com/api/v1
      - NEXT_PUBLIC_EVENT_API=https://events-api.platng.com/api/v1
      - NEXT_PUBLIC_FAVORITES_API=https://favorites-api.platng.com/api/v1
      - NEXT_PUBLIC_NOTIFICATIONS_API=https://notifications-api.platng.com/api/v1
      - NEXT_PUBLIC_PARTNER_API=https://partner-api.platng.com/api/v1
      - NEXT_PUBLIC_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=${PAYSTACK_PUBLIC_KEY}
    restart: unless-stopped
    networks:
      - platng-network

networks:
  platng-network:
    external: true
```

---

### Option 4: Traditional Server (Ubuntu/Nginx)

**1. Install Node.js on server:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**2. Clone and build:**
```bash
cd /var/www
git clone <your-repo>
cd platng-frontend
npm install
npm run build
```

**3. PM2 for process management:**
```bash
sudo npm install -g pm2
pm2 start npm --name "platng-frontend" -- start
pm2 save
pm2 startup
```

**4. Nginx reverse proxy:**
```nginx
# /etc/nginx/sites-available/platng.com
server {
    listen 80;
    server_name platng.com www.platng.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**5. Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/platng.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**6. SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d platng.com -d www.platng.com
```

---

## 🔧 Backend Integration

### Important: API URLs

**Local Development:**
```bash
NEXT_PUBLIC_AUTH_API=http://localhost:5001/api/v1
NEXT_PUBLIC_EVENT_API=http://localhost:5002/api/v1
# etc...
```

**Production:**
```bash
# Option 1: Single domain with path routing
NEXT_PUBLIC_AUTH_API=https://api.platng.com/auth/api/v1
NEXT_PUBLIC_EVENT_API=https://api.platng.com/events/api/v1

# Option 2: Subdomains
NEXT_PUBLIC_AUTH_API=https://auth.platng.com/api/v1
NEXT_PUBLIC_EVENT_API=https://events.platng.com/api/v1
```

### CORS Configuration

**Backend должен разрешить:**
```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://platng.com",
        "https://www.platng.com",
        "https://*.vercel.app"  # для preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Cookies для Refresh Token

**Backend должен установить:**
```python
response.set_cookie(
    key="refresh_token",
    value=refresh_token,
    httponly=True,
    secure=True,  # HTTPS only в продакшн
    samesite="lax",
    domain=".platng.com",  # для работы на поддоменах
    max_age=60*60*24*7  # 7 days
)
```

---

## 📊 Performance Optimization

### 1. Image Optimization

**next.config.js уже настроен:**
```javascript
images: {
  formats: ['image/webp', 'image/avif'],
  domains: ['cdn.platng.com', '*.amazonaws.com'],
}
```

**Добавьте CDN домены по мере необходимости**

### 2. Caching Headers

**Nginx:**
```nginx
location /_next/static {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location /images {
    add_header Cache-Control "public, max-age=86400";
}
```

### 3. Compression

**Уже включено в Next.js:**
```javascript
// next.config.js
compress: true,
```

---

## 🔐 Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables не в Git
- [ ] `.env.local` в `.gitignore`
- [ ] CORS правильно настроен на backend
- [ ] Cookies secure в production
- [ ] CSP headers настроены (опционально)
- [ ] Rate limiting на API
- [ ] XSS protection headers

**Security Headers (Vercel/Netlify):**

`vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🧪 Testing Before Deploy

```bash
# 1. Локальный production build
npm run build
npm run start
# Открыть http://localhost:3000

# 2. Проверить все страницы
- http://localhost:3000/
- http://localhost:3000/discover
- http://localhost:3000/login
- http://localhost:3000/events/123

# 3. Проверить API connections
# В DevTools → Network
# Убедитесь что запросы идут к правильным URLs

# 4. Проверить мобильную версию
# DevTools → Toggle device toolbar
```

---

## 🚨 Common Issues

### Issue 1: API не доступен

**Проблема:** `Failed to fetch` ошибки

**Решение:**
```bash
# Проверьте environment variables
console.log(process.env.NEXT_PUBLIC_AUTH_API)

# Проверьте CORS на backend
curl -H "Origin: https://platng.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.platng.com/api/v1/events
```

### Issue 2: Cookies не работают

**Проблема:** Refresh token не сохраняется

**Решение:**
- Проверьте `withCredentials: true` в axios
- Проверьте `SameSite=Lax` на backend
- Проверьте `domain` в cookie (должен совпадать)

### Issue 3: Build fails

**Проблема:** TypeScript errors во время build

**Решение:**
```bash
npm run type-check
# Исправьте все ошибки перед деплоем
```

---

## 📈 Monitoring

### Vercel Analytics
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🔄 CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Type check
        run: npm run type-check

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
```

---

## 📝 Deployment Checklist

**Before Deploy:**
- [ ] All tests passing
- [ ] TypeScript no errors
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Backend APIs accessible
- [ ] CORS configured on backend
- [ ] SSL certificate ready

**After Deploy:**
- [ ] Test homepage
- [ ] Test API integration
- [ ] Test authentication flow
- [ ] Test on mobile device
- [ ] Check performance (Lighthouse)
- [ ] Monitor error logs
- [ ] Check analytics working

---

## 🎯 Performance Targets

**Production должен соответствовать:**
- Lighthouse Performance: >90
- First Contentful Paint: <2s
- Time to Interactive: <5s
- Total Bundle Size: <1MB
- Core Web Vitals: All green

---

**Ready to Deploy! 🚀**

*Last Updated: November 17, 2025*
