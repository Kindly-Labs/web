# Aether Console

> Unified internal tools dashboard for the AuralNet Platform.

## Features

### 1. System Console

- Process management (Start/Stop services)
- Real-time log streaming (SSE)
- Health monitoring

### 2. Workbench

- Data labeling interface
- Audio recorder for Golden Samples
- Assignment queue management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Port**: 3001
- **API**: Next.js Route Handlers + `execa`

## Development

```bash
# Start independently
npm run dev

# Start via platform script
cd ../../..
./aether.sh dev
```
