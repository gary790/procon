# Pro Con LLC — Website Blueprint (Stage 1)

> Built to **Simple Build AI Master Bible v3.1**. This document is the Phase 1–4 deliverable
> (positioning, architecture, brand system, anti-generic mandates). It is the approval gate
> before any code is written. Package: **3 (Flagship, dual hub-and-spoke)**. Stack: **HTML +
> Tailwind, static**. Deploy: **Cloudflare Pages** → `proconmn.com`.

---

## PHASE 1 — Strategic Positioning

**Industry archetype:** Local trade — owner-led residential **general contractor** (custom home
builder + remodeler), Northern Minnesota.

**Stereotype to avoid (Phase 1.3):** construction-cliché safety-orange + hazard-black, hard-hat /
hammer / blueprint clipart, "we build dreams" filler. Pro Con builds *custom homes* — the brand
should read **premium, warm, craftsman, built-to-last**, not industrial-hazard.

**Strategic angle (one sentence):**
> This site exists to convert Northern Minnesota homeowners planning a custom home, addition, or
> major remodel — who need a builder they can trust with a long, high-stakes project — by proving
> Dan Bruckelmyer's nearly three decades of hands-on, owner-run craftsmanship.

**Positioning brief (3 sentences):**
> Pro Con is a family-run, owner-led builder in Duluth that takes on the projects most people only
> do once or twice in a lifetime — a new home, a duplex, a lake place, a full addition. What sets it
> apart isn't a sales team or a franchise playbook; it's Dan Bruckelmyer personally on the job, with
> nearly 30 years of building through Northern Minnesota winters and a workmanship guarantee behind
> every project. The site's job is to make a homeowner feel that handing Pro Con an 8–12 month build
> is the safe, obvious choice — and to get them to request a free estimate.

### Phase 1 — SEO: keyword strategy
- **Primary keyword:** `custom home builder Duluth MN`
- **Secondary (long-tail):** custom home construction Duluth MN · home remodeling Duluth MN · deck
  builder Duluth MN · home additions Duluth MN · garage builder Northern Minnesota · duplex builder
  Duluth
- **Semantic cluster:** custom homes, remodeling, additions, decks, thermally modified wood, garages,
  single-family, duplex, vacation homes, exterior, insulation above code, workmanship guarantee,
  licensed contractor (QB807406), Northern Minnesota, owner-built, lasts through winters
- **City-page keywords (one per city page):** `[primary service] in [city], MN` — e.g.
  `custom home builder Hermantown MN`, `home remodeling Cloquet MN`, `deck builder Two Harbors MN`.
- **Service × city intersection keywords (captured via cross-links, NOT separate pages):**
  custom home builder Duluth · home addition Hermantown · deck builder Two Harbors · garage builder
  Cloquet · kitchen remodel Duluth · vacation home builder North Shore — these are won by the
  bidirectional service↔city link matrix (Phase 6), not standalone pages.

### Phase 1 — AEO: canonical identity sentence (used verbatim in meta, schema, About, footer)
> **Pro Con LLC is a family-owned custom home builder and remodeling contractor in Duluth, Minnesota,
> owner-led by Dan Bruckelmyer with nearly three decades of hands-on experience building and
> renovating homes across Northern Minnesota.**

### Phase 1 — GEO: entity map
| Entity | Status |
|---|---|
| Brand — Pro Con LLC (founded 2023, License QB807406) | ✅ |
| Person — Dan Bruckelmyer (owner/builder, since 1997, two generations) | ✅ |
| Services — 10 (see Phase 2) | ✅ |
| Location — Duluth HQ + 15 service-area cities | ✅ |
| Reviews — Mark H. (verbatim) | ⚠️ only 1 captured |

**GAPS FOR AI VISIBILITY (to fix):** Google Business Profile URL unknown · no social profiles (FB/IG/LinkedIn) · only 1 review on file · no logo file (NEEDS LOGO) · no project photos collected.

### Phase 1 — Anchor + topical-geographic matrix (Package 3)
- **Anchor service:** Custom Home Construction (the highest-value, hardest-to-win job — and Dan's
  core identity). **Anchor city:** Duluth, MN. The homepage hero centers on *custom home builder in
  Duluth* and radiates outward to the service area.
- **Topical-geographic matrix** (services × cities; ✅ = strongest cells = featured/cross-linked):

  | Service ↓ / City → | Duluth | Hermantown | Cloquet | Two Harbors | Hibbing/Iron Range |
  |---|---|---|---|---|---|
  | Custom Homes | ✅ | ✅ | ✅ | ✅ (lake) | ◦ |
  | Additions / Remodel | ✅ | ✅ | ✅ | ◦ | ◦ |
  | Decks (Arbor Wood) | ✅ | ◦ | ◦ | ✅ (lake) | ◦ |
  | Garages | ✅ | ✅ | ✅ | ◦ | ✅ |
  | Vacation Homes | ◦ | ◦ | ◦ | ✅ (North Shore) | ◦ |

