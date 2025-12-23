# Aether PWA

Voice-first AI companion for preserving endangered languages, starting with Toishanese.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3004
```

## Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

## Scripts

```bash
npm run dev       # Development server (port 3004)
npm run build     # Production build
npm run start     # Production server (port 3001)
npm test          # Jest unit tests
npx playwright test   # E2E tests
```

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## Architecture

```
src/
├── app/          # Next.js routes
├── scenes/       # Feature views (Session, Onboarding, Gap)
└── shared/       # Hooks, utils, i18n
```

See root `/software/CLAUDE.md` for full monorepo documentation.
