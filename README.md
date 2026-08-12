# Python с нуля

Платформа для обучения: конспекты (markdown с подсветкой кода) + домашки, которые
решаются прямо в браузере (CodeMirror + Pyodide) и автоматически проверяются
Python-тестами на `assert`.

## Роли

Никакой регистрации — два пароля из `.env`:

- `TEACHER_PASSWORD` — учитель: создаёт конспекты и домашки, видит историю сдач.
- `STUDENT_PASSWORD` — ученица: читает конспекты, решает и сдаёт домашки.

## Локальный запуск

1. `npm install`
2. Скопируй `.env.example` в `.env` и заполни `DATABASE_URL` (любой Postgres,
   например локальный через Docker — см. ниже) и пароли.
3. `npx prisma migrate dev` — накатить схему.
4. `npm run dev` — открыть http://localhost:3000.

### Локальный Postgres через Docker (для разработки)

```bash
docker run -d --name python-academy-db \
  -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=python_academy \
  -p 55432:5432 postgres:16-alpine
```

`DATABASE_URL="postgresql://postgres:devpass@localhost:55432/python_academy?sslmode=disable"`

## Как устроена автопроверка

У каждой домашки есть `testCode` — обычный Python-скрипт с `assert`, который
учитель пишет вручную (см. форму создания домашки, там есть шаблон-подсказка).
При нажатии "Запустить" код ученицы и `testCode` выполняются друг за другом в
общем пространстве имён прямо в браузере через Pyodide (WebAssembly-сборка
Python) — без какого-либо сервера-исполнителя. Если тест дошёл до конца без
исключений — задание засчитано, всё напечатанное (`print(...)`) показывается
как сообщение об успехе.

## Деплой (бесплатно)

1. Создай проект на [neon.tech](https://neon.tech) (бесплатный Postgres),
   скопируй connection string.
2. Запушь репозиторий на GitHub.
3. Импортируй репозиторий в [Vercel](https://vercel.com), в Environment
   Variables добавь `DATABASE_URL` (из Neon), `TEACHER_PASSWORD`,
   `STUDENT_PASSWORD`, `SESSION_SECRET` (сгенерировать: `openssl rand -base64 32`).
4. После первого деплоя один раз прогони `npx prisma migrate deploy` с
   `DATABASE_URL`, указывающим на прод-базу (например, локально с
   `.env.production` или через `vercel env pull`).
