# Student Organization Management System (SOMS)

A full-stack web application for managing student organizations, members, events, and announcements on campus.

## Live Links

- Frontend: <https://student-org-93ky.vercel.app>
- Backend API: <https://student-org-1-s1pk.onrender.com>
- Swagger API Docs: <https://student-org-1-s1pk.onrender.com/api/docs>

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18, Tailwind CSS, RxJS |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| File Upload | Multer |
| Validation | Zod |
| API Docs | Swagger |

## Repository Structure

```text
soms/
├── client/       Angular frontend
├── server/       Express API
├── screenshots/  Project screenshots
└── README.md
```

## Local Setup

### Backend

```bash
cd server
npm install
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

Swagger docs:

```text
http://localhost:5000/api/docs
```

Required `server/.env` values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:4200
MAX_FILE_SIZE_MB=5
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123
ADMIN_NAME=Admin
```

### Frontend

```bash
cd client
npm install
npm start
```

Frontend runs at:

```text
http://localhost:4200
```

## API Overview

Base URL:

```text
/api
```

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create student account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |

### Users

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/users` | admin |
| GET | `/api/users/:id` | authenticated |
| PUT | `/api/users/me` | authenticated |
| POST | `/api/users/me/avatar` | authenticated |
| DELETE | `/api/users/:id` | admin |

Avatar upload field:

```text
file
```

### Organizations

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/organizations` | public |
| GET | `/api/organizations/:id` | public |
| POST | `/api/organizations` | admin |
| PUT | `/api/organizations/:id` | admin |
| DELETE | `/api/organizations/:id` | admin |

Logo upload field:

```text
logo
```

### Members

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/organizations/:orgId/members` | public |
| POST | `/api/organizations/:orgId/join` | authenticated |
| POST | `/api/organizations/:orgId/members` | admin |
| PUT | `/api/organizations/:orgId/members/:memberId` | admin |
| DELETE | `/api/organizations/:orgId/members/:memberId` | admin |

### Events

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/events` | public |
| GET | `/api/events/:id` | public |
| POST | `/api/events` | admin |
| PUT | `/api/events/:id` | admin |
| DELETE | `/api/events/:id` | admin |

Supported query params:

```text
page, limit, search, organization, upcoming
```

Poster upload field:

```text
poster
```

### Announcements

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/announcements` | public |
| POST | `/api/announcements` | admin |
| PUT | `/api/announcements/:id` | admin |
| DELETE | `/api/announcements/:id` | admin |

Photo upload field:

```text
photo
```

### Registrations

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/registrations/me` | authenticated |
| POST | `/api/registrations/events/:eventId` | authenticated |
| DELETE | `/api/registrations/events/:eventId` | authenticated |
| GET | `/api/registrations/events/:eventId` | admin |

## Features

- Admin and student login
- Role-based access control
- Organization management
- Member management
- Event posting and registration
- Announcement posting
- Image uploads for avatars, organizations, events, and announcements
- Search, filtering, and pagination
- Responsive Angular UI
- Swagger API documentation

## Deployment

### Backend on Render

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Required environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://student-org-93ky.vercel.app
NODE_ENV=production
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123
ADMIN_NAME=Admin
```

### Frontend on Vercel

Production API URL is configured in:

```text
client/src/environments/environment.ts
```

Use:

```ts
apiUrl: 'https://student-org-1-s1pk.onrender.com/api'
```

Build command:

```bash
npm install && npm run build
```

Output directory:

```text
dist/soms-client/browser
```
