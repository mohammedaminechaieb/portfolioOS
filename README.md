# AmineOS Portfolio

A dual-mode interactive portfolio website featuring an **OS Mode** (retro operating system interface) and a **Desk Mode** (realistic wooden desk environment).

Built with **Next.js 15**, **Express**, **Prisma**, and **PostgreSQL**.

---

## Features

### 🖥️ OS Mode
- Boot sequence animation with kernel loading, hardware detection
- Draggable, resizable windows with traffic-light controls
- 6 application windows: About, Projects, Skills, Experience, Contact, Terminal
- Interactive terminal with commands: `help`, `neofetch`, `about`, `projects`, `skills`, `cat`, etc.
- Taskbar with app launchers, open window indicators, system clock

### 🪵 Desk Mode
- Wooden desk surface with leather desk pad and brass nameplate
- Monitor on desk — click to boot into OS Mode
- Overhead shelf with books, folders, and papers containing portfolio info
- Click any shelf item to open and read its contents

### 🔐 Admin Panel (`/admin`)
- JWT authentication
- Manage Profile, Projects, Experience, Skills
- View and manage Contact form messages
- Site settings (OS name, accent color, default mode)

### 📊 Database
- PostgreSQL with Prisma ORM
- Full CRUD API for all content
- Seed script with real portfolio data

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 15, React 19, TypeScript    |
| Styling   | Tailwind CSS 3, Framer Motion 11    |
| Backend   | Express.js, TypeScript              |
| ORM       | Prisma                              |
| Database  | PostgreSQL                          |
| Auth      | JWT (jsonwebtoken, bcryptjs)        |
| Deploy    | Vercel (frontend), Render (backend) |

---

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

---

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

**Server** — create `server/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/portfolio_db"
JWT_SECRET="your-super-secret-jwt-key-change-this"
CLIENT_URL="http://localhost:3000"
PORT=4000
```

**Client** — create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Set up the database

```bash
cd server

# Create the database (if not exists)
createdb portfolio_db

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed with portfolio data
npm run db:seed
```

### 4. Start development servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Visit:
- **Portfolio**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API Health**: http://localhost:4000/api/health

### Default admin credentials
- **Email**: `m.amine.chaieb@gmail.com`
- **Password**: `admin123`

⚠️ **Change the password after first login!**

---

## Deployment

### Backend — Render

1. **Create a PostgreSQL database** on [Render](https://render.com):
   - Go to Dashboard → New → PostgreSQL
   - Copy the **Internal Database URL**

2. **Create a Web Service**:
   - Connect your GitHub repo
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx prisma migrate deploy && node dist/index.js`
   - **Environment**: Node

3. **Set environment variables** on Render:
   ```
   DATABASE_URL=<your-render-internal-postgres-url>
   JWT_SECRET=<generate-a-strong-random-string>
   CLIENT_URL=https://your-app.vercel.app
   PORT=4000
   ```

4. **Seed the database** (one-time):
   - Open the Render Shell for your service
   - Run: `node dist/seed.js`

   Or use Docker:
   ```
   Root Directory: server
   Dockerfile Path: ./Dockerfile
   ```

### Frontend — Vercel

1. **Import project** on [Vercel](https://vercel.com):
   - Connect your GitHub repo
   - **Root Directory**: `client`
   - **Framework Preset**: Next.js

2. **Set environment variable**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

3. **Deploy** — Vercel auto-detects Next.js and deploys.

### Post-deployment checklist

- [ ] Visit your Vercel URL — should show the desk
- [ ] Click the monitor to boot into OS mode
- [ ] Test the overhead shelf
- [ ] Open the terminal and run `neofetch`
- [ ] Go to `/admin` and log in
- [ ] **Change the default admin password**
- [ ] Test the contact form
- [ ] Check all window apps work

---

## API Endpoints

### Public
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/profile`        | Get profile info     |
| GET    | `/api/projects`       | List projects        |
| GET    | `/api/projects/:slug` | Get project by slug  |
| GET    | `/api/experience`     | List experience      |
| GET    | `/api/skills`         | List skills          |
| GET    | `/api/education`      | List education       |
| GET    | `/api/competitions`   | List competitions    |
| GET    | `/api/certifications` | List certifications  |
| GET    | `/api/config`         | Get site config      |
| POST   | `/api/messages`       | Submit contact form  |
| GET    | `/api/health`         | Health check         |

### Admin (requires JWT)
| Method | Endpoint                 | Description           |
|--------|--------------------------|-----------------------|
| POST   | `/api/auth/login`        | Login, get JWT        |
| GET    | `/api/auth/me`           | Verify token          |
| PUT    | `/api/profile`           | Update profile        |
| POST   | `/api/projects`          | Create project        |
| PUT    | `/api/projects/:id`      | Update project        |
| DELETE | `/api/projects/:id`      | Delete project        |
| POST   | `/api/experience`        | Create experience     |
| PUT    | `/api/experience/:id`    | Update experience     |
| DELETE | `/api/experience/:id`    | Delete experience     |
| POST   | `/api/skills`            | Create skill          |
| PUT    | `/api/skills/:id`        | Update skill          |
| DELETE | `/api/skills/:id`        | Delete skill          |
| GET    | `/api/messages`          | List messages         |
| PUT    | `/api/messages/:id/read` | Mark message read     |
| DELETE | `/api/messages/:id`      | Delete message        |
| PUT    | `/api/config`            | Update site config    |

---

## Customization

### Colors
Edit `client/tailwind.config.ts` to change the color scheme:
- `os-*` colors control OS mode appearance
- `desk-*` colors control Desk mode appearance
- `os-accent` is the primary accent (default: `#0ea5e9`)

### Boot Text
Edit the seed script or update via admin panel to change the boot sequence messages.

### Terminal Commands
Add new commands in `client/src/components/os/apps/Terminal.tsx` in the `runCommand` switch statement.

---

## License

MIT
