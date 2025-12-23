# Owly Labs — Memory Bank

> Last updated: December 16, 2025

This directory contains project context and documentation for AI assistants.

## Project Overview

**Owly Labs** is a Fair Trade AI technology consulting firm helping immigrant-owned small businesses in San Francisco access free technology.

## Tech Stack

- **Framework**: Astro 5.15.5
- **UI**: React 19.2.0 + Three.js for 3D
- **Styling**: CSS Custom Properties + Tailwind
- **Deployment**: Netlify

## Recent Work

### Dialect Workflow Portal (December 2025)

Added a role-based portal at `/portal` for managing dialect data collection:

| Role             | Login               | Dashboard           |
| ---------------- | ------------------- | ------------------- |
| 👑 Owly Admin    | admin@owlylabs.com  | `/portal/admin`     |
| 🗣️ Dialect Admin | toisan@owlylabs.com | `/portal/dialect`   |
| 🎓 Expert        | expert@owlylabs.com | `/portal/expert`    |
| 🏢 Partner       | demo@owlylabs.com   | `/portal/dashboard` |

**Password:** `demo123`

#### Files Created

- `src/data/portal-data.ts` — Mock data layer
- `src/pages/portal/admin/index.astro` — Admin dashboard
- `src/pages/portal/dialect/index.astro` — Dialect admin dashboard
- `src/pages/portal/expert/index.astro` — Expert dashboard
- `src/pages/portal/expert/tasks.astro` — Task queue page
- `src/layouts/PortalLayout.astro` — Updated with role-based navigation

#### Key Features

- Role-based sidebar navigation (tabs show/hide per role)
- Session storage for user auth state
- Mock data: 2 dialects, 5 topics, 5 phrases

#### Pending (Phase 2)

- Topics/Phrases CRUD pages
- Expert task submission flow
- 2-peer validation workflow
- Stripe mock payments

---

## Key Directories

```
src/
├── components/
│   ├── layouts/      # Page layouts
│   ├── sections/     # Page-specific sections
│   ├── shared/       # Header, Footer, ChatWidget
│   ├── ui/           # Reusable UI components
│   └── features/     # Feature-specific components (Passport)
├── pages/
│   ├── portal/       # Partner/admin portal
│   └── ...           # Marketing pages
├── data/             # Typed data modules
├── styles/           # Global styles (new-theme.css)
└── lib/              # Utility functions
```

## Design System

- **Theme**: Nature-inspired forest palette
- **Colors**: Deep greens, sunset oranges, leaf accents
- **Effects**: Glass morphism, frosted overlays
- **Components**: 20+ reusable UI components

See `STYLE_GUIDE.md` and `COMPONENTS.md` for details.

## Commands

```bash
npm run dev     # Dev server at localhost:4321
npm run build   # Production build to ./dist/
npm run preview # Preview production build
```
