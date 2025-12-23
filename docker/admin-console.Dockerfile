# Admin Console Dockerfile
# Build from web root: docker build -f docker/admin-console.Dockerfile .

# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy package files for dependency installation
COPY package.json package-lock.json* ./
COPY turbo.json ./

# Copy workspace package.json files
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/ui-kit/package.json ./packages/ui-kit/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/admin-console/package.json ./apps/admin-console/

# Install dependencies
RUN npm ci

# ==========================================
# Stage 2: Build
# ==========================================
FROM node:22-alpine AS builder
WORKDIR /app

# Build arguments
ARG NEXT_PUBLIC_BACKEND_URL=https://api.cogito.cv
ARG BACKEND_URL=https://api.cogito.cv

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api-client/node_modules ./packages/api-client/node_modules
COPY --from=deps /app/packages/ui-kit/node_modules ./packages/ui-kit/node_modules

# Copy source
COPY . .

# Set build environment
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build packages first, then admin-console
RUN npm run build --workspace=@owly-labs/api-client --workspace=@owly-labs/ui-kit --if-present || true
RUN npm run build --workspace=auralnet-console

# ==========================================
# Stage 3: Production
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets
COPY --from=builder /app/apps/admin-console/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-console/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-console/.next/static ./apps/admin-console/.next/static

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# The standalone output creates server.js at the app level
CMD ["node", "apps/admin-console/server.js"]
