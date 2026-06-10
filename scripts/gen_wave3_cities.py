#!/usr/bin/env python3
"""Generate Wave-3 city pages from the shared shell (header/footer from two-harbors)."""
import json

HEADER = open('/tmp/city_header.html').read()
FOOTER = open('/tmp/city_footer.html').read()

CITIES = [
  {
    "slug": "superior-wi",
    "name": "Superior", "state": "WI", "region": "US-WI",
    "lat": 46.7208, "lon": -92.1041,
    "title": "Custom Homes & Remodeling in Superior, WI | ProCon LLC",
    "desc": "Custom home construction, additions, and remodeling in Superior, WI — minutes across the bridge from our Duluth base. Owner-led by Dan Bruckelmyer. Free estimate in 24 hours.",
    "og_desc": "Custom homes, additions, and remodeling in Superior, WI — minutes across the bridge from Duluth. Free estimate in 24 hours.",
    "tw_desc": "Custom homes, additions, and remodeling in Superior, WI — right across the bridge from our Duluth base.",
    "biz_desc": "ProCon LLC provides custom home construction, home additions, and remodeling in Superior, Wisconsin — minutes across the bridge from its Duluth, MN base, building for harbor-side clay soils and flat, wind-exposed lots.",
    "eyebrow": "Superior, WI",
    "h1": "Across the bridge,<br>same standard of work.",
    "lead": "Custom homes, additions, and remodeling in Superior — Billings Park, the East End, Allouez, and out toward the village. We're minutes away over the Bong Bridge, and we build for Superior's flat, clay-soil lots the same way we build everything: properly.",
    "hero_img": "modern-duplex-duluth-mn.jpg",
    "hero_alt": "Modern two-unit home of the kind ProCon builds in Superior, WI",
    "hero_w": 1200, "hero_h": 896,
    "hook_eyebrow": "Building in Superior",
    "hook_h2": "Flat ground,<br>heavy clay, big wind.",
    "hook_p1": "Superior sits at the head of the lake on the Wisconsin side, right across the harbor from Duluth — ten minutes over the Bong or Blatnik Bridge from our base. The ground is the opposite of Duluth's: flat, low, and heavy with red clay. That clay holds water, so drainage, grading, and how a foundation sheds moisture decide whether a build stays dry — it's not a place to copy a hillside detail and hope.",
    "hook_p2": "The wind is the other half. With the open harbor and the flats, Superior lots can take wind that Duluth's hillside neighborhoods never see. We detail the envelope and roof for that exposure, and we know the housing stock — Billings Park bungalows, East End four-squares, postwar ramblers out toward Allouez — well enough to make an addition or remodel look like it was always there.",
    "map_h2": "Ten minutes over the bridge.",
    "map_q": "Superior,+WI",
    "map_title": "Map of ProCon's service area centered on Superior, WI",
    "insight_h2": "One thing the clay<br>teaches you here.",
    "insight_p1": "Red clay doesn't drain — it holds. A footing or slab detailed for Duluth's rocky, fast-draining hillside will sit wet in Superior, and wet clay moves when it freezes. So the front end of a Superior build is about water: where the lot sends it, how the grading moves it away from the house, and how the foundation is drained and damp-proofed so frost has nothing to grab.",
    "insight_p2": "We plan that before anything is poured, not after the first spring thaw shows up in the basement. It's the kind of local knowledge you only get from building on both sides of the harbor.",
    "faqs": [
      ("Do you work in Wisconsin?",
       "Yes. Superior is part of our regular service area — we're about ten minutes away across the Bong or Blatnik Bridge from our Duluth base, and we build and remodel on the Wisconsin side of the harbor regularly."),
      ("How is building in Superior different from Duluth?",
       "Mostly the ground and the wind. Superior is flat with heavy red clay soil that holds water, so drainage and foundation detailing matter more than on Duluth's fast-draining hillside. The open flats also take more direct wind, which drives envelope and roofing decisions."),
      ("Can you remodel older Superior homes?",
       "Yes. Billings Park, the East End, and the older core of Superior are full of early-1900s homes with good bones. We remodel and add onto them while matching the original character and bringing insulation and systems up to today's standards."),
      ("What parts of Superior do you serve?",
       "All of it — Billings Park, the East End, Allouez, South Superior, and out to Superior Village and Parkland. If you're anywhere on the Wisconsin side of the harbor, you're within our normal working range."),
    ],
    "nearby": [("/areas/duluth-mn", "Duluth"), ("/areas/proctor-mn", "Proctor")],
    "cta_h2": "Building in Superior?",
    "cta_p": "Tell Dan about your project. Free estimates, response within 24 hours.",
  },
  {
    "slug": "carlton-mn",
    "name": "Carlton", "state": "MN", "region": "US-MN",
    "lat": 46.6636, "lon": -92.4250,
    "title": "Custom Homes & Remodeling in Carlton, MN | ProCon LLC",
    "desc": "Custom home construction, additions, and remodeling in Carlton, MN — the county seat at the edge of Jay Cooke State Park. Owner-led by Dan Bruckelmyer. Free estimate in 24 hours.",
    "og_desc": "Custom homes, additions, and remodeling in Carlton, MN — small-town lots at the edge of Jay Cooke State Park. Free estimate in 24 hours.",
    "tw_desc": "Custom homes, additions, and remodeling in Carlton, MN — at the edge of Jay Cooke State Park.",
    "biz_desc": "ProCon LLC provides custom home construction, home additions, and remodeling in Carlton, Minnesota — the Carlton County seat at the edge of Jay Cooke State Park, where the St. Louis River cuts through bedrock.",
    "eyebrow": "Carlton, MN",
    "h1": "The county seat,<br>built on the river's rock.",
    "lead": "Custom homes, additions, and remodeling in Carlton — a small county seat twenty-five minutes southwest of Duluth, where the St. Louis River cuts through tilted slate at Jay Cooke and the lots back up to some of the prettiest country in the region.",
    "hero_img": "craftsman-hands-timber-framing.jpg",
    "hero_alt": "A carpenter's hands fitting a timber joint on a ProCon job site near Carlton, MN",
    "hero_w": 1200, "hero_h": 896,
    "hook_eyebrow": "Building in Carlton",
    "hook_h2": "Small town,<br>serious geology.",
    "hook_p1": "Carlton is the seat of Carlton County — a town of a few hundred households sitting right at the gateway to Jay Cooke State Park, where the St. Louis River tears through tilted slate bedrock on its way to the lake. That geology doesn't stay in the park. Lots around Carlton and Thomson can run from deep glacial soils to shallow rock within a block, so the dig you plan isn't always the dig you get.",
    "hook_p2": "We've built around that for years. Test the soils, walk the lot, and design the foundation for what's actually under it — then build a house insulated past Minnesota code minimums, because winter out here is the same winter as everywhere else we work. Small-town lots, river-country views, and a build done right the first time.",
    "map_h2": "Twenty-five minutes southwest of Duluth.",
    "map_q": "Carlton,+MN",
    "map_title": "Map of ProCon's service area centered on Carlton, MN",
    "insight_h2": "One thing the river<br>teaches you here.",
    "insight_p1": "Around Carlton the bedrock that makes Jay Cooke spectacular sits closer to the surface than you'd guess, and it tilts. One lot digs like a sandbox; the neighbor's hits slate at four feet. If a builder prices a foundation without knowing which one you have, the surprise comes out of your budget mid-dig.",
    "insight_p2": "So we settle it up front — soils, depth to rock, and where the water table sits — and design the foundation to the lot instead of forcing a standard plan onto ground that won't take it. That's the difference between a quoted price and a real one.",
    "faqs": [
      ("Do you build in Carlton and Thomson?",
       "Yes. Carlton, Thomson, and the surrounding townships are all in our regular service area — about twenty-five minutes southwest of our Duluth base, just past Esko on Highway 61 and I-35."),
      ("What should I know about building near Jay Cooke?",
       "The bedrock that makes the park dramatic runs under a lot of nearby lots, and depth to rock can change fast. We test soils and design the foundation for what's actually under your lot, so the price you're quoted is the price you pay."),
      ("Can you remodel older homes in Carlton?",
       "Yes. Carlton's housing stock runs from early rail-era homes to postwar builds, and we remodel and add onto all of it — matching the original character while bringing insulation, windows, and systems up to date."),
      ("How fast can you get to a Carlton project?",
       "We're twenty-five minutes away, and we already work Cloquet and Esko next door regularly. Estimates are free and in writing, with a response within 24 hours."),
    ],
    "nearby": [("/areas/cloquet-mn", "Cloquet"), ("/areas/esko-mn", "Esko")],
    "cta_h2": "Building in Carlton?",
    "cta_p": "Tell Dan about your lot. Free estimates, response within 24 hours.",
  },
  {
    "slug": "moose-lake-mn",
    "name": "Moose Lake", "state": "MN", "region": "US-MN",
    "lat": 46.4542, "lon": -92.7619,
    "title": "Custom Homes, Cabins & Remodeling in Moose Lake, MN | ProCon LLC",
    "desc": "Custom home construction, cabins, and remodeling in Moose Lake, MN — lake-country builds 45 minutes down I-35 from Duluth. Owner-led by Dan Bruckelmyer. Free estimate in 24 hours.",
    "og_desc": "Custom homes, cabins, and remodeling in Moose Lake, MN — lake-country builds done right, 45 minutes down I-35. Free estimate in 24 hours.",
    "tw_desc": "Custom homes, cabins, and remodeling in Moose Lake, MN — lake-country builds done right.",
    "biz_desc": "ProCon LLC provides custom home construction, cabin builds, and remodeling in Moose Lake, Minnesota — lake-country building forty-five minutes down I-35 from its Duluth base, including converting seasonal cabins to year-round homes.",
    "eyebrow": "Moose Lake, MN",
    "h1": "Lake country,<br>down the interstate.",
    "lead": "Custom homes, cabins, and remodeling in Moose Lake and the lake country around it — Moosehead, Island Lake, Sturgeon, and the small waters in between. Forty-five minutes down I-35 from our Duluth base, and worth every mile.",
    "hero_img": "luxury-living-room-lake-superior-view.jpg",
    "hero_alt": "Living room with floor-to-ceiling lake-view windows — the kind of lake-country build ProCon does around Moose Lake, MN",
    "hero_w": 1920, "hero_h": 1071,
    "hook_eyebrow": "Building in Moose Lake",
    "hook_h2": "Cabin country<br>growing up.",
    "hook_p1": "Moose Lake sits where I-35 meets the lake country of southern Carlton County — the agate capital, a state park on Moosehead Lake, and shorelines dotted with cabins that families have held for generations. More and more of those cabins are becoming year-round homes, and that conversion is real construction: insulation, foundations, heating systems, and water lines all built for a lakeshore winter instead of a summer weekend.",
    "hook_p2": "That's our kind of work. We convert seasonal places to four-season homes, build new lake homes and cabins from the footings up, and handle the additions and remodels that come when a place gets used more than it was built for. Shoreland rules, septic siting, and lake-lot drainage are part of the job here — and we know them.",
    "map_h2": "Forty-five minutes down I-35.",
    "map_q": "Moose+Lake,+MN",
    "map_title": "Map of ProCon's service area centered on Moose Lake, MN",
    "insight_h2": "One thing the shoreline<br>teaches you here.",
    "insight_p1": "A cabin built for July doesn't become a winter home with a space heater and good intentions. The crawl space, the water line depth, the envelope, the heat source — every one of them was designed for a building that gets shut down in October, and every one has to be rethought for a building that runs through January.",
    "insight_p2": "We do those conversions as one planned project instead of a string of patches: insulate and air-seal the shell, get the foundation and plumbing below frost or protected, and size the heating for the real load. Done that way, the cabin your family has always had becomes the home you actually live in.",
    "faqs": [
      ("Do you work as far south as Moose Lake?",
       "Yes. Moose Lake is about forty-five minutes down I-35 from our Duluth base, and the lake country around it — Moosehead, Island Lake, Sturgeon Lake, Barnum — is part of our regular working range."),
      ("Can you convert our seasonal cabin to a year-round home?",
       "Yes — it's some of our favorite work. A real conversion covers the envelope, foundation, water and septic, and heating as one planned project, so the place performs like a home instead of a patched cabin."),
      ("Do you handle shoreland and septic requirements?",
       "Yes. Lake lots come with shoreland setbacks, septic siting, and impervious-surface rules, and we plan the build around them from the first site visit so permitting doesn't stall the project."),
      ("Do you build new homes in Moose Lake itself?",
       "Yes. In-town lots, lake lots, and acreage outside town — we build custom homes, garages, and additions across the Moose Lake area, insulated past Minnesota code minimums for the winters out here."),
    ],
    "nearby": [("/areas/cloquet-mn", "Cloquet"), ("/areas/carlton-mn", "Carlton")],
    "cta_h2": "Building in Moose Lake?",
    "cta_p": "Tell Dan about your lake place. Free estimates, response within 24 hours.",
  },
  {
    "slug": "silver-bay-mn",
    "name": "Silver Bay", "state": "MN", "region": "US-MN",
    "lat": 47.2943, "lon": -91.2573,
    "title": "Custom Homes & Remodeling in Silver Bay, MN | ProCon LLC",
    "desc": "Custom home construction, lake homes, and remodeling in Silver Bay, MN — North Shore builds engineered to bedrock and Lake Superior weather. Owner-led by Dan Bruckelmyer. Free estimate in 24 hours.",
    "og_desc": "Custom homes, lake homes, and remodeling in Silver Bay, MN — built to North Shore bedrock and Lake Superior exposure. Free estimate in 24 hours.",
    "tw_desc": "Custom homes, lake homes, and remodeling in Silver Bay, MN — built to the rock and the lake.",
    "biz_desc": "ProCon LLC provides custom home construction, lake homes, and remodeling in Silver Bay, Minnesota — a 1950s planned town up the North Shore, where builds are engineered to bedrock and detailed for direct Lake Superior exposure.",
    "eyebrow": "Silver Bay, MN",
    "h1": "A planned town<br>on an unplanned shore.",
    "lead": "Custom homes, lake homes, and remodeling in Silver Bay and the Shore around it — Beaver Bay, Little Marais, and the lake lots between. An hour up Highway 61, where the rock is closer to the surface and the lake sets the weather.",
    "hero_img": "thermally-modified-wood-deck-lake-superior.jpg",
    "hero_alt": "Thermally modified wood deck overlooking Lake Superior on the North Shore near Silver Bay, MN",
    "hero_w": 1200, "hero_h": 896,
    "hook_eyebrow": "Building in Silver Bay",
    "hook_h2": "Built in the fifties,<br>ready for the next fifty.",
    "hook_p1": "Silver Bay was built almost all at once in the 1950s — a planned company town for the taconite plant, laid out on the ledge above the lake. That gives it a housing stock unlike anywhere else on the Shore: whole neighborhoods of same-era homes, sturdy but sixty-plus years old, most of them due for the additions, kitchens, windows, and envelope work that bring a mid-century house up to a modern winter.",
    "hook_p2": "Outside town it's classic North Shore building: bedrock at or near the surface, lake lots with direct Superior exposure, and seasonal places that need to survive being left through the winter. We engineer foundations to the rock, detail siding and flashing for the weather that comes off the open lake, and build new lake homes and cabins from Beaver Bay up past Little Marais.",
    "map_h2": "An hour up the Shore from Duluth.",
    "map_q": "Silver+Bay,+MN",
    "map_title": "Map of ProCon's service area centered on Silver Bay, MN on the North Shore",
    "insight_h2": "One thing the fifties<br>teach you here.",
    "insight_p1": "A whole town built in the same decade ages in the same decade. Silver Bay's homes were solidly built, but their walls, windows, and insulation were designed for 1956 fuel prices — and a remodel that ignores the envelope just puts new finishes on an expensive-to-heat shell.",
    "insight_p2": "So when we open up a Silver Bay house for a kitchen, an addition, or new windows, we treat it as the chance to fix the assembly: air-seal, insulate past code minimums, and detail the exterior for lake weather. The house looks better and runs cheaper — that's the whole point of doing it once, properly.",
    "faqs": [
      ("Do you travel as far as Silver Bay?",
       "Yes. Silver Bay is about an hour up Highway 61 from our Duluth base, past Two Harbors, and we work the Shore regularly — Beaver Bay, Silver Bay, and the lake lots up toward Little Marais."),
      ("Can you remodel Silver Bay's 1950s homes?",
       "Yes — it's a specialty fit. The town's mid-century homes are sturdy but due for envelope work, and we pair remodels and additions with air-sealing, insulation past code minimums, and exterior detailing built for lake weather."),
      ("Can you build on bedrock lots near Silver Bay?",
       "Yes. On this stretch of the Shore the rock is often at or near the surface, so we engineer the foundation to the ledge — how the house anchors, bears, and sheds water — before anything is framed."),
      ("Do you build lake homes and cabins up here?",
       "Yes. New lake homes, cabins, and seasonal-to-year-round conversions are a big part of our North Shore work, built and winterized to hold up when they're left empty through a Superior winter."),
    ],
    "nearby": [("/areas/two-harbors-mn", "Two Harbors"), ("/areas/duluth-mn", "Duluth")],
    "cta_h2": "Building up the Shore?",
    "cta_p": "Tell Dan about your lot. Free estimates, response within 24 hours.",
  },
]

