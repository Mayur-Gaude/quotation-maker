# Quotation Manager (Project_1)

Full-stack **quotation management** application: create and edit quotes, manage reusable line-item presets, export PDF/Excel, and track status from draft through sent to finalized.

---

## Project overview

**Quotation Manager** helps businesses produce professional quotations with:

- Authenticated users (JWT)
- Per-user quotations stored in **MongoDB**
- A reusable **item library** (saved descriptions, default rates, units) with fuzzy autocomplete on line items
- **PDF** and **Excel** exports (PDF supports optional logo + branded header)
- **Duplicate quotation** for similar jobs
- Per-quote **notes** and **terms & conditions**
- Dashboard **stats** (total quotes, combined value, drafts pending)
- **Currency preference** (display + PDF symbol) stored in the browser

The repository is split into a **Node/Express** API (`Backend/`) and a **React (Vite)** SPA (`frontend/`).

---

## Features

| Area | Highlights |
|------|------------|
| **Auth** | Register, login, JWT on protected routes |
| **Quotations** | CRUD, pagination, search, status filters (Draft / Sent / Final) |
| **Workflow** | Mark as sent, finalize, clone duplicate as new draft |
| **Line items** | Preset autocomplete (Fuse.js), qty/rate/amount, optional unit |
| **Item library** | CRUD presets (`sqlitems` collection in MongoDB) |
| **Exports** | PDF (currency query + optional logo), Excel |
| **UX** | Sidebar + mobile drawer, settings page, toast notifications |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, React Router 7, Vite 7, Tailwind CSS 4, Axios, Fuse.js |
| **Backend** | Express 5, Mongoose 9, JWT, bcryptjs, Joi, PDFKit, ExcelJS |
| **Database** | MongoDB |
| **Tooling** | ESLint (frontend), Nodemon (backend dev) |

---

## Folder structure

```text
Project_1/
├── README.md                 ← This file (project overview)
├── Backend/
│   ├── README.md             ← API & backend details
│   ├── server.js             ← Entry: DB connect + listen
│   ├── package.json
│   └── src/
│       ├── app.js            ← Express app + routes mount
│       ├── config/           ← DB connection
│       ├── controllers/
│       ├── middlewares/      ← auth, error handler
│       ├── models/           ← User, Quotation, SqlItem
│       ├── routes/
│       ├── services/
│       ├── validation/
│       ├── utils/            ← PDF, Excel, quotation number
│       └── assets/           ← Optional quotation-logo.png for PDF
├── frontend/
│   ├── README.md             ← UI & frontend details
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── auth/
│       ├── components/
│       ├── context/          ← Auth, Toast, Preferences
│       ├── guards/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       └── routes/
└── docs/
    └── screenshots/          ← Add your UI screenshots here (see below)
```

---

## Setup instructions

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** (local or Atlas URI)

### 1. Clone and install

```bash
git clone <your-repo-url> Project_1
cd Project_1
```

**Backend**

```bash
cd Backend
npm install
```

**Frontend**

```bash
cd ../frontend
npm install
```

### 2. Environment variables

Create **`Backend/.env`** (see [Environment variables](#environment-variables)).

Create **`frontend/.env`** (optional) if the API is not on the default URL:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run MongoDB

Ensure MongoDB is running and the URI in `Backend/.env` is correct.

### 4. Start the apps

**Terminal 1 — API**

```bash
cd Backend
npm run dev
```

Default API: `http://localhost:5000` (root responds with a short health message; API under `/api`).

**Terminal 2 — SPA**

```bash
cd frontend
npm run dev
```

Default UI: `http://localhost:5173` (Vite).

Register a user, then log in and use the dashboard.

---

## Run commands (cheat sheet)

| Location | Command | Purpose |
|----------|---------|---------|
| `Backend/` | `npm run dev` | API with nodemon (reload on change) |
| `Backend/` | `npm start` | API with plain `node` |
| `frontend/` | `npm run dev` | Vite dev server + HMR |
| `frontend/` | `npm run build` | Production build → `frontend/dist/` |
| `frontend/` | `npm run preview` | Preview production build locally |
| `frontend/` | `npm run lint` | ESLint |

---

## Environment variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT access tokens |
| `PORT` | No | HTTP port (default **5000** if omitted) |

Example:

```env
MONGO_URI=mongodb://127.0.0.1:27017/quotation_app
JWT_SECRET=your-long-random-secret
PORT=5000
```

> Do **not** commit `.env` to git. Keep secrets local or in your host’s secret manager.

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Base URL for Axios (default `http://localhost:5000/api`) |

---

## Screenshots

Screenshots are **not** committed by default. To document the UI in this README:

1. Create or use the folder **`docs/screenshots/`**.
2. Save images, e.g. `dashboard.png`, `create-quotation.png`, `pdf-sample.png`.
3. Link them from this file:

```markdown
![Dashboard](docs/screenshots/dashboard.png)
![Create quotation](docs/screenshots/create-quotation.png)
```

Until those files exist, the image links may appear broken in some viewers—that is expected.

---

## Deployment links

Replace the placeholders below with your real production URLs after you deploy.

| Service | URL | Notes |
|---------|-----|--------|
| **Frontend (production)** | _e.g. `https://your-app.vercel.app`_ | Build: `cd frontend && npm run build`; set `VITE_API_URL` to your **public** API base. |
| **Backend (production)** | _e.g. `https://api.yourdomain.com`_ | Set `MONGO_URI`, `JWT_SECRET`, `PORT` (or use host’s `PORT`). Restrict **CORS** to your frontend origin. |
| **MongoDB** | Atlas or managed DB | Use TLS URI from provider. |

**Deployment tips**

- Point `VITE_API_URL` at the deployed API (include `/api` path as used in the code).
- Use HTTPS in production.
- Rotate `JWT_SECRET` if compromised; users must log in again.

---

## Documentation map

| File | Contents |
|------|----------|
| [README.md](./README.md) | This overview |
| [Backend/README.md](./Backend/README.md) | API routes, auth, schema |
| [frontend/README.md](./frontend/README.md) | UI structure, routing, state |

---

## License

See repository license (if any). Default scaffold may be ISC/MIT—confirm in each `package.json`.
