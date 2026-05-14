# Copilot Instructions for Quotation Maker

## Project Overview

This is a full-stack **Quotation Maker** application (MERN-style):
- **Frontend**: React 19 + Vite + React Router + Tailwind CSS
- **Backend**: Express 5 + Mongoose + MongoDB
- **Authentication**: JWT-based with bcryptjs password hashing
- **Export Features**: PDF (pdfkit) and Excel (exceljs) generation

The app allows users to create, manage, and export quotations. Authentication is required for most operations.

## Build, Test, and Lint Commands

### Frontend
```bash
cd frontend
npm run dev       # Start Vite dev server (HMR enabled, port 5173)
npm run build     # Build for production (output to dist/)
npm run preview   # Preview production build locally
npm run lint      # Run ESLint on all files
```

### Backend
```bash
cd Backend
npm run dev       # Start server with nodemon (watches for changes)
npm start         # Start server (node server.js)
```

**Note**: No tests are currently configured. Add Jest or Mocha when tests are needed.

## Architecture Overview

### Backend Structure
- **Entry Point**: `server.js` → connects DB → starts Express app
- **Routes**: `/api/auth` (login/register) and `/api/quotations` (CRUD operations)
- **Middleware Stack**:
  - Error handling (must be last middleware)
  - CORS enabled globally (needs production review)
  - JWT authentication on protected routes
  - Joi validation on request payloads
- **Database**: MongoDB with two Mongoose models: User and Quotation
- **Controllers**: Separate handler functions for each route group
- **Services**: Business logic layer (if needed, currently minimal)

### Frontend Structure
- **Entry Point**: `main.jsx` → `App.jsx` wraps with `AuthProvider` → `AppRoutes`
- **Routing**: Defined in `src/routes/AppRoutes.jsx`, likely with React Router v7 pattern-based guards
- **Authentication**: `AuthContext` manages login state, available throughout app
- **API Client**: `src/api/quotationApi.js` centralizes HTTP calls to backend (using axios)
- **Layout**: Layouts folder for template components, Pages for route views
- **Styling**: Tailwind CSS with vite plugin integration (no PostCSS config needed)

## Code Conventions

### Backend

**Naming & Structure**
- Controllers: Suffixed with `Controller` (e.g., `createQuotationController`, `getAllQuotationsController`)
- Services: Plain function names, imported and used in controllers to separate business logic
- Models: Singular, capitalized (e.g., `User`, `Quotation`)
- Validators: Exported as schemas (e.g., `registerSchema`, `loginSchema`, `quotationSchema`)
- Middleware: Lowercase, descriptive names (e.g., `authMiddleware`, `errorHandler`)

**Error Handling**
- Custom `errorHandler` middleware is last in the stack (`app.use(errorHandler)`)
- Errors include `statusCode` property: `err.statusCode = 404; throw err;`
- Error responses always have `{ success: false, message: "...", [stack in dev] }`
- Database errors handled: CastError (invalid ID), code 11000 (duplicate key)

**Validation**
- All request payloads validated with Joi BEFORE passing to service layer
- Validation errors return `{ success: false, message: error.details[0].message }`
- Schemas allow nullable/empty fields with `.allow("", null)` for optional data
- Minimum constraints enforced (e.g., `Joi.number().positive()`, `.min(1)`)

**Response Format**
- All responses include `{ success: boolean, data: {...}, message: "...", ...metadata }`
- List responses include pagination: `{ page, limit, total, totalPages, data }`
- Status codes: 201 (created), 200 (success), 400 (validation), 401 (auth), 409 (conflict), 404 (not found), 500 (error)

**Routes & Middleware**
- Authentication middleware applied globally to entire route group: `router.use(authMiddleware)`
- User ID extracted from decoded token: `req.user = { id: decoded.id }`
- All quotation operations filtered by userId for access control
- Routes use HTTP verbs correctly: POST (create), GET (read), PUT (update), DELETE (delete), PATCH (partial/action)

**Database & Models**
- Timestamps added by default: `{ timestamps: true }`
- Nested schemas for complex objects (e.g., `itemSchema` nested in `quotationSchema`)
- Custom validation on schema level: `validate: [arr => arr.length > 0, "message"]`
- Indexes on frequently queried fields: `userId: { index: true }`
- Enum validation: `status: { enum: ["DRAFT", "FINAL"] }`

### Frontend

