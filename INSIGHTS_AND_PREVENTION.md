# 🔍 Insights & Prevention Guide

**Цель:** Предотвратить повторение проблем в будущих сессиях

---

## 🚨 Критическая проблема #1: Production Build Failure

### Проблема
```bash
Error: not-found.tsx doesn't have a root layout.
```

### Почему возникла
Next.js 14 App Router требует **обязательное наличие** root `layout.tsx` в директории `app/`.

**Что было:**
```
app/
├── [locale]/
│   └── layout.tsx    # ❌ Только для locale routes
├── not-found.tsx     # ❌ Без root layout
└── globals.css
```

**Что должно быть:**
```
app/
├── layout.tsx        # ✅ ROOT LAYOUT (обязательно!)
├── [locale]/
│   └── layout.tsx    # Для locale routes
├── not-found.tsx
└── globals.css
```

### Причины возникновения

#### 1. Миграция на i18n без обновления структуры
Когда добавлялся i18n через next-intl, разработчики:
- Создали `app/[locale]/layout.tsx` для локализованных routes
- **Забыли** создать root `app/layout.tsx`
- Предположили, что `[locale]/layout.tsx` достаточно

#### 2. Development mode "прощает" эту ошибку
```bash
npm run dev  # ✅ Работает (Next.js создает временный layout)
npm run build # ❌ Падает (строгая валидация)
```

Development server Next.js **автоматически генерирует** временный layout,
поэтому проблема не проявляется при разработке.

### ✅ Решение

**Минимальный root layout:**
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

### 🛡️ Как предотвратить

#### Checklist для Next.js 14 App Router проектов:

- [ ] **ВСЕГДА** проверять наличие `app/layout.tsx`
- [ ] **ТЕСТИРОВАТЬ** production build перед commit:
  ```bash
  npm run build  # НЕ только npm run dev!
  ```
- [ ] При добавлении i18n routing проверять структуру:
  ```
  app/
  ├── layout.tsx           # ✅ ROOT (обязательно)
  └── [locale]/
      └── layout.tsx       # ✅ LOCALE (опционально)
  ```
- [ ] Добавить в CI/CD pipeline обязательную проверку:
  ```yaml
  # .github/workflows/ci.yml
  - name: Build production
    run: npm run build  # ❌ Сборка упадет без layout.tsx
  ```

#### Pre-commit hook:
```bash
# .husky/pre-commit
#!/bin/sh
npm run build || {
  echo "❌ Production build failed! Check for missing layout.tsx"
  exit 1
}
```

---

## 🚨 Критическая проблема #2: ESLint Configuration Incompatibility

### Проблема
```bash
Invalid Options:
- Unknown options: useEslintrc, extensions, resolvePluginsRelativeTo
```

### Почему возникла

#### 1. ESLint 9.x Breaking Changes
ESLint 9.0.0 (апрель 2024) ввел **новый flat config format**.

**Старый формат (.eslintrc.json):**
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": { ... }
}
```

**Новый формат (eslint.config.mjs):**
```javascript
import next from 'eslint-config-next';

export default [
  next,
  { rules: { ... } }
];
```

#### 2. Несовместимость версий
```json
{
  "eslint": "^9.39.1",           // ❌ Требует flat config
  "eslint-config-next": "^16.0.3" // ✅ Поддерживает flat config
}
```

Но проект использовал **старый `.eslintrc.json`** → конфликт!

#### 3. Почему версии обновились
- `npm install` с caret (^) ranges автоматически обновляет до latest
- ESLint 9.x был released → автоматически установлен
- `.eslintrc.json` остался старым → несовместимость

### Почему dev команды пропустили это

```bash
npm run dev   # ✅ Работает (не запускает ESLint)
npm run lint  # ❌ Падает (но не всегда запускают)
```

Разработчики часто:
- Запускают только `npm run dev`
- **Не запускают** `npm run lint` локально
- Полагаются на IDE для линтинга (который может использовать другую версию)

### ✅ Решение

#### Вариант 1: Downgrade к ESLint 8.x (рекомендовано)
```json
{
  "devDependencies": {
    "eslint": "^8.57.0",           // ✅ Последняя версия 8.x
    "eslint-config-next": "^14.2.33" // ✅ Совместима с Next.js 14
  }
}
```

**Почему этот вариант:**
- Работает с существующим `.eslintrc.json`
- Не требует переписывания конфигурации
- Стабильная версия с поддержкой

#### Вариант 2: Миграция на flat config (для будущего)
```javascript
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // ... остальные правила
    }
  }
];
```

### 🛡️ Как предотвратить

#### 1. Lock версий в package.json
```json
{
  "devDependencies": {
    "eslint": "8.57.0",  // ❌ БЕЗ caret (^)
    // Или использовать ~
    "eslint": "~8.57.0"  // ✅ Только patch updates
  }
}
```

#### 2. Использовать package-lock.json
```bash
npm ci  # ✅ Использует locked версии
# НЕ npm install (может обновить версии)
```

#### 3. Renovate/Dependabot с тестами
```yaml
# renovate.json
{
  "packageRules": [
    {
      "matchPackageNames": ["eslint"],
      "matchUpdateTypes": ["major"],
      "enabled": false  // Отключить auto-update major versions
    }
  ]
}
```

#### 4. CI/CD pipeline проверки
```yaml
# .github/workflows/ci.yml
jobs:
  lint:
    steps:
      - run: npm run lint  # ❌ Упадет при несовместимости
