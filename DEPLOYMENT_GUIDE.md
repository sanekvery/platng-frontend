# 🚀 PlatNG Frontend - Deployment Guide

**Last Updated**: November 18, 2025

---

## 📋 Pre-Deployment Checklist

### Required Tools
- ✅ Node.js 18+
- ✅ npm or yarn
- ✅ Git
- ✅ Backend microservices running (ports 5001-5006)

### Environment Requirements
- ✅ `.env.local` configured with all API URLs
- ✅ Paystack API keys (test for staging, live for production)
- ✅ Google OAuth credentials (optional)
- ✅ Domain name configured (for production)

---

## 🏗️ Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Native Next.js support
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Built-in preview deployments

**Steps:**

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Configure Environment Variables**
```bash
# Add all variables from .env.example
vercel env add NEXT_PUBLIC_AUTH_API
vercel env add NEXT_PUBLIC_EVENT_API
vercel env add NEXT_PUBLIC_FAVORITES_API
vercel env add NEXT_PUBLIC_NOTIFICATIONS_API
vercel env add NEXT_PUBLIC_PARTNER_API
vercel env add NEXT_PUBLIC_PAYMENTS_API
vercel env add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

4. **Deploy**
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

5. **Configure Custom Domain (Optional)**
```bash
vercel domains add your-domain.com
```

**Vercel Configuration** (`vercel.json`):
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

### Option 2: Docker + Docker Compose

**Advantages:**
- Consistent environment
- Easy to scale
- Works anywhere Docker runs

**Dockerfile:**
```dockerfile
# Base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
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

# Production image
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

**Deploy with Docker:**
```bash
# Build image
docker build -t platng-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_AUTH_API="https://api.platng.com/auth" \
  -e NEXT_PUBLIC_EVENT_API="https://api.platng.com/events" \
  platng-frontend

# Or use docker-compose
docker-compose up -d
```

---

### Option 3: Traditional VPS (Ubuntu/Debian)

**Requirements:**
- Ubuntu 20.04+ or Debian 11+
- Nginx
- PM2 process manager
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install PM2**
```bash
sudo npm install -g pm2
```

3. **Clone Repository**
```bash
git clone https://github.com/your-org/platng-frontend.git
cd platng-frontend
```

4. **Install Dependencies**
```bash
npm ci
```

5. **Configure Environment**
```bash
cp .env.example .env.local
nano .env.local  # Edit with production values
```

6. **Build Application**
```bash
npm run build
```

7. **Start with PM2**
```bash
pm2 start npm --name "platng-frontend" -- start
pm2 save
pm2 startup
```

8. **Configure Nginx**
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

9. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d platng.com -d www.platng.com
```

10. **Auto-restart on reboot**
```bash
pm2 startup systemd
pm2 save
```

---

## 🔐 Environment Variables

### Production Configuration

**`.env.production` (for build time):**
```bash
# Backend API URLs (Production)
NEXT_PUBLIC_AUTH_API=https://api.platng.com/v1
NEXT_PUBLIC_EVENT_API=https://events.platng.com/v1
NEXT_PUBLIC_FAVORITES_API=https://favorites.platng.com/v1
NEXT_PUBLIC_NOTIFICATIONS_API=https://notifications.platng.com/v1
NEXT_PUBLIC_PARTNER_API=https://partners.platng.com/v1
NEXT_PUBLIC_PAYMENTS_API=https://payments.platng.com/v1

# Paystack LIVE Keys
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# Google OAuth (Production)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com

# App Configuration
NEXT_PUBLIC_APP_NAME=PlatNG
NEXT_PUBLIC_APP_URL=https://platng.com
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

### Staging Configuration

**`.env.staging`:**
```bash
# Backend API URLs (Staging)
NEXT_PUBLIC_AUTH_API=https://staging-api.platng.com/v1
NEXT_PUBLIC_EVENT_API=https://staging-events.platng.com/v1
NEXT_PUBLIC_FAVORITES_API=https://staging-favorites.platng.com/v1
NEXT_PUBLIC_NOTIFICATIONS_API=https://staging-notifications.platng.com/v1
NEXT_PUBLIC_PARTNER_API=https://staging-partners.platng.com/v1
NEXT_PUBLIC_PAYMENTS_API=https://staging-payments.platng.com/v1

# Paystack TEST Keys
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Google OAuth (Staging)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-staging-client-id.apps.googleusercontent.com

# App Configuration
NEXT_PUBLIC_APP_NAME=PlatNG Staging
NEXT_PUBLIC_APP_URL=https://staging.platng.com
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

## 🧪 Pre-Deployment Testing

### 1. Run Production Build Locally
```bash
npm run build
npm run start
```

### 2. Test All Critical Paths
- [ ] Homepage loads
- [ ] User can register
- [ ] User can login
- [ ] Events display correctly
- [ ] Search works
- [ ] Favorites add/remove
- [ ] Ticket purchase flow
- [ ] Payment with Paystack
- [ ] Mobile navigation

### 3. Performance Checks
```bash
npm run build
# Check bundle size in output

# Use Lighthouse for performance audit
npx lighthouse https://platng.com --view
```

### 4. Security Audit
```bash
npm audit
npm audit fix
```

---

## 📊 Monitoring & Logging

### Recommended Services

**Error Tracking:**
- Sentry (recommended)
- Bugsnag
- Rollbar

**Analytics:**
- Google Analytics 4
- Mixpanel
- PostHog

**Performance Monitoring:**
- Vercel Analytics (if using Vercel)
- New Relic
- Datadog

**Uptime Monitoring:**
- UptimeRobot
- Pingdom
- Better Uptime

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

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

## 🔧 Post-Deployment Tasks

### 1. Verify Deployment
- [ ] Check homepage loads
- [ ] Test login/register
- [ ] Verify API connections
- [ ] Test payment flow
- [ ] Check mobile responsiveness

### 2. Setup Monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Setup analytics (Google Analytics)
- [ ] Enable uptime monitoring
- [ ] Configure alerts

### 3. Performance Optimization
- [ ] Enable CDN caching
- [ ] Configure image optimization
- [ ] Setup Redis for caching (optional)
- [ ] Enable Brotli compression

### 4. Security
- [ ] Enable HTTPS (force SSL)
- [ ] Configure CORS properly
- [ ] Set security headers
- [ ] Enable rate limiting

---

## 🆘 Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm ci
npm run build
```

**Error**: `Type errors`
```bash
# Check TypeScript
npm run type-check
```

### Runtime Errors

**Error**: `API calls failing`
- Check environment variables are set
- Verify backend services are running
- Check CORS configuration on backend

**Error**: `Images not loading`
- Verify `next.config.js` has correct `remotePatterns`
- Check CDN configuration

### Performance Issues

**Slow page loads:**
- Check bundle size: `npm run build`
- Enable caching headers
- Use CDN for static assets
- Optimize images

---

## 📝 Rollback Plan

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Docker
```bash
# List images
docker images

# Rollback to previous image
docker run -p 3000:3000 platng-frontend:previous-tag
```

### PM2
```bash
# Checkout previous commit
git checkout [previous-commit-hash]

# Rebuild and restart
npm run build
pm2 restart platng-frontend
```

---

## 🎯 Performance Targets

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Additional Metrics:**
- Time to First Byte (TTFB): < 600ms
- First Contentful Paint (FCP): < 1.8s
- Speed Index: < 3.4s

---

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Deployment Guide Maintained By**: PlatNG Development Team
**Support**: dev@platng.com
