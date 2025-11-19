# 🔧 Troubleshooting: Dev Server 404 Issue - Complete Analysis

**Date:** 2025-11-17
**Status:** ✅ RESOLVED
**Time to Resolution:** ~45 minutes
**Severity:** Critical (Application не запускалась)

---

## 📋 Проблема

После реализации новых страниц (Discover, Login, Register, Event Details), dev server запускался успешно, но **все страницы возвращали 404 Not Found**.

### Симптомы

```bash
✓ Ready in 737ms
- Local: http://localhost:3000

# Но при обращении к любой странице:
GET /en 404
GET /en/discover 404
GET /en/login 404
```

**Что видел пользователь:**
```
Page Not Found
Sorry, we couldn't find the page you're looking for.
```

---

## 🔍 Процесс Диагностики

### Шаг 1: Проверка Build Process

Первым делом проверил production build, чтобы увидеть реальные ошибки:

```bash
npm run build
```

**Результат:** Обнаружены ESLint ошибки:
- Неиспользуемые импорты
- Unused variables
- Неэкранированные апострофы
- Console.log statements

**Действие:** Исправил все ESLint ошибки

---

### Шаг 2: Проверка TypeScript

```bash
npm run type-check
```

**Результат:** TypeScript ошибки в типах:
- Отсутствовали поля `is_verified`, `latitude`, `longitude`, `external_url`

**Действие:** Обновил типы в `types/event.ts`

---

### Шаг 3: Dev Server Зависание

Dev server зависал на "Starting..." и никогда не переходил в "Ready".

**Проблема:** Next.js 14 без Turbopack зависает на компиляции

**Решение:**
```json
{
  "scripts": {
    "dev": "next dev --turbo"  // Добавлен флаг --turbo
  }
}
```

---

### Шаг 4: Критическая Ошибка - Отсутствие Middleware

После запуска с Turbopack, сервер стартовал, но страницы все еще давали 404.

**Диагностика:**
```bash
curl -I http://localhost:3000
# HTTP/1.1 404 Not Found
```

**Проверка логов:**
```
GET /en 404 in 2874ms
✓ Compiled /[locale] in 2.5s
```

Страница компилировалась, но не рендерилась!

**Открытие:** Отсутствует `middleware.ts` для обработки i18n routing!

**Решение:** Создал `middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

---

### Шаг 5: Next-intl Configuration Error

После добавления middleware, появилась новая ошибка:

```
Error: NEXT_NOT_FOUND
at notFound (/i18n/request.ts)
```

**Проблема в `i18n/request.ts`:**
```typescript
// ❌ НЕПРАВИЛЬНО
export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as any)) {
    notFound();  // ❌ Вызывает 404!
  }

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
```

**Решение:** Убрал `notFound()` и заменил на fallback

---

### Шаг 6: Missing Locale Error

```
Error: No locale was returned from getRequestConfig
```

**Проблема:** next-intl требует явного возврата `locale` в конфигурации!

**Финальное решение в `i18n/request.ts`:**
```typescript
// ✅ ПРАВИЛЬНО
import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Валидация локали с fallback
  const validLocale = locales.includes(locale as any) ? locale : 'en';

  return {
    locale: validLocale,  // ✅ ОБЯЗАТЕЛЬНО вернуть locale!
    messages: (await import(`./locales/${validLocale}.json`)).default,
  };
});
```

---

### Шаг 7: Client vs Server Components

Последняя проблема - `useTranslations` в `'use client'` компоненте.

**Ошибка в `app/[locale]/page.tsx`:**
```typescript
// ❌ НЕПРАВИЛЬНО
'use client';

import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');  // ❌ Не работает в async серверных компонентах
  // ...
}
```

**Решение:**
```typescript
// ✅ ПРАВИЛЬНО
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');  // ✅ Server component
  const tnav = await getTranslations('nav');
  // ...
}
```

---

## ✅ Полное Решение

### 1. Создать `middleware.ts`

```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### 2. Исправить `i18n/request.ts`

```typescript
import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locales.includes(locale as any) ? locale : 'en';

  return {
    locale: validLocale,  // ВАЖНО!
    messages: (await import(`./locales/${validLocale}.json`)).default,
  };
});
```

### 3. Обновить `package.json`

