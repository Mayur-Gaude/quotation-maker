# Backend — Quotation Manager API

Express **REST API** for authentication, quotations, exports, and saved line-item presets. Data lives in **MongoDB** via **Mongoose**.

---

## Tech stack

- **Runtime**: Node.js (ES modules)
- **Framework**: Express 5
- **Database**: MongoDB + Mongoose 9
- **Auth**: JWT (`jsonwebtoken`) + bcryptjs passwords
- **Validation**: Joi
- **Exports**: PDFKit (PDF), ExcelJS (`.xlsx`)

---

## Architecture

```text
server.js              → connectDB(), app.listen()
src/app.js             → express(), routes, errorHandler
src/routes/*.js        → mount controllers + middleware
src/controllers/*.js   → validate input, call services
src/services/*.js      → business logic + DB access
src/models/*.js        → Mongoose schemas
src/middlewares/       → JWT auth, centralized errors
src/utils/             → PDF, Excel, quotation number generator
src/assets/            → Optional quotation-logo.png for PDF header
```

- **`errorHandler`**: Last middleware; maps `CastError`, duplicate keys, and `err.statusCode` to JSON responses.

---

## API base URL

- Local default: `http://localhost:5000`
- API routes are prefixed with **`/api`**.

Root `GET /` returns a plain text health message.

---

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create user (email + password) |
| POST | `/api/auth/login` | No | Returns JWT |

Protected routes expect header:

```http
Authorization: Bearer <token>
```

Middleware: `src/middlewares/authMiddleware.js` — verifies JWT, sets `req.user.id`.

---

## Quotations API

All routes below require **JWT** (except as noted).

Base path: **`/api/quotations`**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats/dashboard` | Aggregates: total quotes, total `grandTotal` sum, draft count |
| POST | `/` | Create quotation (body validated with Joi; server assigns `quotationNumber`) |
| GET | `/` | List with query: `page`, `limit`, `search`, `status` (`DRAFT` \| `SENT` \| `FINAL`) |
| GET | `/:id` | Get one (scoped to `userId`) |
| PUT | `/:id` | Update (not when `FINAL`; `status` in body is stripped—use mark-sent / finalize) |
| DELETE | `/:id` | Delete |
| GET | `/:id/pdf` | PDF download; optional query `currency` (e.g. `₹`, URL-encoded) |
| GET | `/:id/excel` | Excel download |
| PATCH | `/:id/mark-sent` | `DRAFT` → `SENT` |
| PATCH | `/:id/finalize` | `DRAFT` or `SENT` → `FINAL` |
| POST | `/:id/duplicate` | Clone to new **DRAFT** with new number |

---

## Saved items API (item library)

Base path: **`/api/sqlitems`** (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List current user’s presets |
| POST | `/` | Create (`name`, `defaultRate`, `unit` optional) |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete |

MongoDB collection name: **`sqlitems`** (see `SqlItem` model).

---

## Database schema (high level)

### `users`

- `email` (unique), `password` (hashed), timestamps

### `quotations`

- `quotationNumber` (unique), `quotationDate`
- `companyDetails`, `customerDetails` (nested objects)
- `items[]`: `description`, `quantity`, `rate`, `amount`, optional `unit`
- `subTotal`, `tax`, `discount`, `grandTotal`
- `termsAndConditions`, `notes` (optional strings)
- `status`: `DRAFT` | `SENT` | `FINAL`
- `userId` (ref User), timestamps

### `sqlitems`

- `userId`, `name`, `defaultRate`, `unit`, timestamps

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing tokens |
| `PORT` | Listen port (default 5000) |

---

## Scripts

```bash
npm install
npm run dev    # nodemon server.js
npm start      # node server.js
```

---

## PDF logo (optional)

Place a PNG at:

`src/assets/quotation-logo.png`

If missing, the PDF generator falls back to a monogram from the company name.
