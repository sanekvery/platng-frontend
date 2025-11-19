# 🚀 PlatNG Frontend - Руководство по развертыванию

**Последнее обновление**: 18 ноября 2025

---

## 📋 Чек-лист перед развертыванием

### Необходимые инструменты
- ✅ Node.js 18+
- ✅ npm или yarn
- ✅ Git
- ✅ Работающие микросервисы бэкенда (порты 5001-5006)

### Требования к окружению
- ✅ `.env.local` настроен со всеми URL API
- ✅ Ключи API Paystack (тестовые для staging, боевые для production)
- ✅ Учетные данные Google OAuth (опционально)
- ✅ Настроенное доменное имя (для production)

---

## 🏗️ Варианты развертывания

### Вариант 1: Vercel (Рекомендуется)

**Почему Vercel?**
- Нативная поддержка Next.js
- Развертывание без настройки
- Автоматический HTTPS
- Глобальная CDN
- Встроенные превью-развертывания

**Шаги:**

1. **Установите Vercel CLI**
```bash
npm i -g vercel
```

2. **Войдите в Vercel**
```bash
vercel login
```

3. **Настройте переменные окружения**
```bash
# Добавьте все переменные из .env.example
vercel env add NEXT_PUBLIC_AUTH_API
vercel env add NEXT_PUBLIC_EVENT_API
vercel env add NEXT_PUBLIC_FAVORITES_API
vercel env add NEXT_PUBLIC_NOTIFICATIONS_API
vercel env add NEXT_PUBLIC_PARTNER_API
vercel env add NEXT_PUBLIC_PAYMENTS_API
vercel env add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

4. **Разверните**
```bash
# Превью-развертывание
vercel

# Production развертывание
vercel --prod
```

5. **Настройте кастомный домен (Опционально)**
```bash
vercel domains add your-domain.com
```

**Конфигурация Vercel** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://platng.com"
  }
}
```

---

### Вариант 2: Docker + Docker Compose

**Преимущества:**
- Консистентное окружение
- Легко масштабируется
- Работает везде, где работает Docker

**Dockerfile:**
```dockerfile
# Базовый образ
FROM node:18-alpine AS base

# Установка зависимостей только когда нужно
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Пересборка исходного кода только когда нужно
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Установка переменных окружения для сборки
ARG NEXT_PUBLIC_AUTH_API
ARG NEXT_PUBLIC_EVENT_API
ARG NEXT_PUBLIC_FAVORITES_API
ARG NEXT_PUBLIC_NOTIFICATIONS_API
ARG NEXT_PUBLIC_PARTNER_API
ARG NEXT_PUBLIC_PAYMENTS_API
ARG NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_AUTH_API=$NEXT_PUBLIC_AUTH_API
ENV NEXT_PUBLIC_EVENT_API=$NEXT_PUBLIC_EVENT_API
ENV NEXT_PUBLIC_FAVORITES_API=$NEXT_PUBLIC_FAVORITES_API
ENV NEXT_PUBLIC_NOTIFICATIONS_API=$NEXT_PUBLIC_NOTIFICATIONS_API
ENV NEXT_PUBLIC_PARTNER_API=$NEXT_PUBLIC_PARTNER_API
ENV NEXT_PUBLIC_PAYMENTS_API=$NEXT_PUBLIC_PAYMENTS_API
ENV NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=$NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npm run build

# Production образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_AUTH_API=${NEXT_PUBLIC_AUTH_API}
        - NEXT_PUBLIC_EVENT_API=${NEXT_PUBLIC_EVENT_API}
        - NEXT_PUBLIC_FAVORITES_API=${NEXT_PUBLIC_FAVORITES_API}
        - NEXT_PUBLIC_NOTIFICATIONS_API=${NEXT_PUBLIC_NOTIFICATIONS_API}
        - NEXT_PUBLIC_PARTNER_API=${NEXT_PUBLIC_PARTNER_API}
        - NEXT_PUBLIC_PAYMENTS_API=${NEXT_PUBLIC_PAYMENTS_API}
        - NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=${NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}
        - NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - platng-network

networks:
  platng-network:
    external: true
```