```json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

### 4. Исправить все ESLint ошибки

```bash
npm run lint:fix
```

### 5. Использовать Server Components для страниц с переводами

```typescript
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('namespace');
  // ...
}
```

---

## 🎓 Ключевые Инсайты

### 1. **Middleware - Критически Важен для i18n**

Next-intl **требует** middleware для обработки локалей в URL. Без него:
- Routing не работает
- Все страницы возвращают 404
- Компоненты компилируются, но не рендерятся

**Lesson Learned:** Всегда создавать middleware при использовании next-intl!

---

### 2. **getRequestConfig ДОЛЖЕН Возвращать locale**

```typescript
// ❌ Не работает
return {
  messages: {...}
};

// ✅ Работает
return {
  locale: validLocale,
  messages: {...}
};
```

**Lesson Learned:** Читать документацию next-intl внимательно!

---

### 3. **notFound() в getRequestConfig - Плохая Идея**

Вызов `notFound()` в `getRequestConfig` приводит к бесконечному циклу 404.

**Lesson Learned:** Использовать fallback вместо notFound()

---

### 4. **useTranslations vs getTranslations**

- `useTranslations()` - для Client Components
- `getTranslations()` - для Server Components (async)

**Lesson Learned:** Предпочитать Server Components для страниц с i18n

---

### 5. **Turbopack Решает Проблемы Производительности**

Regular `next dev` зависал, Turbopack стартовал за 737ms.

**Lesson Learned:** Использовать `--turbo` флаг по умолчанию

---

### 6. **Build First, Then Debug**

Production build показывает **все** ошибки сразу:
- ESLint
- TypeScript
- Runtime errors

**Lesson Learned:** Всегда запускать `npm run build` для диагностики

---

## 🔨 Debugging Commands

### Проверка Build
```bash
npm run build
```

### Проверка TypeScript
```bash
npm run type-check
```

### Проверка ESLint
```bash
npm run lint
```

### Очистка Cache
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### Очистка Портов
```bash
lsof -ti:3000 | xargs kill -9
```

### Проверка Response
```bash
curl -I http://localhost:3000
curl -I http://localhost:3000/en
```

### Проверка HTML
```bash
curl http://localhost:3000/en | grep "title"
```

---

## 📊 Timeline

| Время | Действие | Результат |
|-------|----------|-----------|
| 0min | Начало | 404 на всех страницах |
| 5min | npm run build | Найдены ESLint ошибки |
| 10min | Исправлены ESLint | Build успешен |
| 15min | Добавлен --turbo | Server запустился |
| 20min | Создан middleware.ts | Редирект работает |
| 30min | Исправлен request.ts | Убран notFound() |
| 35min | Добавлен locale в return | Ошибка "No locale" |
| 40min | Изменен на getTranslations | ✅ Все работает! |

---

## ⚠️ Предупреждения для Будущего

### 1. Никогда не удаляйте middleware.ts

Этот файл **критически важен** для i18n routing.

### 2. Всегда возвращайте locale из getRequestConfig

```typescript
return {
  locale: validLocale,  // ← ОБЯЗАТЕЛЬНО!
  messages: {...}
};
```

### 3. Не используйте notFound() в getRequestConfig

Используйте fallback локаль вместо этого.

### 4. Используйте Turbopack

Добавьте `--turbo` в dev script для лучшей производительности.

---

## 📚 Полезные Ссылки

- [Next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Turbopack Documentation](https://turbo.build/pack/docs)

---

## ✅ Чеклист для Новых i18n Проектов

- [ ] Создать `middleware.ts` с next-intl
- [ ] Настроить `i18n/request.ts` с возвратом `locale`
- [ ] Добавить `--turbo` в dev script
- [ ] Использовать `getTranslations` в Server Components
- [ ] Протестировать все локали (`/en`, `/ru`)
- [ ] Проверить редирект с корневого URL
- [ ] Запустить `npm run build` перед деплоем

---

## 🎯 Результат

**До:**
```
✓ Ready in 737ms
GET /en 404
```

**После:**
```
✓ Ready in 737ms
GET /en 200 ✅
```

**Приложение полностью работает!** 🎉

---

*Документация создана: 2025-11-17*
*Автор: Claude Code Assistant*
