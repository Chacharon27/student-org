# 🎓 Student Organization Management System (SOMS)

A full-stack web application for managing student organizations, members, events, and announcements on a campus.

Built as the final project for **ITAS4 (Client-Side Web Programming)** and **ITAS5 (Server-Side Web Programming)**.

---

## 1. Project Overview

**SOMS** lets administrators manage student organizations, post announcements, and create events, while students can browse organizations, request membership, and register for events. Authentication is JWT-based with role-based access (Admin / Student).

## 2. Live Links

> Replace these placeholders after deploying.

- 🌐 **Frontend (Angular)**: <https://YOUR-FRONTEND.vercel.app>
- 🛰️ **Backend API (Node/Express)**: <https://YOUR-API.onrender.com>
- 📘 **API Docs (Swagger)**: <https://YOUR-API.onrender.com/api/docs>

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18 (standalone components), Tailwind CSS, RxJS |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Upload | Multer (local disk → `/uploads`) |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |

## 4. Repository Structure

```
soms/
├── client/        → Angular frontend
├── server/        → Node.js + Express + TypeScript API
├── screenshots/   → UI + Postman screenshots
├── .env           → root template (see server/.env.example)
└── README.md
```

## 5. Setup Instructions

### Prerequisites
- Node.js ≥ 18
- npm
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Run the Backend

```bash
cd server
npm install
cp .env.example .env       # then edit with your values
npm run dev                # http://localhost:5000
```

`server/.env`:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/soms
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:4200
MAX_FILE_SIZE_MB=5
```

Swagger docs: http://localhost:5000/api/docs

### Run the Frontend

```bash
cd client
npm install
npm start                  # http://localhost:4200
```

The dev environment points to `http://localhost:5000` automatically (`src/environments/environment.development.ts`).

For production, edit `src/environments/environment.ts` and set `apiUrl` to your deployed API URL.

### First admin user

Register a user via the UI, then promote them in MongoDB:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## 6. API Overview

Base URL: `/api`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user |

### Users
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/users` | admin |
| GET | `/api/users/:id` | auth |
| PUT | `/api/users/me` | auth |
| POST | `/api/users/me/avatar` *(multipart `file`)* | auth |
| DELETE | `/api/users/:id` | admin |

### Organizations
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/organizations` | public |
| GET | `/api/organizations/:id` | public |
| POST | `/api/organizations` *(multipart `logo`)* | admin |
| PUT | `/api/organizations/:id` | admin |
| DELETE | `/api/organizations/:id` | admin |

### Members
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/organizations/:orgId/members` | public |
| POST | `/api/organizations/:orgId/join` | auth |
| POST | `/api/organizations/:orgId/members` | admin |
| PUT | `/api/organizations/:orgId/members/:memberId` | admin |
| DELETE | `/api/organizations/:orgId/members/:memberId` | admin |

### Events
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/events?page&limit&search&organization&upcoming` | public |
| GET | `/api/events/:id` | public |
| POST | `/api/events` *(multipart `poster`)* | admin |
| PUT | `/api/events/:id` | admin |
| DELETE | `/api/events/:id` | admin |

### Announcements
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/announcements` | public |
| POST | `/api/announcements` | admin |
| PUT | `/api/announcements/:id` | admin |
| DELETE | `/api/announcements/:id` | admin |

### Registrations
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/registrations/me` | auth |
| POST | `/api/registrations/events/:eventId` | auth |
| DELETE | `/api/registrations/events/:eventId` | auth |
| GET | `/api/registrations/events/:eventId` | admin |

## 7. Features Implemented

### Client-side (Angular)
- ✅ Component-based architecture (standalone components, lazy-loaded routes)
- ✅ Angular Router + route guards (`authGuard`, `adminGuard`)
- ✅ Reactive Forms with validation
- ✅ HttpClient + Interceptors (auth + global error)
- ✅ RxJS (`Subject`, `debounceTime`, `forkJoin`)
- ✅ Tailwind CSS (responsive layouts, custom design tokens)
- ✅ Loading + error states with toast notifications
- ✅ Service-based state management (Signals + RxJS)

### Server-side (Node.js + Express)
- ✅ RESTful API with full CRUD on all resources
- ✅ Controllers + routers separation
- ✅ Middleware: CORS, Helmet, morgan logging, rate limiting, error handler
- ✅ Zod validation/sanitization on all write endpoints
- ✅ JWT authentication + bcrypt password hashing
- ✅ Role-based authorization (`admin`, `student`)
- ✅ MongoDB integration (Mongoose models with indexes)
- ✅ File upload (avatars, org logos, event posters) via Multer
- ✅ Swagger / OpenAPI docs at `/api/docs`

### Required system features
- ✅ User Registration & Login
- ✅ Role-based Access (Admin / Student)
- ✅ Search / Filter / Pagination on lists
- ✅ File Upload (image)
- ✅ Fully integrated frontend ↔ backend

## 8. Deployment

### Backend → Render
1. Push to GitHub.
2. On [Render](https://render.com) → **New Web Service**, point at `server/`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `NODE_ENV=production`.
6. Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) for the database.

### Frontend → Vercel / Netlify / Render Static
1. Update `client/src/environments/environment.ts` → `apiUrl: 'https://YOUR-API.onrender.com'`.
2. Build command: `npm install && npm run build`
3. Output directory: `dist/soms-client/browser`
4. Set as a SPA (rewrite all routes to `index.html`).

## 9. Screenshots

Place UI screenshots and Postman tests in the `screenshots/` folder, e.g.:

```
screenshots/
├── 01-login.png
├── 02-dashboard.png
├── 03-organizations.png
├── 04-events.png
├── 05-announcements.png
├── 06-postman-auth.png
└── 07-postman-events.png
```

## 10. Suggested Group Roles

- Frontend Developer — Angular components & UI
- Backend Developer — REST API & database
- UI/UX Designer — Tailwind design system, screenshots
- Security/Auth Lead — JWT, RBAC, validation
- Repository/Documentation Manager — README, deployment, demo

---

📦 **License**: MIT — for academic use.
