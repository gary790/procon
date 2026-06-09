# Pro Con LLC — Website

Marketing website for **Pro Con LLC** — a family-owned custom home builder and remodeling
contractor in Duluth, Minnesota, owner-led by Dan Bruckelmyer.

- **Live domain:** [proconmn.com](https://www.proconmn.com)
- **Stack:** Static HTML + Tailwind (Play CDN), vanilla JS, comprehensive JSON-LD schema
- **Deploy target:** Cloudflare Pages → `proconmn.com`
- **Build standard:** Simple Build AI Master Bible v3.1 — **Package 3 (flagship, dual hub-and-spoke)**

## Architecture (Package 3 — dual hub-and-spoke)

```
/                     Home (anchor: custom home builder in Duluth)
/services             Services hub  → 10 service spokes (/services/<slug>)
/areas                Service-area hub → city spokes (/areas/<city>-mn)
/about  /gallery  /contact  /privacy
robots.txt · sitemap.xml · llms.txt · llms-full.txt · .well-known/ai-plugin.json
```

Enforces 8 disciplines on every page: **SEO · AEO · GEO · AXO · AIO · UX/UI · CRO · ISO**.

## Repo layout

| Path | Purpose |
|---|---|
| `docs/BLUEPRINT.md` | Stage 1 blueprint — Phases 1–4 (positioning, architecture, tokens, anti-generic) |
| `docs/pdf-inventory.txt` | Page-by-page inventory of the source build bible (151 pp.) |
| `assets/css` · `assets/js` · `assets/img` | Site assets |
| `index.html`, `services/`, `areas/` … | Pages (built in stages) |

## Build stages

1. **Blueprint** — Phases 1–4 ✅ (`docs/BLUEPRINT.md`)
2. **Homepage + global shell** — header, footer, tokens, schema, robots/llms/sitemap
3. **Services hub + 10 service sub-pages**
4. **About · Gallery · Contact**
5. **Areas hub + city sub-pages**
6. **Technical hardening + QA + deploy**

## Local preview

Static site — open `index.html` directly, or serve the folder:

```powershell
# any static server works, e.g. with Python or `npx serve .`
npx serve .
```
