# Insighta Labs+ — Web Portal

A production-grade Next.js web portal for the Insighta Labs+ Profile Intelligence System.

## Tech Stack

- **Framework**: Next.js 15 (App Router, no `src/` directory)
- **Styling**: Tailwind CSS v3 with custom design tokens
- **Auth**: Delegated fully to the backend (GitHub OAuth → backend sets HTTP-only cookie)
- **Language**: TypeScript

---

## Architecture

```
insighta-web/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, global CSS)
│   ├── page.tsx                    # Root redirect (→ /dashboard or /login)
│   ├── globals.css                 # Tailwind + global styles
│   │
│   ├── login/
│   │   ├── page.tsx                # Login page (GitHub OAuth CTA)
│   │   └── GitHubLoginButton.tsx   # "Continue with GitHub" button
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx            # Post-OAuth landing page (verifies cookie)
│   │
│   └── (authenticated)/            # Route group — requires valid session
│       ├── layout.tsx              # Server Component: checks cookie, redirects if unauthenticated
│       ├── dashboard/page.tsx      # Metrics, recent profiles
│       ├── profiles/
│       │   ├── page.tsx            # List with filters, sort, pagination, export
│       │   ├── create/page.tsx     # Admin-only: create profile by name
│       │   └── [id]/page.tsx       # Profile detail view
│       ├── search/page.tsx         # Natural language search
│       └── account/page.tsx        # User info, permissions, sign out
│
├── components/                     # Shared UI components
│   ├── Sidebar.tsx
│   ├── Pagination.tsx
│   ├── Spinner.tsx
│   ├── Toast.tsx
│   ├── EmptyState.tsx
│   ├── SkeletonTable.tsx
│   └── ConfirmModal.tsx
│
├── hooks/
│   └── useAuth.ts                  # Client-side user fetch hook
│
└── lib/
    ├── api.ts                      # Backend API client (credentials: include)
    ├── auth-server.ts              # Server-side user fetch (forwards cookies)
    └── utils.ts                    # Formatting helpers
```

---

## Authentication Flow

The web portal does **not** implement its own OAuth. It delegates entirely to the backend:

```
1. User clicks "Continue with GitHub"
   → Browser navigates to: BACKEND_URL/auth/github?redirect_uri=PORTAL/auth/callback

2. Backend redirects user to GitHub OAuth page

3. User authorises on GitHub

4. GitHub redirects to: BACKEND_URL/auth/github/callback

5. Backend:
   - Exchanges the code for an access token
   - Fetches user info from GitHub
   - Creates/updates the user in the database
   - Sets an HTTP-only cookie (access_token, refresh_token)
   - Redirects to: PORTAL/auth/callback

6. Portal /auth/callback:
   - Calls GET BACKEND_URL/auth/me (with credentials: include)
   - Verifies the cookie is valid
   - Redirects to /dashboard
```

### Why HTTP-only cookies?

The backend sets `Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Lax`.  
JavaScript **cannot** read this cookie. Every subsequent API call from the portal uses  
`credentials: 'include'` so the browser automatically attaches the cookie.

This satisfies the requirement: *"Tokens must not be accessible via JavaScript"*.

---

## Role Enforcement

| Feature                  | Admin | Analyst |
|--------------------------|-------|---------|
| View profiles            | ✅    | ✅      |
| Search profiles          | ✅    | ✅      |
| Export CSV               | ✅    | ✅      |
| Create profiles          | ✅    | ❌      |
| Delete profiles          | ✅    | ❌      |

The backend enforces role permissions on every request. The portal additionally:
- Hides the "Create" button and "Delete" icons for non-admin users
- Redirects non-admins away from `/profiles/create`

---

## Setup & Running

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# URL of your running backend (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Backend CORS & cookie config

Your backend must:
- Allow CORS from the portal's origin (e.g. `http://localhost:3000`)
- Set `credentials: true` in CORS options
- Set cookies with `SameSite=Lax` (or `None` + `Secure` for cross-origin)

The backend's GitHub OAuth callback URL registered with GitHub should be:
```
BACKEND_URL/auth/github/callback
```

After a successful login the backend should redirect to:
```
PORTAL_URL/auth/callback
```

You can pass the portal URL as a `redirect_uri` query param from the login button, or configure it as an env var on the backend.

### 4. Run development server

```bash
npm run dev
# → http://localhost:3000
```

### 5. Build for production

```bash
npm run build
npm start
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | GitHub OAuth entry point |
| `/auth/callback` | Post-OAuth session verification |
| `/dashboard` | Stats, gender breakdown, recent profiles |
| `/profiles` | Full list with filters, sorting, pagination, CSV export |
| `/profiles/[id]` | Profile detail with confidence bars |
| `/profiles/create` | Admin-only profile creation |
| `/search` | Natural language search |
| `/account` | User info, permissions, sign out |

---

## CI/CD

GitHub Actions runs on every PR to `main`:
- ESLint lint check
- Next.js production build (type-safe)

See `.github/workflows/ci.yml`.

---

## Design System

Custom Tailwind tokens:

| Token | Value | Use |
|-------|-------|-----|
| `ink` | `#0C0C0F` | Page background |
| `ink-soft` | `#16161D` | Card background |
| `ink-muted` | `#22222E` | Input background |
| `slate-edge` | `#2A2A3A` | Borders |
| `slate-light` | `#6B6B8A` | Secondary text |
| `cream` | `#F5F0E8` | Primary text |
| `accent` | `#7C6AF7` | Interactive elements |
| `signal-green` | `#2ECC71` | Success / active |
| `signal-blue` | `#3498DB` | Male / info |
| `signal-red` | `#E74C3C` | Danger |
| `signal-amber` | `#F39C12` | Warning |

Fonts: **DM Serif Display** (headings) + **DM Sans** (body) + **JetBrains Mono** (code/numbers)