V = "20260610k"
VLOGO = "20260610j"

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="https://www.proconmn.com/areas/{slug}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="author" content="Dan Bruckelmyer">
  <meta name="theme-color" content="#13171A">
  <meta name="geo.position" content="{lat};{lon}">
  <meta name="ICBM" content="{lat}, {lon}">
  <meta name="geo.placename" content="{name}, {state}">
  <meta name="geo.region" content="{region}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.proconmn.com/areas/{slug}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{og_desc}">
  <meta property="og:image" content="https://www.proconmn.com/assets/img/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="ProCon LLC — custom home builder in Duluth, Minnesota">
  <meta property="og:site_name" content="ProCon LLC">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{tw_desc}">
  <meta name="twitter:image" content="https://www.proconmn.com/assets/img/og-image.jpg">
  <meta name="apple-mobile-web-app-title" content="ProCon">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">
  <link rel="preload" href="/assets/fonts/ClashDisplay-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/Switzer-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/site.css?v={V}">

  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@graph": [
      {{ "@type": "BreadcrumbList", "itemListElement": [
        {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.proconmn.com/" }},
        {{ "@type": "ListItem", "position": 2, "name": "Areas We Serve", "item": "https://www.proconmn.com/areas" }},
        {{ "@type": "ListItem", "position": 3, "name": "{name}, {state}", "item": "https://www.proconmn.com/areas/{slug}" }}
      ]}},
      {{ "@type": "LocalBusiness", "@id": "https://www.proconmn.com/areas/{slug}#business",
        "name": "ProCon LLC — {name}", "parentOrganization": {{ "@id": "https://www.proconmn.com/#business" }},
        "description": "{biz_desc}",
        "url": "https://www.proconmn.com/areas/{slug}", "telephone": "+1-218-348-2076",
        "image": "https://www.proconmn.com/assets/img/og-image.jpg", "priceRange": "$$",
        "areaServed": {{ "@type": "City", "name": "{name}, {state}" }},
        "geo": {{ "@type": "GeoCoordinates", "latitude": {lat}, "longitude": {lon} }} }},
      {{ "@type": "Service", "name": "Custom Home Construction in {name}, {state}", "serviceType": "Custom home construction", "provider": {{ "@id": "https://www.proconmn.com/#business" }}, "areaServed": {{ "@type": "City", "name": "{name}, {state}" }}, "url": "https://www.proconmn.com/services/custom-home-construction" }},
      {{ "@type": "FAQPage", "mainEntity": [
{faq_json}
      ]}}
    ]
  }}
  </script>
