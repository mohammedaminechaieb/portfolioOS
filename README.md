# AmineOS Portfolio

A dual-mode interactive portfolio website featuring an **OS Mode** (retro operating system interface) and a **Desk Mode** (realistic wooden desk environment).

Built with Next.js 15, Express, Prisma, and PostgreSQL.

## Features

### 🖥️ OS Mode
- Boot sequence animation with kernel loading and hardware detection
- Draggable, resizable windows with traffic-light controls
- 6 application windows: About, Projects, Skills, Experience, Contact, Terminal
- Interactive terminal with commands: `help`, `neofetch`, `about`, `projects`, `skills`, `cat`, etc.
- Taskbar with app launchers, open window indicators, and a system clock

### 🪵 Desk Mode
- Wooden desk surface with leather desk pad and brass nameplate
- Monitor on the desk: click to boot into OS Mode
- Overhead shelf with books, folders, and papers containing portfolio info
- Click any shelf item to open and read its contents

### 🔐 Admin Panel (`/admin`)
- JWT authentication
- Manage Profile, Projects, Experience, Skills
- View and manage contact form messages
- Site settings (OS name, accent color, default mode)

### 📊 Database
- PostgreSQL with Prisma ORM
- Full CRUD API for all content
- Seed script with real portfolio data

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 3, Framer Motion 11 |
| Backend | Express.js, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| Hosting | Render (frontend, backend, and database) |

## Project Structure

```
portfolio/
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Main entry (mode switching)
│   │   │   ├── layout.tsx     # Root layout with SEO
│   │   │   ├── globals.css    # Global styles, CRT, wood textures
│   │   │   └── admin/         # Admin panel pages
│   │   ├── components/
│   │   │   ├── os/            # OS mode components
│   │   │   │   ├── BootSequence.tsx
│   │   │   │   ├── Desktop.tsx
│   │   │   │   ├── Window.tsx
│   │   │   │   ├── Taskbar.tsx
│   │   │   │   └── apps/      # Window applications
│   │   │   ├── desk/          # Desk mode scene
│   │   │   └── admin/         # Admin dashboard
│   │   ├── context/           # DataContext (global data)
│   │   └── lib/               # Types, API client
│   ├── tailwind.config.ts
│   └── package.json
├── server/                    # Express backend
│   ├── src/
│   │   ├── index.ts           # Express server entry
│   │   ├── seed.ts            # Database seed script
│   │   ├── routes/            # API route handlers
│   │   ├── middleware/        # JWT auth middleware
│   │   └── lib/               # Prisma client
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── Dockerfile
│   └── package.json
└── README.md
```

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local or Docker)
- npm or yarn

### 1. Clone and install

```bash
git clone <your-repo-url>
cd portfolio

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment variables

**Server**: create `server/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/portfolio_db"
JWT_SECRET="replace-with-a-long-random-string"
CLIENT_URL="http://localhost:3000"
PORT=4000
```

**Client**: create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> Never commit `.env` files. Make sure both are listed in `.gitignore`.

### 3. Set up the database

```bash
cd server

# Create the database (if it doesn't exist)
createdb portfolio_db

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed with portfolio data
npm run db:seed
```

### 4. Start development servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Visit:
- Portfolio: http://localhost:3000
- Admin: http://localhost:3000/admin
- API health: http://localhost:4000/api/health

### Admin account

The seed script creates the admin user. **Do not keep a default or shared password.** After seeding, log in at `/admin` and change the password immediately. If you make this repository public, keep the admin email and password out of the README and out of committed files.

## Deployment

Everything is hosted on **Render**: a PostgreSQL database, the Express backend, and the Next.js frontend. Deploy in this order: database, backend, frontend. The frontend needs the backend URL, and the backend needs the frontend URL for CORS.

### 1. Database: Render PostgreSQL

Go to Dashboard → New → PostgreSQL. Copy the **Internal Database URL** (used by the backend) and the **External Database URL** (used to seed from your own machine).

> Render's free PostgreSQL databases expire after about 30 days. For a long-lived portfolio, use a paid Render database or a free provider without expiry (e.g. Neon or Supabase) and use its connection string as `DATABASE_URL`.

### 2. Backend: Render Web Service

1. Dashboard → New → Web Service, and connect your GitHub repo.
2. Settings:
   - Root Directory: `server`
   - Runtime: Node
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && node dist/index.js`
3. Environment variables:

   ```env
   DATABASE_URL=<your-render-internal-postgres-url>
   JWT_SECRET=<generate-a-strong-random-string>
   CLIENT_URL=https://your-frontend.onrender.com
   ```

   Render provides `PORT` automatically, and your server should read `process.env.PORT`. You don't need to set it manually. If you don't know the frontend URL yet, deploy the frontend first with a placeholder API URL, or come back and update `CLIENT_URL` after step 3.

