# Yield Galaxy — Production Deployment Guide

## Step 1: Supabase

1. Go to [supabase.com](https://supabase.com) → your project
2. Open **SQL Editor** → New Query
3. Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. Verify: go to **Table Editor** → you should see 3 tables:
   - `sources` — 5 rows (kamino-lend, kamino-liquidity, raydium-amm, orca-dex, loopscale)
   - `opportunities` — 0 rows
   - `snapshots` — 0 rows
6. Go to **Settings → API** and copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key

## Step 2: Vercel

### Option A: Deploy via CLI

```bash
cd yield-galaxy
npx vercel login
npx vercel --prod
```

When prompted, set environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
CRON_SECRET=<run: openssl rand -hex 32>
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Option B: Deploy via GitHub

1. Create a GitHub repo
2. Push:
   ```bash
   cd yield-galaxy
   git remote add origin https://github.com/YOUR_USER/yield-galaxy.git
   git push -u origin master
   ```
3. Go to [vercel.com](https://vercel.com) → Import Project → select the repo
4. Add environment variables (same as above)
5. Deploy

## Step 3: Verify Cron Secret

After deployment, Vercel will automatically call `/api/cron/ingest` every 5 minutes
using the schedule in `vercel.json`. The cron uses `Authorization: Bearer CRON_SECRET`.

Vercel automatically injects the `CRON_SECRET` env var as the Bearer token for
cron invocations.

## Step 4: Manual First Ingestion

After Vercel deployment completes, trigger the first ingestion manually:

```bash
curl -X POST https://YOUR_DOMAIN/api/cron/ingest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "data": {
    "pools_fetched": 16,
    "opportunities_upserted": 16,
    "snapshots_inserted": 16,
    "duration_ms": 3000
  }
}
```

## Step 5: Verify Production

1. Visit `https://YOUR_DOMAIN` — Galaxy map should load with data
2. Visit `https://YOUR_DOMAIN/api/yields` — should return 16 opportunities
3. Visit `https://YOUR_DOMAIN/robots.txt` — should show robots directives
4. Visit `https://YOUR_DOMAIN/sitemap.xml` — should show sitemap
5. Visit `https://YOUR_DOMAIN/api/og?symbol=USX&apy=1.31%25&score=74&risk=A` — should return PNG

## Step 6: Verify Cron

1. Go to Vercel Dashboard → your project → **Cron Jobs** tab
2. Wait 5 minutes for the first automatic invocation
3. Check the execution log — should show 200 status
4. Check Supabase `snapshots` table — should have 16+ rows
5. Wait another 5 minutes — snapshots should double to 32+

## Step 7: Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` env var to match
5. Redeploy for OG images and sitemap to use the new domain
