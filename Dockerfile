# Base image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Prune devDependencies to keep production node_modules clean
RUN npm prune --production

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy all production node_modules (ensures Prisma CLI and its dependencies like 'effect' are present)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Ensure query engines are executable by nextjs user
RUN find ./node_modules/ -type f -name "query-engine-*" -exec chmod +x {} \;

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Sync schema to production database (with retry loop for Cloud SQL proxy setup), seed system metadata, and start the standalone server
CMD ["sh", "-c", "[ -n \"$DATABASE_URL\" ] && export DATABASE_URL=$(echo \"$DATABASE_URL\" | sed 's|@/|@localhost/|') ; (for i in 1 2 3 4 5; do echo \"Database init attempt $i...\" && node node_modules/prisma/build/index.js db push --accept-data-loss && node prisma/seed.js && echo \"Database initialized successfully.\" && break || (echo \"Database init attempt $i failed, retrying in 5s...\" && sleep 5); done) & exec node server.js"]