**Alternative: Docker.** Set Root Directory to `server` and Dockerfile Path to `./Dockerfile`.

### 3. Frontend: Render Web Service

1. Dashboard → New → Web Service, and connect the same GitHub repo.
2. Settings:
   - Root Directory: `client`
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. Environment variable:

   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

   `NEXT_PUBLIC_*` variables are baked in at build time. If you change this value later, trigger a new deploy.
4. Once the frontend is live, set `CLIENT_URL` on the backend to the frontend's URL and redeploy the backend.

### 4. Seed the database (one time)

The Render Shell is not available on the free plan, so run the seed from your own machine against the **External** database URL:

```bash
cd server
DATABASE_URL="<your-render-external-postgres-url>" npm run db:seed
```

Then log in at `/admin` and change the admin password.

### Keeping services awake (UptimeRobot)

Render's free web services spin down after about 15 minutes without traffic, and the next request can take 30-60 seconds to wake them up. To avoid this, create two free monitors at [UptimeRobot](https://uptimerobot.com):

| Monitor | URL |
|---------|-----|
| Backend | `https://your-backend.onrender.com/api/health` |
| Frontend | `https://your-frontend.onrender.com` |

Set the type to HTTP(s) and the interval to 5 minutes (anything under 15 keeps the service awake).

> **Free-hours limit:** Render's free plan gives about 750 instance hours per month per workspace. One service running 24/7 uses about 744, so two always-awake free services will exceed the limit and get suspended until the month resets. If you keep both awake, upgrade at least one service to a paid instance, or only ping the backend and accept a short wake-up on the frontend.

### Post-deployment checklist

- [ ] Visit your frontend URL: it should show the desk
- [ ] Click the monitor to boot into OS Mode
- [ ] Test the overhead shelf
- [ ] Open the terminal and run `neofetch`
- [ ] Go to `/admin` and log in
- [ ] Change the admin password
- [ ] Test the contact form
- [ ] Check all window apps work
- [ ] Confirm the UptimeRobot monitors report your services as up

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get profile info |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:slug` | Get project by slug |
| GET | `/api/experience` | List experience |
| GET | `/api/skills` | List skills |
| GET | `/api/education` | List education |
| GET | `/api/competitions` | List competitions |
| GET | `/api/certifications` | List certifications |
| GET | `/api/config` | Get site config |
| POST | `/api/messages` | Submit contact form |
| GET | `/api/health` | Health check |

### Admin (requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Verify token |
| PUT | `/api/profile` | Update profile |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/experience` | Create experience |
| PUT | `/api/experience/:id` | Update experience |
| DELETE | `/api/experience/:id` | Delete experience |
| POST | `/api/skills` | Create skill |
| PUT | `/api/skills/:id` | Update skill |
| DELETE | `/api/skills/:id` | Delete skill |
| GET | `/api/messages` | List messages |
| PUT | `/api/messages/:id/read` | Mark message read |
| DELETE | `/api/messages/:id` | Delete message |
| PUT | `/api/config` | Update site config |

## Customization

### Colors
Edit `client/tailwind.config.ts` to change the color scheme:
- `os-*` colors control OS Mode appearance
- `desk-*` colors control Desk Mode appearance
- `os-accent` is the primary accent (default: `#0ea5e9`)

### Boot text
Edit the seed script or update via the admin panel to change the boot sequence messages.

### Terminal commands
Add new commands in `client/src/components/os/apps/Terminal.tsx` in the `runCommand` switch statement.
