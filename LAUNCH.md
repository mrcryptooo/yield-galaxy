# Yield Galaxy — Launch Readiness Report

## 1. Production Deployment Checklist

### Supabase Setup
- [ ] Create production Supabase project
- [ ] Run `supabase/migrations/001_initial_schema.sql` in SQL editor
- [ ] Verify 3 tables created: `sources` (5 rows seeded), `opportunities` (0), `snapshots` (0)
- [ ] Verify RLS is enabled on all 3 tables
- [ ] Verify SELECT policies exist for anon role
- [ ] Copy Supabase URL, anon key, and service role key

### Vercel Setup
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CRON_SECRET` (generate with `openssl rand -hex 32`)
  - `NEXT_PUBLIC_SITE_URL` (e.g., `https://yieldgalaxy.app`)
- [ ] Deploy
- [ ] Verify build succeeds (8 routes expected)

### Domain Setup
- [ ] Configure custom domain in Vercel (if applicable)
- [ ] Verify SSL certificate is issued
- [ ] Update `NEXT_PUBLIC_SITE_URL` to match domain

### Cron Verification
- [ ] Verify `vercel.json` cron schedule: `*/5 * * * *`
- [ ] After first deployment, wait 5 minutes
- [ ] Check Vercel Cron logs — should show successful invocation
- [ ] Check Supabase `opportunities` table — should have ~16 rows
- [ ] Check Supabase `snapshots` table — should have ~16 rows
- [ ] Wait 10 more minutes — snapshots should grow to ~32 rows
- [ ] Verify `updated_at` timestamps are current

### Manual Cron Test
```bash
curl -X POST https://your-domain.com/api/cron/ingest \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
Expected: `{"data":{"pools_fetched":16,"opportunities_upserted":16,"snapshots_inserted":16,...}}`

### API Verification
- [ ] `GET /api/yields` — returns 16 scored opportunities
- [ ] `GET /api/yields?type=moon` — returns 3 PT opportunities
- [ ] `GET /api/yields?q=SLX` — returns 2 SLX opportunities
- [ ] `GET /api/yields?sort=total_apy&order=desc` — sorted by APY
- [ ] `GET /api/yields?type=invalid` — returns 400 error
- [ ] `GET /api/og?symbol=USX&apy=1.31%&score=74&risk=A` — returns PNG image
- [ ] `GET /robots.txt` — returns robots directives
- [ ] `GET /sitemap.xml` — returns valid sitemap

### Frontend Verification
- [ ] Homepage loads in <5 seconds
- [ ] Galaxy view renders (3D canvas visible)
- [ ] List view renders (table with 16 rows)
- [ ] Galaxy ↔ List toggle works
- [ ] Click opportunity → detail drawer opens
- [ ] APY chart loads in detail drawer
- [ ] Observatory Lite shows 5+ insights
- [ ] Share buttons visible (Share on 𝕏, Copy Link, image)
- [ ] Filters work (type, strategy, risk)
- [ ] Search works
- [ ] Sorting works (Score, APY, TVL, Risk columns)
- [ ] Mobile: layout responsive at 375px
- [ ] No console errors

### Error Monitoring
- [ ] Vercel Analytics enabled (Vercel dashboard → Analytics)
- [ ] Check Vercel Functions logs for any 500 errors
- [ ] Monitor cron execution in Vercel Cron dashboard

---

## 2. What Ships

### Core Features
| Feature | Status |
|---------|--------|
| 3D Galaxy Map with 16 Solstice opportunities | ✅ |
| List view with sortable table | ✅ |
| Galaxy ↔ List view toggle | ✅ |
| Opportunity scoring (0-100) | ✅ |
| Risk grading (A-F) | ✅ |
| Detail drawer with APY chart | ✅ |
| Search by symbol/asset | ✅ |
| Filters (type, strategy, risk) | ✅ |
| Observatory Lite (5 insights) | ✅ |
| Captain Whiskers Lite (rule-based) | ✅ |
| Share on 𝕏 | ✅ |
| Copy link | ✅ |
| OG image generation | ✅ |
| Data pipeline (5-min refresh) | ✅ |
| WebGL fallback (list view) | ✅ |
| SEO (robots, sitemap, meta) | ✅ |
| Mobile responsive | ✅ |

### Data Pipeline
| Step | Frequency | Source |
|------|-----------|--------|
| DefiLlama fetch | 5 min (Vercel Cron) | yields.llama.fi/pools |
| Scoring | Per fetch | Internal computation |
| Snapshot storage | Per fetch | Supabase append-only |
| Live fallback | On demand | DefiLlama direct (60s cache) |

### Observatory Lite Insights
| Insight | Rule |
|---------|------|
| 🐱 Top Opportunity | Highest composite score |
| 🛡️ Safest Yield | Highest APY among grade A/B opportunities |
| 🔥 Highest Fuel Yield | Highest raw APY (with liquidity warning if TVL <$50K) |
| ◎ Fixed Rate Available | PT opportunity with highest TVL |
| 📉 Yield Compression | Count of $1M+ TVL pools yielding <0.5% |
| ✦ Galaxy Status | Summary: count, planets, moons, avg APY, total TVL |

---

## 3. Technical Summary

| Metric | Value |
|--------|-------|
| Source files | 34 |
| Total lines | ~2,600 |
| API routes | 4 (yields, history, cron, OG) |
| Static routes | 3 (home, robots, sitemap) |
| Database tables | 3 |
| TypeScript | Strict, 0 errors |
| Production build | Clean |
| Console errors | 0 |
| Monthly cost (pre-scale) | ~$60 (Vercel Pro + Supabase Pro) |

---

## 4. Post-Launch Monitoring

### First 24 Hours
- Check Vercel Cron dashboard every 4 hours — verify no failures
- Check Supabase `snapshots` table — row count should grow by ~4,608/day (16 × 288)
- Monitor Vercel Functions tab for error rates
- Read all user feedback — what do they actually say?

### First Week
- Verify snapshot accumulation (should reach ~32K rows)
- Check if any opportunities went inactive (DefiLlama stopped returning them)
- Review scoring results — do the rankings match user intuition?
- Note what users ask for that doesn't exist yet

### Known Limitations
- Live fallback is slow (7-15s) — production with Supabase will be <200ms
- PT markets show 0% APY (PT returns come from discount-to-par, not streaming yield)
- No stSLX data on DefiLlama currently
- Exponent not on DefiLlama — no YT data
- Galaxy Map click interaction requires real pointer events (not programmatic)
- WebGL screenshot captures may appear dark in some tools
