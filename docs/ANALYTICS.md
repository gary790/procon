# ProCon — Website analytics & event tracking

The site tracks visitors and conversions **first-party**: no Google tag, no cookies,
no consent banner needed. Events are written by the Cloudflare Worker to a
**Workers Analytics Engine** dataset and read back with its SQL API.

| Piece | Where |
|---|---|
| Client tracker | `public/assets/js/main.js` → `track()` — POSTs to `/api/event` via `sendBeacon` |
| Ingest endpoint | `worker/index.js` → `handleEvent()` (`POST /api/event`) |
| Server-side lead event | `worker/index.js` → `handleContact()` writes `lead` after a successful send |
| Dataset binding | `wrangler.jsonc` → `analytics_engine_datasets` → binding `EVENTS`, dataset `procon_events` |

Honours `Do Not Track`. Nothing personal is stored — see the column map below.

## Events

| Event | Fired when |
|---|---|
| `pageview` | every page load |
| `phone_click` | tap on any `tel:` link (label = number) |
| `email_click` | click on the email address |
| `estimate_cta_click` | click on any "Request an Estimate" button/link (label = button text) |
| `form_submit` | contact form accepted (client-side) |
| `lead` | contact form accepted **server-side** — the authoritative lead count |

## Column map (Analytics Engine)

| Column | Meaning |
|---|---|
| `index1` | event name (also `blob1`) |
| `blob2` | page path |
| `blob3` | referrer hostname (`google.com`, empty = direct) |
| `blob4` | `utm_source` if present |
| `blob5` | device class: `mobile` / `tablet` / `desktop` |
| `blob6` | visitor country (from Cloudflare) |
| `blob7` | label (phone number, button text, project type) |
| `double1` | always 1 (sum it for counts) |
| `_sample_interval` | multiply counts by this — AE samples under heavy load |

## Querying (for the monthly health report)

You need a Cloudflare API token with **Account → Account Analytics → Read** and the
account ID (Workers & Pages → overview, right-hand column). Keep both in the health-check
runner's secrets as `CF_API_TOKEN` and `CF_ACCOUNT_ID`.

```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/analytics_engine/sql" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  --data "
SELECT index1 AS event,
       SUM(_sample_interval * double1) AS count
FROM procon_events
WHERE timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY event
ORDER BY count DESC
FORMAT JSON"
```

Useful variants:

```sql
-- Page views by page, last 30 days
SELECT blob2 AS page, SUM(_sample_interval * double1) AS views
FROM procon_events
WHERE index1 = 'pageview' AND timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY page ORDER BY views DESC LIMIT 25

-- Where visitors come from
SELECT blob3 AS referrer, SUM(_sample_interval * double1) AS views
FROM procon_events
WHERE index1 = 'pageview' AND timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY referrer ORDER BY views DESC LIMIT 15

-- Mobile vs desktop
SELECT blob5 AS device, SUM(_sample_interval * double1) AS views
FROM procon_events
WHERE index1 = 'pageview' AND timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY device

-- Leads by project type
SELECT blob7 AS project, SUM(_sample_interval * double1) AS leads
FROM procon_events
WHERE index1 = 'lead' AND timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY project ORDER BY leads DESC
```

The same queries can be run in the dashboard: **Workers & Pages → procon → Analytics Engine**.

## Optional: Cloudflare Web Analytics (Core Web Vitals RUM)

The CSP already allows `static.cloudflareinsights.com`. To add field Core Web Vitals,
enable Web Analytics for `proconmn.com` in the Cloudflare dashboard (Analytics & Logs →
Web Analytics → Add a site) and paste the beacon snippet it gives you before `</body>`
on every page (the health-check can fetch its numbers from the same dashboard).