```

#### 5. Pre-push hook
```bash
# .husky/pre-push
npm run lint || {
  echo "❌ ESLint failed! Check configuration compatibility"
  exit 1
}
```

---

## 📋 Общие Lessons Learned

### 1. "Dev работает" ≠ "Production работает"

**Всегда тестировать:**
```bash
npm run dev        # Dev mode
npm run build      # Production build ✅
npm run start      # Production server
```

**Почему:**
- Dev mode более "прощающий"
- Production имеет строгие проверки
- Оптимизация может выявить ошибки

### 2. Версионирование зависимостей

**Проблемы с `^` (caret):**
```json
{
  "eslint": "^9.0.0"  // Может обновиться до 9.999.999 ❌
}
```

**Лучше использовать:**
```json
{
  "eslint": "~9.0.0"  // Только patch: 9.0.x ✅
  // Или
  "eslint": "9.0.0"   // Точная версия ✅
}
```

**Или использовать:**
- `package-lock.json` (npm)
- `yarn.lock` (yarn)
- `pnpm-lock.yaml` (pnpm)

### 3. CI/CD обязателен

**Минимальный CI pipeline:**
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci           # ✅ Locked install
      - run: npm run lint     # ✅ Lint check
      - run: npm run type-check # ✅ Type check
      - run: npm run build    # ✅ Build check
```

### 4. Pre-commit hooks

**Установка:**
```bash
npm install -D husky lint-staged

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**Создать hook:**
```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

---

## 🎯 Prevention Checklist

### Для каждого нового проекта

#### Initial Setup
- [ ] Создать root `layout.tsx` в app/
- [ ] Настроить CI/CD с lint + build checks
- [ ] Установить husky + lint-staged
- [ ] Использовать lock files (package-lock.json)
- [ ] Задокументировать версии major dependencies

#### Before Commit
- [ ] `npm run lint` - проверка линтинга
- [ ] `npm run type-check` - проверка типов
- [ ] `npm run build` - проверка production сборки
- [ ] Протестировать в браузере

#### Before Push
- [ ] Все тесты проходят
- [ ] Build успешен
- [ ] Нет console.log/console.error (кроме обоснованных)
- [ ] Обновлена документация (если нужно)

#### Before Production Deploy
- [ ] `npm run build` локально
- [ ] CI/CD pipeline зеленый
- [ ] Performance проверен (Lighthouse)
- [ ] Security scan (npm audit)
- [ ] Environment variables настроены

---

## 📊 Версионирование: Best Practices

### Semantic Versioning (semver)

```
MAJOR.MINOR.PATCH
  ↓     ↓     ↓
  1  .  2  .  3
```

**Символы в package.json:**

| Символ | Что означает | Пример | Обновления |
|--------|--------------|--------|------------|
| `^` | До major | `^1.2.3` | 1.2.3 → 1.9.9 ❌ |
| `~` | До minor | `~1.2.3` | 1.2.3 → 1.2.9 ✅ |
| Без символа | Точная | `1.2.3` | Нет обновлений ✅ |

### Рекомендации

**Для production:**
```json
{
  "dependencies": {
    "next": "14.2.33",     // ✅ Точная версия
    "react": "~18.3.1"     // ✅ Patch updates
  },
  "devDependencies": {
    "eslint": "~8.57.0",   // ✅ Patch updates
    "typescript": "5.9.3"  // ✅ Точная версия
  }
}
```

**Когда использовать `^`:**
- Маленькие библиотеки с стабильным API
- Utility libraries (lodash, date-fns)
- НЕ использовать для: build tools, frameworks, TypeScript

---

## 🔧 Tools для предотвращения проблем

