# SkillForge — MERN Stack Edition

This is the full-stack conversion of the original SkillForge landing page. The
design (hero, about, courses, hiring partners, contact) is carried over
exactly, but it's now backed by a real Node/Express API and MongoDB, with:

- JWT-based authentication (register/login, hashed passwords with bcrypt)
- Course enrollment — logged-in users can enroll, see their courses, and cancel
- A contact form that actually saves leads to the database
- An admin panel (course CRUD, all enrollments, contact leads, dashboard stats)

## Project structure

```
skillforge-mern/
├── server/        Express + MongoDB API
└── client/        React (Vite) frontend
```

## 1. Set up MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/cloud/atlas/register
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, add your IP (or `0.0.0.0/0` for "allow from anywhere"
   while developing — tighten this later).
4. Click **Connect** on your cluster → **Drivers** → copy the connection string.
   It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — your Atlas connection string from step 1 (add `/skillforge`
  before the `?` so it uses a database named `skillforge`)
- `JWT_SECRET` — generate one with:
  `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials for your first admin account

Seed the database (creates the 6 courses + your admin account):

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default. Check it's alive at
`http://localhost:5000/api/health`.

## 3. Frontend setup

```bash
cd client
npm install
cp .env.example .env
```

`.env` just needs `VITE_API_URL=http://localhost:5000/api` for local dev.

```bash
npm run dev
```

The site runs on `http://localhost:5173`.

## 4. Try it out

- Sign up a regular account at `/register`, enroll in a course from the
  Courses section, then check `/dashboard` to see it.
- Log in with the admin account you set in `.env` (`ADMIN_EMAIL` /
  `ADMIN_PASSWORD`) and visit `/admin` to manage courses, see all enrollments,
  and view contact leads.
- New users register as `student` only — there's no way to self-promote to
  admin from the UI, by design. Promote someone to admin by editing their
  `role` field to `"admin"` directly in Atlas (Browse Collections → users),
  or extend the seed script if you want more admins.

## API overview

| Method | Route                 | Access        | Description                  |
|--------|------------------------|---------------|-------------------------------|
| POST   | /api/auth/register      | Public        | Create a student account      |
| POST   | /api/auth/login         | Public        | Log in, returns JWT           |
| GET    | /api/auth/me             | Private       | Current user profile          |
| GET    | /api/courses              | Public        | List courses (optional `?category=`) |
| POST/PUT/DELETE | /api/courses/:id | Admin        | Manage courses                |
| POST   | /api/enrollments         | Private       | Enroll in a course            |
| GET    | /api/enrollments/me      | Private       | My active enrollments         |
| DELETE | /api/enrollments/:id     | Private/Admin | Cancel an enrollment          |
| GET    | /api/enrollments         | Admin         | All enrollments                |
| POST   | /api/contact              | Public        | Submit the contact form       |
| GET/PATCH/DELETE | /api/contact/:id | Admin       | Manage contact leads          |
| GET    | /api/admin/stats          | Admin         | Dashboard counts              |

## Deployment

This follows the same pattern as your other MERN projects:

**Backend → Render**
1. Push this repo to GitHub.
2. New Web Service on Render, root directory `server`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add the same environment variables from your `.env` (`MONGO_URI`,
   `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `ADMIN_*`) in Render's
   dashboard. Set `CLIENT_URL` to your deployed frontend URL once you have it.
5. After the first deploy, run the seed script once via Render's shell
   (`npm run seed`) to populate courses and create the admin account.

**Frontend → Netlify or Vercel**
1. Root directory `client`. Build command: `npm run build`. Publish
   directory: `dist`.
2. Add environment variable `VITE_API_URL` pointing at your deployed Render
   URL, e.g. `https://skillforge-api.onrender.com/api`.

## Security notes for a portfolio project

- Passwords are hashed with bcrypt; the password hash is never returned by
  the API (`select: false` on the field).
- JWTs are signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN` (30
  days by default).
- Login and contact-form routes are rate-limited to slow down brute-force
  and spam.
- `helmet` sets sensible security headers; CORS is locked to `CLIENT_URL`.
- The token is stored in `localStorage` on the frontend, which is the
  standard teaching pattern for a project like this. For a production app
  handling sensitive data you'd typically move to httpOnly cookies instead —
  worth mentioning if this comes up in an interview.
