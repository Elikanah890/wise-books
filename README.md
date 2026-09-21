# WiseBook

WiseBook is an online bookstore for Tanzania. Visitors browse and search a catalogue of books
and e-books, view book details, and check out without creating an account. The Owner signs in to
a private admin dashboard to manage categories, books (with cover images and metadata), comments
shown on the home page, orders, payments and site-wide content such as the hero, trust badges and
contact details.

The project is a monorepo with two applications:

| Folder | Application | Stack |
| --- | --- | --- |
| `backend/` | REST API | Node.js, Express, TypeScript, Prisma |
| `frontend_book/` | Public site + admin dashboard | React 18, Vite, TypeScript, Tailwind, Framer Motion |

Database: MySQL. Payments are intentionally stubbed and are not part of the current scope.

## Getting started

### Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in DATABASE_URL, JWT_SECRET, CORS_ORIGIN
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run build && npm start  # http://localhost:8000
```

### Frontend

```bash
cd frontend_book
npm install
npm run dev                 # http://localhost:3000 (proxies /api to the backend)
npm run build               # production build in dist/
```

Set `VITE_API_URL` to the API base URL (e.g. `http://localhost:8000/api` in dev, or the production
API URL). Configuration lives in `.env` / `.env.production`.

## License

MIT
