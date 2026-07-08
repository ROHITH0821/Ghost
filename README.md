# Ghost

AI mystery shopper swarm that sends virtual AI customers into any website to understand the business, detect conversion leaks, and generate improvement reports.

## Tech Stack

- **Next.js 15** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

- **Prisma** + SQLite for users & OTP storage
- **Resend** for email OTP delivery
- **jose** for JWT session cookies

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in your keys
npm run db:push        # create SQLite database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Authentication (Email + OTP via Resend)

1. Create a free account at [resend.com](https://resend.com)
2. Add your API key and verified sender to `.env`:

```env
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="Ghost <onboarding@resend.dev>"
AUTH_SECRET="your-32-char-secret"          # openssl rand -base64 32
DATABASE_URL="file:./prisma/dev.db"
```

3. **Dev without Resend:** leave `RESEND_API_KEY` unset — OTP codes print to the terminal.

### Auth flow

- `/login` — enter email → receive 6-digit OTP → signed in for 30 days
- `/mission/*` and `/results/*` — protected by middleware (redirects to login)
- Hero CTA redirects to login if not signed in, then auto-starts the scan

### API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/send-otp` | POST | Send OTP to email |
| `/api/auth/verify-otp` | POST | Verify OTP & create session |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/me` | GET | Current user |

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── mission/[id]/       # AI mission sequence
│   ├── results/[id]/       # Intelligence report
│   └── api/                # API routes (backend-ready)
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── landing/            # Landing page sections
│   ├── mission/            # Mission dashboard components
│   ├── results/            # Report components
│   └── layout/             # Header, Footer
└── lib/
    ├── api/                # API client layer
    ├── types.ts            # TypeScript interfaces
    ├── constants.ts        # App constants
    └── mock-data.ts        # Mock data for demo
```

## Backend Integration

The API layer in `src/lib/api/ghost-api.ts` is designed for easy backend swap:

- `POST /api/analyze` — Start a Ghost mission
- `GET /api/analyze?missionId=xxx` — Poll mission status
- `GET /api/reports/[id]` — Fetch intelligence report

Replace mock implementations in `ghost-api.ts` with real AI backend calls.

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Midnight | `#050510` | Background |
| Navy | `#0B1020` | Cards, surfaces |
| Ghost White | `#F8FAFC` | Text |
| Electric Violet | `#7C3AED` | Primary accent |
| AI Blue | `#38BDF8` | Secondary accent |
| Neon Green | `#22C55E` | Success only |

Fonts: **Space Grotesk** (headings), **Inter** (body)
