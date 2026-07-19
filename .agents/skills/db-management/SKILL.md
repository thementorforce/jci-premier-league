---
name: db-management
description: Reference guide for managing database schema modifications, migrations, and seeding both locally and in production for the Franchise Cricket League project.
---

# Database & Development Workflow Management

This skill provides the mandatory instructions and workflows for changing, migrating, and seeding the database for both local development and production environments.

---

## 1. Local Database Schema Changes

Whenever you need to update the database schema:

1. **Modify the Schema File**:
   Update [schema.prisma](file:///Users/ajithmeghana/repos/jci-premier-league/prisma/schema.prisma) with your changes.

2. **Generate a Migration**:
   Run the following command to generate a versioned migration file:
   ```bash
   npx prisma migrate dev --name <migration-description>
   ```
   > [!IMPORTANT]
   > Do **NOT** use `npx prisma db push` for schema changes. Using versioned migrations is mandatory to maintain database state consistency.

3. **Commit Migrations**:
   Commit the generated SQL migration files inside `prisma/migrations/` to Git.

4. **Seeding Local Data**:
   To seed local mock data (teams, players, ads, owner accounts):
   ```bash
   npx prisma db seed
   ```

---

## 2. Production Database Deployment

When deploying database changes to the production environment:

1. **Schema Sync**:
   Sync the database schema (which changes from SQLite to PostgreSQL in CI/CD via `sed` script before build):
   ```bash
   npx prisma db push --accept-data-loss
   ```
   > [!NOTE]
   > We use `db push` in production because versioned migrations differ between SQLite (local) and PostgreSQL (production). `db push` automatically resolves the schema state directly against the production database at startup.

2. **Production Seeding**:
   Seeding in production is designed to be safe and incremental. It **only** inserts essential metadata (such as the default `admin` user if missing) and does **not** wipe existing registration/bidding data or insert dummy players. Run it via:
   ```bash
   npx prisma db seed
   ```

3. **Containerized Entrypoint**:
   Both schema sync and seeding are run automatically at container startup via the `Dockerfile` `CMD` before launching the Next.js server.

---

## 3. Development Server Compiler Configuration

Due to Turbopack CSS compile panics inside constrained environments, the Next.js development server should be executed using the Webpack compiler:
```bash
npm run dev
```
*(This maps to `next dev --webpack` as configured in `package.json`)*.
