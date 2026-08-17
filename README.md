# 🏠 Agent Performance Tracker

A React + Supabase app for real estate agents to capture and track Rentals
and Sales performance, with per-category leaderboards.

## Structure

- 🏠 **Dashboard** — today's Rentals vs Sales summary, links into each tab
- 🔑 **Rentals** — capture stats, "My Rental Performance" (daily/weekly/monthly/yearly),
  Stats Showcase (period dropdown), Rental Leaderboard (period dropdown)
- 🏡 **Sales** — same structure as Rentals
- 🏆 **Leaderboard** — combined Rentals + Sales leaderboard view
- 👤 **Profile**
- 🔐 **Admin** — Users | Stats (Rentals/Sales) | Settings

Both Rentals and Sales run off the same engine: everything is driven by the
`stat_definitions` table in Supabase, so **the Sales stats you send over
don't require any code changes** — just add/edit rows in that table (see
`supabase/schema.sql`, section 8), or manage them from **Admin → Stats** in
the app once signed in as an admin.

The ⭐/"on leaderboard" distinction from the spec is implemented as the
`on_leaderboard` boolean on each stat: leaderboard-eligible stats feed the
leaderboard and points system; everything else still shows in the
"Operational Stats" section of the performance table but is excluded from
rankings — and is never labelled "not on leaderboard" in the UI.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → paste in the contents of `supabase/schema.sql` → Run.
   This creates all tables, RLS policies, the leaderboard/totals functions,
   and seeds the Rentals stats exactly as specced (plus a placeholder Sales
   set you can edit).
3. Go to **Authentication → Providers** and make sure **Email** is enabled.
   (Optionally turn off "Confirm email" while testing.)
4. Go to **Project Settings → API** and copy your **Project URL** and
   **anon public key**.

### Making your first admin user

After you sign up in the app once, promote yourself to admin by running this
in the SQL Editor (replace the email):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

## 2. Run locally

```bash
cp .env.example .env
# then edit .env with your Supabase URL + anon key

npm install
npm run dev
```

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: agent performance tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 4. Deploy

The included `.github/workflows/deploy.yml` builds and deploys to **GitHub
Pages** automatically on every push to `main`.

1. In your GitHub repo: **Settings → Pages → Source → GitHub Actions**.
2. In your GitHub repo: **Settings → Secrets and variables → Actions**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push to `main` — the site will build and deploy automatically.

(You can just as easily deploy to Vercel/Netlify instead — connect the repo
and set the same two environment variables there.)

## Notes on extending

- **Add a new stat**: insert a row into `stat_definitions` (via SQL or
  Admin → Stats' underlying table) with a `category`, `section`, `label`,
  `on_leaderboard`, and `points`. It will immediately appear in the Capture
  form, performance table, and Stats Showcase — no code changes needed.
- **Change leaderboard weighting**: edit the `points` value per stat (e.g.
  make "Leases Concluded" worth more than a "Pamphlet Drop") from
  Admin → Stats.
- **Rental/Sales History**: the `stat_entries` table already stores one row
  per agent/stat/day, so a full history view is a straightforward addition
  (query `stat_entries` for an agent over a custom date range).
