# Frontend — Quotation Manager SPA

**React 19** single-page application built with **Vite 7** and **Tailwind CSS 4**. Talks to the Backend API over **Axios** with JWT stored in `localStorage`.

---

## Tech stack

- **UI**: React 19, React Router 7
- **Build**: Vite 7, `@vitejs/plugin-react`
- **Styling**: Tailwind CSS 4 (`@tailwindcss/vite`)
- **HTTP**: Axios (shared instance + auth interceptor)
- **Search**: Fuse.js (preset autocomplete on line item descriptions)

---

## UI architecture

```text
src/
├── main.jsx              → React root, providers
├── App.jsx               → Toast + Preferences + Auth + routes
├── index.css             → Global / Tailwind entry
├── routes/
│   └── AppRoutes.jsx     → Route table (public vs protected)
├── layouts/
│   └── AuthLayout.jsx    → Sidebar + main scroll area (mobile top offset)
├── components/
│   ├── common/           → Button, Input, Badge, Modal, Spinner, Icons, …
│   ├── layout/           → Sidebar (nav, mobile drawer)
│   └── quotation/        → PresetDescriptionInput (portal + Fuse)
├── pages/                → Screen-level components
├── auth/                 → Login, Register, authApi
├── context/              → AuthContext, ToastContext, PreferencesContext
├── guards/               → ProtectedRoute
├── hooks/                → useQuotation
├── api/                  → quotationApi, sqlItemsApi
└── utils/                → calculateTotals, …
```

---

## Routing

| Path | Guard | Page |
|------|-------|------|
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/` | Protected | Quotation list (dashboard + table) |
| `/create` | Protected | Create quotation |
| `/edit/:id` | Protected | Edit quotation |
| `/view/:id` | Protected | View + clone + downloads |
| `/items` | Protected | Item library (presets) |
| `/settings` | Protected | Currency preference |

Query on list: `/?status=DRAFT`, `SENT`, or `FINAL` for filters.

---

## State management

| Concern | Implementation |
|---------|------------------|
| **Auth** | `AuthContext` — user, login/logout/register, token in `localStorage` |
| **Toasts** | `ToastContext` — success/error messages |
| **Preferences** | `PreferencesContext` — currency code/symbol, `localStorage` persistence, `formatMoney()` |
| **Quotation form** | `useQuotation` hook — company/customer, items, tax, discount, notes, terms, totals |

No Redux: context + local component state are enough for this app size.

---

## API client

- **`src/api/quotationApi.js`**: Axios instance with `baseURL` from `import.meta.env.VITE_API_URL` or `http://localhost:5000/api`, and request interceptor attaching `Authorization: Bearer <token>`.

---

## Environment variables

Create **`frontend/.env`** (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

Vite only exposes variables prefixed with **`VITE_`**.

---

## Scripts

```bash
npm install
npm run dev      # Vite dev server (default http://localhost:5173)
npm run build    # Output to dist/
npm run preview  # Serve production build locally
npm run lint     # ESLint
```

---

## Styling conventions

- Utility-first Tailwind classes on components.
- Shared patterns (e.g. form inputs) often use local `const` class strings in pages for consistency with existing screens.

---

## Related docs

- [Root README](../README.md) — full project setup and features
- [Backend README](../Backend/README.md) — API reference and schema
