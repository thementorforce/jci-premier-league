# JCI Premier League - Developer Guidelines

## Build & Dev Commands
- Run local development server (uses Webpack to avoid Turbopack bugs): `npm run dev`
- Production build: `npm run build`
- Start built app: `npm start`
- Lint code: `npm run lint`

## Database & Seeding Workflow (Mandatory)
- **NO SQL MIGRATION SCRIPTS**: Do not run `prisma migrate dev` or generate sql migrations.
- **Local SQLite DB Sync**: Update your schema in `prisma/schema.prisma` and run:
  `npx prisma db push`
- **Local DB Seeding**:
  `npx prisma db seed`
- **Production database** (PostgreSQL on Cloud Run) is synchronized automatically at startup via Docker `CMD` using `prisma db push --accept-data-loss` and `prisma db seed`.
- **Local schema provider** must always be `sqlite` in version control. The deployment pipeline handles converting it to `postgresql` dynamically.
