This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🛠 Database & Development Workflow (Mandatory Guidelines)

To maintain database sync between local development (SQLite) and production (PostgreSQL on Cloud Run), please follow these guidelines carefully:

### 1. Database Schema Changes (No Migration Scripts)
We **do not use SQL migration scripts** in this project. Prisma automatically synchronizes the database using schema pushes.
* **To make a schema change**:
  1. Modify the [prisma/schema.prisma](file:///Users/ajithmeghana/repos/jci-premier-league/prisma/schema.prisma) file directly.
  2. Sync your local SQLite database by running:
     ```bash
     npx prisma db push
     ```
  3. Commit and push the updated `schema.prisma` file to Git.
* **When pulling remote changes**:
  If another developer updated the schema, run `git pull` followed by:
  ```bash
  npx prisma db push
  ```

### 2. Local Development Server
Always run the local development server using the Webpack compiler (Turbopack has known compilation panics inside sandbox/constrained environments):
```bash
npm run dev
```
*(This maps to `next dev --webpack` as configured in `package.json`)*.

### 3. Production Deployments (Cloud Run)
Do not worry about updating the production database structure. When code is pushed to `main`, the container starts on Cloud Run and automatically runs the schema push (`npx prisma db push --accept-data-loss`) and system seeding (`npx prisma db seed`) in the background.

