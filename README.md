# Kindly Labs Web

Frontend applications for the Kindly Labs platform.

## Apps

| App | Port | Production URL | Deploy Target |
|-----|------|----------------|---------------|
| aether-pwa | 3004 | app.kindly-labs.org | Vercel |
| auralnet | 4321 | kindly-labs.org | Netlify |
| workbench | 3003 | contribute.kindly-labs.org | Vercel |
| admin-console | 3001 | (local only) | - |

## Shared Packages

| Package | Description |
|---------|-------------|
| @aether/api-client | Unified API client |
| @aether/voice-utils | Audio utilities |
| @aether/ui-kit | Shared React components |
| @aether/eslint-config | Shared linting rules |

## Development

```bash
# Install dependencies
npm install

# Start all apps
npm run dev

# Start specific app
cd apps/aether-pwa && npm run dev

# Build all
npm run build

# Run tests
npm test
```

## Environment

Each app needs its own `.env.local`:

```env
# apps/aether-pwa/.env.local
NEXT_PUBLIC_API_URL=https://api.cogito.cv
NEXT_PUBLIC_WS_URL=wss://api.cogito.cv

# apps/workbench/.env.local
NEXT_PUBLIC_API_URL=https://api.cogito.cv
```

## Deployment

- **Vercel**: Connect repo, set root directory to `apps/aether-pwa` or `apps/workbench`
- **Netlify**: Connect repo, set root directory to `apps/auralnet`
