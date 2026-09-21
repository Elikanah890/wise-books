# BookStore Frontend

React + Vite frontend for the online bookstore.

## Public pages (no account required)

- `/` — Home with featured books
- `/books` — Browse, search and filter
- `/books/:id` — Book detail with image gallery
- `/checkout/:bookId` — Collect email and phone
- `/payment-status/:orderId` — Polls for the payment result
- `/download/:token` — Shows the download button for a paid order

## Admin pages (Owner only)

- `/admin/login`
- `/admin` — Dashboard
- `/admin/books`, `/admin/books/new`, `/admin/books/:id/edit`
- `/admin/categories`
- `/admin/orders`
- `/admin/payments`
- `/admin/revenue`

The admin JWT is kept in memory and `sessionStorage`. Public pages require no authentication.

## Development

```bash
npm install
cp .env.example .env
npm run dev     # http://localhost:3000, proxies /api and /uploads to :8000
npm run build
```

## Environment

```env
VITE_API_URL=/api
VITE_APP_NAME=WiseBook
VITE_SITE_URL=http://localhost:3000
```