- **City pages — phased rollout** (Sterling Sky: prioritize by revenue/proximity, not vanity):
  **Wave 1** dedicated pages — Duluth, Hermantown, Cloquet, Two Harbors. **Wave 2** — Proctor, Esko,
  Hibbing, Grand Rapids, Virginia. **Remaining townships** (Arnold, Carlton, Rice Lake, Lakewood,
  Fredenberg, Grand Lake) appear as a plain-text "we also serve" list (no thin doorway pages).

### Phase 1 — ISO: security posture
No compliance flags → default: HTTPS enforced, full 2026 security-header stack, honeypot on forms,
no inline event handlers (CSP-friendly).

---

## PHASE 2 — Site Architecture (Package 3 dual hub-and-spoke)

**Hub 1 = Services. Hub 2 = Service Areas.** Both feed the homepage; every page ≤ 2 clicks from home.

```
/                                   Home
/services                           Services HUB (overview + cluster intros)
  ── New Construction cluster
     /services/custom-home-construction      (single-family new builds, 8–12 mo)
     /services/duplex-construction           (multi-family / duplex, 10–14 mo)
     /services/vacation-homes                (seasonal / lake homes, 8–12 mo)
     /services/garages-outbuildings          (detached garages, 4–8 wks; 24×24 standard)
  ── Remodeling & Additions cluster
     /services/kitchen-remodeling
     /services/bathroom-remodeling
     /services/home-additions                (bedroom/bath/sauna, etc.)
  ── Exteriors cluster
     /services/deck-construction             (Arbor Wood thermally modified wood, 1–3 wks)
     /services/exterior-upgrades             (siding, exterior renovation)
     /services/window-door-installation
/areas                              Service Area HUB
     /areas/duluth                           (priority cities first; remaining added in Stage 5)
     /areas/hermantown
     /areas/cloquet
     /areas/two-harbors
     /areas/hibbing /grand-rapids /virginia /proctor /esko ... (15 total)
/about                              Owner story, credentials, areas-served, reviews (E-E-A-T page)
/gallery                            Project photos (built once real photos are supplied)
/contact                            Form + map + hours + service area
/privacy                           Privacy policy
404.html / 500.html                Useful error pages
```
Utility files (Phase 8/9): `robots.txt`, `sitemap.xml`, `sitemap-images.xml`, `llms.txt`,
`llms-full.txt`, `manifest.json`, `.well-known/ai-plugin.json` (quote action), favicon stack,
`og-image.jpg`.

**Build order (staged):** Stage 2 = Home + global header/footer. Stage 3 = Services hub + 10 spokes.
Stage 4 = About / Gallery / Contact. Stage 5 = Areas hub + city spokes. Stage 6 = QA + deploy.
Thin/overlapping spokes may be merged to satisfy the Bible's no-thin-page rule.

---

## PHASE 3 — Brand & Visual System (design tokens)

**Typography (justified pick):** Heading **Fraunces** (variable soft-serif) + Body **Inter**.
*Why:* Fraunces reads as hand-built craft and permanence — matches "homes that last through
winters" and separates Pro Con from the interchangeable Oswald/Bebas contractor sites, while Inter
keeps body copy clean and legible. Max 2 families · `font-display: swap` · preload Fraunces woff2.

**Color tokens** (derived from vibe *Trustworthy / Experienced / Local*; warm wood accent nods to
the Arbor Wood decking; all pairings will be contrast-verified to WCAG 2.2 AA before shipping):

| Role | Hex | Use |
|---|---|---|
| Primary (ink/slate) | `#1F2A33` | text, dark sections, header |
| Secondary (steel) | `#3E5160` | supporting headings, borders |
| **Accent / CTA** | `#A85F1A` | **primary CTAs + 1–2 highlights only** (white text ≈ 4.6:1) |
| Accent hover | `#C77D33` | CTA hover, small highlights |
| Neutral 50 | `#FAF8F5` | warm page background |
| Neutral 100 | `#F3EFE9` | cards / alt sections |
| Neutral 200 | `#E5DED4` | dividers |
| Neutral 400 | `#B9AE9E` | muted text |
| Neutral 600 | `#6F665A` | secondary body |
| Neutral 800 | `#3A352E` | strong body on light |
| Neutral 950 | `#1C1A16` | deepest |
| success / warning / danger / info | `#2E7D54` / `#C2701C` / `#B3261E` / `#2D5A88` | form states only |

**Spacing:** 8-pt grid (4/8/12/16/24/32/48/64/96/128). **Radius:** soft, `8px` (`rounded-lg`),
consistent. **Shadow:** two subtle elevation levels, no glow, no text shadow.