**Naming & Structure**
- Pages: Component files in `pages/` folder (e.g., `QuotationList.jsx`, `CreateQuotation.jsx`)
- Components: In `components/` folder (e.g., `Sidebar.jsx`)
- Contexts: Define both provider and hook (e.g., `AuthProvider` + `useAuth()`)
- Utilities: Plain functions without suffixes
- Guards: Wrap protected components (e.g., `ProtectedRoute`)

**State Management**
- `AuthContext` stores: `user`, `token`, `loading`, plus methods `login()` and `logout()`
- Token persisted in `localStorage` under key `"token"`
- User object persisted in `localStorage` as JSON under key `"user"`
- `loading` state used during auth verification on app mount

**API Integration**
- Axios instance created with base URL: `baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"`
- Request interceptor automatically adds JWT: `Authorization: Bearer ${token}`
- Export functions as direct calls (e.g., `export const getQuotations = (params) => API.get(...)`
- All parameters passed via `params` object: `API.get("/quotations/", { params })`
- File downloads use `responseType: "blob"` (e.g., PDF, Excel exports)

**Routing & Protection**
- Public routes: `/login`, `/register`
- Protected routes wrapped in `<ProtectedRoute>` → `<AuthLayout>` → Page component
- `ProtectedRoute` checks `token` and shows loading state, redirects to login if missing
- All authenticated pages wrapped with `AuthLayout` which provides Sidebar
- Route parameters accessed via `useSearchParams()` (e.g., status filter)

**Component Patterns**
- State patterns: `useState` for each piece of state (search, page, loading, data)
- Fetch in `useEffect` with dependency array: `[page, search, status]`
- Separate useEffect for side effects (e.g., reset page when search changes)
- Error handling: try/catch with `.catch()` and `.finally()` for cleanup
- Safe array access: `Array.isArray(res.data?.data) ? res.data.data : []`
- Download handling: Create blob → create link → click to trigger download

**Reusable Components**
- **Button**: Supports variants (primary, secondary, success, danger, ghost, link), sizes, loading states, icons
- **Input**: Includes label, error handling, helper text, icon support, required indicators
- **Card**: Container with CardTitle, CardDescription, hover effects
- **Badge**: Status indicators with color variants (default, success, warning, danger, info)
- **Alert**: Dismissible alerts with icons for success, error, warning, info
- **Spinner**: Loading indicators with LoadingScreen and LoadingOverlay variants
- **Icons**: SVG icons (not emojis) for consistent professional look
- **Toast**: Context-based toast notifications via `useToast()` hook

**Styling**
- Tailwind CSS utility-first approach: `className="min-h-screen bg-slate-50 py-8 px-4"`
- Responsive classes: `sm:px-6`, `lg:px-8`, `flex-col sm:flex-row`
- Colors from slate palette: `bg-slate-50`, `text-slate-900`
- No CSS files or CSS-in-JS; all styling in className strings

**Linting**
- ESLint rules: `.varsIgnorePattern` allows uppercase/underscore prefixes (e.g., component names, constants)
- Ignores `dist/` folder
- React hooks plugin enabled

### General
- **Module System**: Both projects use ES6 modules (`"type": "module"` in package.json)
- **Environment Variables**: Backend uses `.env`; frontend uses Vite's auto-detection or hardcoded API URL
- **CORS**: Currently allows all origins (comment in `app.js` notes production update needed)

## Development Notes

- **Database**: Requires MongoDB Atlas connection string (already in `.env`)
- **JWT Secret**: Defined in `.env` as `JWT_SECRET` (change for production)
- **API Base URL**: Frontend likely points to `http://localhost:5000` in development
- **Hot Reload**: Frontend dev mode uses Vite HMR; backend uses nodemon
- **Ports**: Frontend (5173 default), Backend (5000 default)

## Common Tasks

- **Add New Feature**: Create controller → create route → add validation → link in routes file → create frontend component/page
- **Add New Model**: Create Mongoose schema in `models/` → export → use in controllers
- **Protect Route**: Use `authenticateToken` middleware on Express route
- **Call API**: Use axios in `quotationApi.js`, import in components

## MCP Servers

### Playwright
Configured for browser automation and end-to-end testing. Use to:
- Write and run E2E tests for user workflows (login, quotation creation, export)
- Validate frontend rendering and interactions
- Test API integration end-to-end

Install Playwright if not already present:
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```