**Развертывание с Docker:**
```bash
# Сборка образа
docker build -t platng-frontend .

# Запуск контейнера
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_AUTH_API="https://api.platng.com/auth" \
  -e NEXT_PUBLIC_EVENT_API="https://api.platng.com/events" \
  platng-frontend

# Или используйте docker-compose
docker-compose up -d
```

---

### Вариант 3: Традиционный VPS (Ubuntu/Debian)

**Требования:**
- Ubuntu 20.04+ или Debian 11+
- Nginx
- PM2 менеджер процессов
- SSL сертификат (Let's Encrypt)

**Шаги:**

1. **Установите Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Установите PM2**
```bash
sudo npm install -g pm2
```

3. **Клонируйте репозиторий**
```bash
git clone https://github.com/your-org/platng-frontend.git
cd platng-frontend
```

4. **Установите зависимости**
```bash
npm ci
```

5. **Настройте окружение**
```bash
cp .env.example .env.local
nano .env.local  # Отредактируйте production значениями
```

6. **Соберите приложение**
```bash
npm run build
```

7. **Запустите с PM2**
```bash
pm2 start npm --name "platng-frontend" -- start
pm2 save
pm2 startup
```

8. **Настройте Nginx**
```nginx
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

9. **Настройте SSL с Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d platng.com -d www.platng.com
```

10. **Автозапуск при перезагрузке**
```bash
pm2 startup systemd
pm2 save
```

---

## 🔐 Переменные окружения

### Production конфигурация

**`.env.production` (для времени сборки):**
```bash
# URL API бэкенда (Production)
NEXT_PUBLIC_AUTH_API=https://api.platng.com/v1
NEXT_PUBLIC_EVENT_API=https://events.platng.com/v1
NEXT_PUBLIC_FAVORITES_API=https://favorites.platng.com/v1
NEXT_PUBLIC_NOTIFICATIONS_API=https://notifications.platng.com/v1
NEXT_PUBLIC_PARTNER_API=https://partners.platng.com/v1
NEXT_PUBLIC_PAYMENTS_API=https://payments.platng.com/v1

# Paystack LIVE ключи
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# Google OAuth (Production)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com

# Конфигурация приложения
NEXT_PUBLIC_APP_NAME=PlatNG
NEXT_PUBLIC_APP_URL=https://platng.com
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

### Staging конфигурация

**`.env.staging`:**
```bash
# URL API бэкенда (Staging)
NEXT_PUBLIC_AUTH_API=https://staging-api.platng.com/v1
NEXT_PUBLIC_EVENT_API=https://staging-events.platng.com/v1
NEXT_PUBLIC_FAVORITES_API=https://staging-favorites.platng.com/v1
NEXT_PUBLIC_NOTIFICATIONS_API=https://staging-notifications.platng.com/v1
NEXT_PUBLIC_PARTNER_API=https://staging-partners.platng.com/v1
NEXT_PUBLIC_PAYMENTS_API=https://staging-payments.platng.com/v1

# Paystack TEST ключи
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Google OAuth (Staging)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-staging-client-id.apps.googleusercontent.com

# Конфигурация приложения
NEXT_PUBLIC_APP_NAME=PlatNG Staging
NEXT_PUBLIC_APP_URL=https://staging.platng.com
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## 🧪 Тестирование перед развертыванием

### 1. Запустите production сборку локально
```bash
npm run build
npm run start
```

### 2. Протестируйте все критические пути
- [ ] Главная страница загружается
- [ ] Пользователь может зарегистрироваться
- [ ] Пользователь может войти
- [ ] События отображаются корректно
- [ ] Поиск работает
- [ ] Избранное добавление/удаление
- [ ] Процесс покупки билетов
- [ ] Оплата через Paystack
- [ ] Мобильная навигация

### 3. Проверки производительности
```bash
npm run build
# Проверьте размер bundle в выводе

# Используйте Lighthouse для аудита производительности
npx lighthouse https://platng.com --view
```

### 4. Аудит безопасности
```bash
npm audit
npm audit fix
```

---

## 📊 Мониторинг и логирование

### Рекомендуемые сервисы

**Отслеживание ошибок:**
- Sentry (рекомендуется)
- Bugsnag
- Rollbar

**Аналитика:**
- Google Analytics 4
- Mixpanel
- PostHog

**Мониторинг производительности:**
- Vercel Analytics (если используете Vercel)
- New Relic
- Datadog

**Мониторинг доступности:**
- UptimeRobot
- Pingdom
- Better Uptime

---

## 🔄 CI/CD Pipeline

### Пример GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

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
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_AUTH_API: ${{ secrets.NEXT_PUBLIC_AUTH_API }}
          NEXT_PUBLIC_EVENT_API: ${{ secrets.NEXT_PUBLIC_EVENT_API }}
          NEXT_PUBLIC_FAVORITES_API: ${{ secrets.NEXT_PUBLIC_FAVORITES_API }}
          NEXT_PUBLIC_NOTIFICATIONS_API: ${{ secrets.NEXT_PUBLIC_NOTIFICATIONS_API }}
          NEXT_PUBLIC_PARTNER_API: ${{ secrets.NEXT_PUBLIC_PARTNER_API }}
          NEXT_PUBLIC_PAYMENTS_API: ${{ secrets.NEXT_PUBLIC_PAYMENTS_API }}
          NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: ${{ secrets.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🔧 Задачи после развертывания

### 1. Проверьте развертывание
- [ ] Главная страница загружается
- [ ] Тест login/register
- [ ] Проверьте подключения к API
- [ ] Тест процесса оплаты
- [ ] Проверьте мобильную адаптивность

### 2. Настройте мониторинг
- [ ] Настройте отслеживание ошибок (Sentry)
- [ ] Настройте аналитику (Google Analytics)
- [ ] Включите мониторинг доступности
- [ ] Настройте алерты

### 3. Оптимизация производительности
- [ ] Включите кеширование CDN
- [ ] Настройте оптимизацию изображений
- [ ] Настройте Redis для кеширования (опционально)
- [ ] Включите Brotli сжатие

### 4. Безопасность
- [ ] Включите HTTPS (принудительный SSL)
- [ ] Правильно настройте CORS
- [ ] Установите security headers
- [ ] Включите rate limiting

---

## 🆘 Устранение неполадок

### Сборка не удалась

**Ошибка**: `Module not found`
```bash
# Очистите кеш и переустановите
rm -rf .next node_modules
npm ci
npm run build
```

**Ошибка**: `Type errors`
```bash
# Проверьте TypeScript
npm run type-check
```

### Ошибки runtime

**Ошибка**: `API calls failing`
- Проверьте что переменные окружения установлены
- Убедитесь что бэкенд сервисы запущены
- Проверьте CORS конфигурацию на бэкенде

**Ошибка**: `Images not loading`
- Проверьте что `next.config.js` имеет правильные `remotePatterns`
- Проверьте конфигурацию CDN

### Проблемы производительности

**Медленная загрузка страниц:**
- Проверьте размер bundle: `npm run build`
- Включите caching headers
- Используйте CDN для статических ресурсов
- Оптимизируйте изображения

---

## 📝 План отката

### Vercel
```bash
# Список развертываний
vercel ls

# Откат к предыдущему
vercel rollback [deployment-url]
```

### Docker
```bash
# Список образов
docker images

# Откат к предыдущему образу
docker run -p 3000:3000 platng-frontend:previous-tag
```

### PM2
```bash
# Checkout предыдущего коммита
git checkout [previous-commit-hash]

# Пересборка и перезапуск
npm run build
pm2 restart platng-frontend
```

---

## 🎯 Целевые показатели производительности

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Дополнительные метрики:**
- Time to First Byte (TTFB): < 600ms
- First Contentful Paint (FCP): < 1.8s
- Speed Index: < 3.4s

---

## 📚 Дополнительные ресурсы

- [Документация Next.js Deployment](https://nextjs.org/docs/deployment)
- [Документация Vercel](https://vercel.com/docs)
- [Документация Docker](https://docs.docker.com/)
- [Документация PM2](https://pm2.keymetrics.io/docs/)
- [Документация Nginx](https://nginx.org/en/docs/)

---

**Руководство поддерживается**: PlatNG Development Team
**Поддержка**: dev@platng.com