**Signature element (Phase 4 requirement):** a **timber-frame corner bracket** — thin L-shaped corner
rules echoing the house-outline logo — used as the section-divider / stat-frame motif on every page,
plus an oversized `01 / 02 / 03` numbered-list style for process sections.

**Imagery rules:** Logo = NEEDS LOGO → clean **"PRO CON" wordmark** in Fraunces with a minimal
house-outline mark (consistent with current site). No photos yet → warm `neutral-100` blocks with
type-driven hierarchy; **no** stock, gradient blobs, or placeholder images. Swap in real project
photos (AVIF/WebP, descriptive filenames) as the Gallery is collected.

**Five hero patterns (Package 3 — defined up front, same tokens, different rhythm per archetype):**
1. **Home** — most expressive; editorial split (anchor copy left, project photo right), oversized H1,
   3 trust pills, primary + secondary CTA. Type-driven fallback until photos exist.
2. **Service sub-page** — one consistent pattern across all 10: compact split, breadcrumb, service-
   specific H1 + subhead + 3 service trust pills.
3. **City sub-page** — distinct from service hero: breadcrumb, `[service] in [City], MN` H1, a city-
   specific subhead fact, tap-to-call, city-specific trust pills (jobs in city / years / response time).
4. **Hub** (Services hub, Areas hub) — smaller, navigational; region/lineup framing H1 + 1–2 line sub.
5. **Article** (Resources, if built) — long-form reading; narrow 720px column, byline, larger body.

---

## PHASE 4 — Anti-Generic Mandates (hard rules for this build)

**Forbidden:** orange/black hazard palette · hard-hat / hammer / blueprint / handshake clipart ·
AI gradient blobs · emoji or Font Awesome icons · smiling-team stock photo · three identical feature
cards · "Welcome to…" / "Your trusted…" / "passionate about" · hero carousel · any lorem/placeholder.

**Required moves:** editorial split hero (text-left + project photo right; type-driven until photos
arrive) · one oversized display-type section (`clamp(3rem,8vw,7rem)`) · real numbers only
(27 yrs, License QB807406, 8–12 mo build timelines, 1–3 wk decks) · single restrained accent ·
consistent vertical rhythm (`py-24 md:py-32`) · the timber-frame corner signature on every page ·
Lucide icons used sparingly · ≥ 1 provable/extractable claim per section · first-person expertise
line per page ("In nearly 30 years building across Northern Minnesota…").

**City-page anti-doorway rules (Package 3 — Google Dec 2025 helpful-content + AEO "swap-the-city" test).**
Every city page must *earn its existence* with ≥ 500 words of city-unique content and ≥ 2 facts only
true for that city.
- **Forbidden openers:** "Looking for [service] in [city]?" · "We're the trusted builder in [city]." ·
  "[City] residents trust us…" · anything that still reads correctly if you swap the city name.
- **Required opener:** a specific local hook — a real local condition + our response. *e.g.* "Two
  Harbors lake-lots sit on exposed bedrock and take North Shore wind off Superior — we frame and
  insulate for that, not for a sheltered city lot." Each city page: own local hook, own FAQ (city in
  the question), own map centered on the city, city-tagged reviews only (or omit — never re-label).
- **Self-check before delivery:** compare any 3 same-archetype pages; if opening rhythm/structure
  matches, rewrite. Same applies to the 10 service sub-pages ("swap-the-noun" test).

---

## Phase 6 — Internal-link matrix (the GEO/SEO core of Package 3)
Built before code as a deliverable: Home → both hubs + top 3 services + top 3 cities + About + Contact;
Services hub ↔ every service spoke; Areas hub ↔ every city spoke; **each service spoke ↔ the cities
where it's most requested**, and **each city spoke ↔ its most-relevant services** (bidirectional =
the service×city matrix); adjacent-city links between neighboring city pages; footer → all parents +
top services + top cities. Every sub-page gets ≥ 3 inbound links; zero orphans (≤ 2 clicks from home).

## Package 3 deliverables produced at the end (Phase 10 final output)
Positioning brief + matrix + anchor · full sitemap (all routes by hub) · internal-link matrix ·
design tokens + 5 hero patterns · keyword strategy (per-service, per-city, intersection) · full code ·
gap report (services missing photos, cities missing reviews/local data) · **AI Visibility Gap Report** ·
security-headers notes (incl. Google Maps CSP for city pages) · **Discipline Score Report**
(SEO/AEO/GEO/AXO/AIO/UX-UI/CRO/ISO each /100, weakest named) · deployment + "how to add a service/city later".

## Still needed from the client (collected as we go)
1. **Confirm the 10-service list** above (recovered from proconmn.com — intake A4 was corrupted).
2. **Logo file** (or approve a generated Fraunces wordmark).
3. **Project photos** for hero + Gallery + service pages (none on file yet).
4. **Google Business Profile URL** + review count/rating (big AEO/GEO win).
5. **Form recipient email** (default: danb.procon@gmail.com) and any social profile URLs.
