---
description: Automatically update all project documentation after changes
---

# Update Documentation Command

После внесения изменений в код:

1. **Определи текущую неделю разработки** (Week 2, Week 3, Week 4)

2. **Обновить прогресс-документацию:**
   - Если Week 3: обновить `WEEK_3_PROGRESS.md`
   - Добавить новую фичу в раздел "✅ Completed Features"
   - Обновить процент завершения
   - Добавить метрики (файлы, строки кода)

3. **Обновить DOCUMENTATION_INDEX.md:**
   - Обновить статус проекта
   - Обновить дату: 2025-11-18
   - Добавить новый файл в таблицу статистики

4. **Проверить качество:**
   ```bash
   npm run type-check
   npm run lint
   ```

5. **Показать summary:**
   - Что было сделано
   - Сколько файлов создано/изменено
   - Текущий статус TypeScript/ESLint
   - Что осталось сделать
