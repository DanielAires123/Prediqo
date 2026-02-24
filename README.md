# Prediqo

Skill-based sports prediction platform. No real money — pure skill, ELO-based probabilities, confidence points, and seasonal ranking.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion
- **Backend:** Next.js API routes, Prisma, PostgreSQL (Supabase)
- **Auth:** Supabase Auth (email/password)

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com).
   - In **Settings → API**: copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - In **Settings → Database**: copy the connection string (use “Transaction” pooler for Prisma).

3. **Environment**

   ```bash
   cp .env.example .env
   ```

   Fill in:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL` (Supabase Postgres connection string)

4. **Database**

   ```bash
   npx prisma generate
   npm run db:push
   npm run db:seed
   ```

   If `db:push` fails with "Can't reach database server" (e.g. port 5432 blocked or Supabase paused):

   - **Unpause:** Supabase Dashboard → your project → Restore if paused.
   - **Use SQL Editor:** Run `npm run db:sql` to generate `prisma/schema.sql`, then in Supabase go to **SQL Editor**, paste the contents of `prisma/schema.sql`, and run it. After that, run `npm run db:seed`.

5. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm run start` — production
- `npm run db:generate` — Prisma client
- `npm run db:push` — push schema (no migrations)
- `npm run db:migrate` — run migrations
- `npm run db:seed` — seed leagues, teams, season, sample matches

## Resolving matches (cron)

POST `/api/cron/resolve-matches` with header `Authorization: Bearer <CRON_SECRET>` to resolve matches that have a result set and update points, season stats, and team ELO. Set `CRON_SECRET` in production (e.g. Vercel cron).

## Matchday

Matchday = **UTC calendar day**. Users have 100 confidence points per UTC day; 5–50 per prediction.