</head>

<body class="grain">
  <a href="#main" class="skip">Skip to content</a>

  <!-- SHARED HEADER START -->{header}<!-- SHARED HEADER END -->

  <main id="main">
    <!-- HERO -->
    <section id="hero" class="shero">
      <div class="hero__glow"></div>
      <svg class="hero__contour" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
        <g stroke="#8FB7C8" stroke-width="1" opacity="0.5">
          <path d="M-50 230 C 320 160, 800 200, 1500 120"/>
          <path d="M-50 360 C 340 300, 820 340, 1500 260" stroke="#B07A37"/>
          <path d="M-50 490 C 360 430, 840 470, 1500 400"/>
        </g>
      </svg>
      <div class="wrap hero__wrap section" style="padding-bottom:clamp(3rem,6vw,5rem)">
        <nav aria-label="Breadcrumb"><ol class="crumb"><li><a href="/">Home</a></li><li><a href="/areas">Areas</a></li><li aria-current="page">{name}</li></ol></nav>
        <p class="eyebrow" data-reveal style="margin-top:2rem">{eyebrow}</p>
        <h1 class="display shero__h1" data-reveal>{h1}</h1>
        <p class="lead measure" data-reveal style="color:var(--mist);--rd:120ms">{lead}</p>
        <div class="shero__pills" data-reveal style="--rd:240ms">
          <span class="pill">Licensed &mdash; MN&nbsp;#QB807406</span>
          <span class="pill">Owner-led since 1997</span>
          <span class="pill">Free estimates &mdash; 24-hr reply</span>
        </div>
        <div class="hero__meta" data-reveal style="--rd:340ms;margin-top:2.2rem">
          <a href="/contact" class="btn btn--solid" data-magnetic>Request an Estimate<span class="btn__dot"></span></a>
          <a href="tel:+12183482076" class="ulink">(218)&nbsp;348-2076</a>
        </div>
      </div>

      <figure class="shero__media" data-reveal>
        <img src="/assets/img/{hero_img}" alt="{hero_alt}" width="{hero_w}" height="{hero_h}" loading="eager" fetchpriority="high" decoding="async">
      </figure>
    </section>

    <!-- LOCAL HOOK -->
    <section class="section">
      <div class="wrap grid-edit">
        <div>
          <p class="eyebrow" data-reveal>{hook_eyebrow}</p>
          <h2 class="h-sec" data-reveal style="margin-top:1.2rem">{hook_h2}</h2>
        </div>
        <div style="display:grid;gap:1.4rem">
          <p data-reveal>{hook_p1}</p>
          <p data-reveal style="--rd:120ms">{hook_p2}</p>
        </div>
      </div>
    </section>

    <!-- SERVICES IN THIS CITY -->
    <section class="section" style="padding-top:0">
      <div class="wrap">
        <p class="eyebrow" data-reveal>What we build in {name}</p>
        <div class="rel" data-reveal style="--rd:80ms;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
          <a class="rel__card" href="/services/custom-home-construction"><b>Custom Homes</b><span>&mdash;&gt;</span></a>
          <a class="rel__card" href="/services/home-additions"><b>Home Additions</b><span>&mdash;&gt;</span></a>
          <a class="rel__card" href="/services/kitchen-remodeling"><b>Remodeling</b><span>&mdash;&gt;</span></a>
          <a class="rel__card" href="/services/deck-construction"><b>Decks</b><span>&mdash;&gt;</span></a>
          <a class="rel__card" href="/services/garages-outbuildings"><b>Garages</b><span>&mdash;&gt;</span></a>
        </div>
      </div>
    </section>

    <!-- MAP -->
    <section class="section" style="padding-top:0">
      <div class="wrap">
        <p class="eyebrow" data-reveal>On the map</p>
        <h2 class="h-sub" data-reveal style="font-family:var(--clash);font-weight:600;margin-top:1rem">{map_h2}</h2>
        <div class="map-embed" data-reveal>
          <iframe title="{map_title}" src="https://www.google.com/maps?q={map_q}&z=11&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </section>

    <!-- LOCAL INSIGHT -->
    <section class="section on-iron">
      <div class="wrap grid-edit">
        <h2 class="h-sec" data-reveal>{insight_h2}</h2>
        <div style="display:grid;gap:1.4rem">
          <p data-reveal style="color:var(--mist)">{insight_p1}</p>
          <p data-reveal style="--rd:120ms;color:var(--mist)">{insight_p2}</p>
        </div>
      </div>
    </section>

    <!-- CTA BAND -->
    <section class="ctaband" aria-label="Request an estimate">
      <div class="wrap ctaband__in">
        <div>
          <p class="ctaband__h">Ready to talk through your project?</p>
          <p class="ctaband__sub">Free written estimate &middot; response within 24 hours &middot; MN license #QB807406</p>
        </div>
        <div class="ctaband__act">
          <a href="/contact" class="btn btn--solid" data-magnetic>Request an Estimate<span class="btn__dot"></span></a>
          <a href="tel:+12183482076" class="ulink">(218)&nbsp;348-2076</a>
        </div>
      </div>
    </section>

    <!-- CITY FAQ -->
    <section class="section">
      <div class="wrap" style="max-width:60rem">
        <p class="eyebrow" data-reveal>{name} questions</p>
        <h2 class="h-sec" data-reveal style="margin-top:1.2rem;margin-bottom:clamp(2rem,4vw,3rem)">Answered.</h2>
        <div class="faq">
{faq_html}
        </div>
      </div>
    </section>

    <!-- ADJACENT AREAS -->
    <section class="section" style="padding-top:0">
      <div class="wrap">
        <p class="eyebrow" data-reveal>Nearby</p>
        <div data-reveal style="margin-top:1.2rem;display:flex;flex-wrap:wrap;gap:.9rem">
{nearby_html}
          <a href="/areas" class="btn btn--ghost">All areas</a>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="hero" style="min-height:auto">
      <div class="hero__glow"></div>
      <svg class="hero__contour" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
        <g stroke="#8FB7C8" stroke-width="1" opacity="0.45"><path d="M-50 180 C 320 120, 800 160, 1500 90"/><path d="M-50 300 C 340 240, 820 280, 1500 210" stroke="#B07A37"/><path d="M-50 430 C 360 380, 840 410, 1500 350"/></g>
      </svg>
      <div class="wrap hero__wrap section" style="text-align:center">
        <h2 class="display" data-reveal>{cta_h2}</h2>
        <p class="lead" data-reveal style="--rd:120ms;margin:1.6rem auto 0;max-width:42ch;color:var(--mist)">{cta_p}</p>
        <div data-reveal style="--rd:240ms;margin-top:2.6rem;display:flex;flex-wrap:wrap;gap:1rem;justify-content:center">
          <a href="/contact" class="btn btn--solid" data-magnetic>Request an Estimate<span class="btn__dot"></span></a>
          <a href="tel:+12183482076" class="btn btn--ghost">(218)&nbsp;348-2076</a>
        </div>
      </div>
    </section>
  </main>

  <!-- SHARED FOOTER START -->{footer}<!-- SHARED FOOTER END -->

  <div class="mbar">
    <a href="tel:+12183482076" class="btn btn--ghost">Call Now</a>
    <a href="/contact" class="btn btn--solid">Free Estimate</a>
  </div>

  <script src="/assets/js/lenis.min.js?v={V}" defer></script>
  <script src="/assets/js/main.js?v={V}" defer></script>
</body>
</html>
"""

for c in CITIES:
    faq_json = ",\n".join(
        '        {{"@type":"Question","name":{q},"acceptedAnswer":{{"@type":"Answer","text":{a}}}}}'.format(
            q=json.dumps(q), a=json.dumps(a)) for q, a in c["faqs"])
    faq_html = "\n".join(
        '          <details class="faq faq__i" data-reveal><summary class="faq__s"><h3 class="faq__q">{q}</h3><span class="faq__m" aria-hidden="true"></span></summary><p class="faq__a">{a}</p></details>'.format(
            q=q.replace("'", "&#39;") if False else q, a=a) for q, a in c["faqs"])
    nearby_html = "\n".join(
        '          <a href="{u}" class="btn btn--ghost">{n}</a>'.format(u=u, n=n) for u, n in c["nearby"])
    html = PAGE.format(V=V, header=HEADER, footer=FOOTER, faq_json=faq_json,
                       faq_html=faq_html, nearby_html=nearby_html, **{k: v for k, v in c.items() if k not in ("faqs", "nearby")})
    out = f"public/areas/{c['slug']}.html"
    open(out, "w").write(html)
    print("wrote", out, len(html.splitlines()), "lines")