### 1. Husky (Git Hooks)
```bash
npm install -D husky
npx husky init
```

### 2. Lint-staged (Pre-commit linting)
```bash
npm install -D lint-staged
```

### 3. Commitlint (Commit message validation)
```bash
npm install -D @commitlint/{cli,config-conventional}
```

### 4. Renovate (Dependency updates)
```json
// renovate.json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["major"],
      "automerge": false
    }
  ]
}
```

### 5. npm-check-updates (Version management)
```bash
npm install -g npm-check-updates
ncu  # Check for updates
ncu -u  # Update package.json
```

---

## 📚 Документация как превенция

### Что должно быть задокументировано

#### 1. README.md
- Требования к версиям (Node.js, npm)
- Команды для разработки
- Как запустить production build
- Troubleshooting секция

#### 2. CONTRIBUTING.md
- Процесс перед коммитом
- Как запускать тесты
- Code style guidelines
- Pull request template

#### 3. Architecture Decision Records (ADR)
```markdown
# ADR-001: Use ESLint 8.x instead of 9.x

## Status
Accepted

## Context
ESLint 9.x requires flat config format.
Our project uses .eslintrc.json format.

## Decision
Use ESLint 8.57.0 (last 8.x version)

## Consequences
- Works with existing config
- Will need migration to 9.x in future
- Lock version in package.json
```

#### 4. CHANGELOG.md
Фиксировать все значимые изменения, особенно:
- Breaking changes
- Версии зависимостей
- Configuration changes

---

## 🎓 Образовательные материалы

### Для команды разработчиков

#### 1. Next.js App Router обязательные концепции
- Root layout requirement
- Nested layouts
- Loading/Error boundaries
- Not-found pages

**Ссылки:**
- https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
- https://nextjs.org/docs/app/api-reference/file-conventions/layout

#### 2. ESLint версионирование
- Flat config migration guide
- Breaking changes в major versions
- Как читать release notes

**Ссылки:**
- https://eslint.org/docs/latest/use/configure/migration-guide
- https://eslint.org/blog/2024/04/eslint-v9.0.0-released

#### 3. Semantic Versioning
- Понимание MAJOR.MINOR.PATCH
- Когда происходят breaking changes
- Как читать changelog

**Ссылки:**
- https://semver.org/

---

## 🚦 Traffic Light System для версий

### 🟢 Зеленый (Safe to update)
- **Patch versions** (1.2.3 → 1.2.4)
- Bug fixes
- Security patches
- **Действие:** Auto-merge в Renovate

### 🟡 Желтый (Review required)
- **Minor versions** (1.2.3 → 1.3.0)
- New features
- Deprecations
- **Действие:** Manual review, run tests

### 🔴 Красный (High risk)
- **Major versions** (1.2.3 → 2.0.0)
- Breaking changes
- API changes
- **Действие:**
  1. Read migration guide
  2. Create feature branch
  3. Full testing
  4. Team review

---

## ✅ Quick Reference

### Команды для проверки перед commit

```bash
# 1. Lint
npm run lint

# 2. Type check
npm run type-check

# 3. Build production
npm run build

# 4. Run tests (если есть)
npm run test

# Или все вместе
npm run lint && npm run type-check && npm run build
```

### Файлы, которые должны быть в проекте

```
✅ app/layout.tsx           # Root layout (Next.js 14)
✅ .eslintrc.json           # ESLint config
✅ tsconfig.json            # TypeScript config
✅ next.config.js           # Next.js config
✅ package-lock.json        # Dependencies lock
✅ .gitignore               # Git ignore
✅ README.md                # Project documentation
✅ .husky/                  # Git hooks (recommended)
✅ .github/workflows/ci.yml # CI/CD (recommended)
```

---

## 🎯 Итоговые рекомендации

### DO ✅

1. **Всегда** запускать `npm run build` перед commit
2. **Использовать** package-lock.json
3. **Настроить** CI/CD pipeline
4. **Тестировать** major updates в отдельной ветке
5. **Читать** release notes перед обновлением
6. **Документировать** architecture decisions
7. **Использовать** pre-commit hooks

### DON'T ❌

1. **Не** полагаться только на `npm run dev`
2. **Не** использовать `^` для критичных зависимостей
3. **Не** обновлять major versions без тестирования
4. **Не** коммитить без проверки lint + build
5. **Не** игнорировать warnings в CI/CD
6. **Не** удалять package-lock.json
7. **Не** пропускать documentation updates

---

**Последнее обновление:** 2025-11-17
**Версия:** 1.0.0
**Статус:** ✅ Проверено и валидировано
