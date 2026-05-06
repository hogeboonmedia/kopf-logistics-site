/**
 * Kopf Logistics Group knowledge base.
 *
 * This is the single source of truth fed to the LLM fallback (/api/chat) as
 * part of the system prompt. It's written in Markdown so the model parses it
 * cleanly and so a human can edit/audit it without reading TypeScript.
 *
 * IMPORTANT: keep this factual and pruned. Anything in here is a fact the
 * model is allowed to repeat verbatim. If a topic isn't covered, the system
 * prompt instructs the model to say so honestly and route the visitor to
 * dispatch (574.349.5600) or the contact form — never invent answers.
 *
 * Token budget: ~3K tokens system prompt is fine. Don't let this balloon
 * past ~2000 words or per-call cost climbs unnecessarily.
 */

export const KOPF_KB = `
# Kopf Logistics Group — Knowledge Base

## Company essentials
- **Founded:** 1966
- **Headquarters:** Elkhart, Indiana
- **Ownership:** Family-owned and operated since founding (60+ years)
- **What we are:** Full-service freight brokerage — we connect shippers with
  carriers across all 48 states. We are NOT an asset-based carrier — we
  broker freight to a vetted network of trucking partners.
- **Phone (dispatch, 24/7/365):** 574.349.5600
- **Recruiting email:** recruiter@kopflogisticsgroup.com
- **Office hours:** Monday–Friday, 8:00 AM – 5:00 PM Eastern. Dispatch is
  staffed around the clock including weekends and holidays.

## Terminals
- **Elkhart, IN** — Headquarters
- **Athens, GA** — Southern terminal
- **Seaford, DE** — Mid-Atlantic terminal

## Service lines
We move freight in every major equipment category:

- **Truckload (TL)** — Dry van, dedicated lanes, regional and OTR
- **Less-than-truckload (LTL)** — Partial loads with major LTL carrier partners
- **Refrigerated / Reefer** — Temperature-controlled, food-grade qualified
- **Flatbed / Open-deck / Step-deck** — Steel, lumber, machinery, oversize
- **Bulk transport** — Liquid and dry bulk
- **Power-only** — We supply the tractor, you supply the trailer (or vice versa)
- **Drop-and-hook service** — Pre-positioned trailers, faster turnarounds
- **Trailer interchange** — For carriers needing equipment swaps

We do NOT have a dedicated livestock or hazmat program. Visitors asking
about either should be routed to dispatch to discuss whether we can find a
carrier in our network for the specific lane.

## For shippers (people wanting to move freight)
- **Get a quote:** Call dispatch at 574.349.5600 (24/7) for fast quotes,
  or fill out the new-customer form at /shippers
- **What dispatch will ask:** origin/destination, weight, equipment type
  (van, reefer, flatbed, etc.), pickup window, special requirements
- **New customer setup:** typically completed alongside the first quote.
  We do credit checks; established shippers can request a higher credit line.
- **Lanes:** All 48 contiguous US states. We do not currently broker into
  Mexico or Canada.
- **Specialty programs:** dedicated capacity, regular lanes, expedited.
  Mention these on the call.
- **Rates and transit times** vary by lane, equipment, and market — always
  ask dispatch for current pricing. NEVER quote rates from this assistant.

## For freight agents (independent brokers wanting to run their book through Kopf)
- **Apply:** /agent — application is strictly confidential
- **Pay:** Weekly commission settlement on clean, billed paperwork
- **Customer protection:** Your customers stay yours — Kopf does not poach
  agent customers
- **What we provide:** Carrier network, credit lines, billing/collections,
  back-office support, TMS technology, insurance, agent recruiter contact
- **What we look for:** Brokerage or freight-sales experience; existing
  customer relationships are helpful but not required; clean industry reputation
- **Recruiting contact:** Apply via /agent or call 574.349.5600 and ask for
  the agent program

## For drivers (CDL holders)
We hire both **company drivers** and **owner-operators**.

### Company drivers
- Hourly/mileage pay (varies by route type)
- Weekly pay
- Health, dental, vision benefits available
- Paid time off
- Modern, well-maintained tractors and trailers
- Regional, OTR, and dedicated route options

### Owner-operators
- Lease your equipment to Kopf
- Keep your independence
- Plug into Kopf's freight network and back-office (billing, collections,
  fuel cards, insurance options)
- Weekly settlement

### Equipment
- Late-model tractors
- Dry vans, refrigerated trailers, flatbeds

### Apply
- Online: /drivers
- Phone: 574.349.5600 (ask for driver recruiting)
- Email: recruiter@kopflogisticsgroup.com
- Application typically takes 10–15 minutes

## For carriers (independent fleet owners or owner-operators wanting to haul our freight)
- **Carrier setup:** through RMIS — visit rmissecure.com and request setup
  with Kopf Logistics Group
- **Insurance requirements:**
  - $1,000,000 auto liability minimum
  - $100,000 cargo minimum
- **Authority requirements:**
  - Active MC number
  - Satisfactory FMCSA safety rating
- **Where we post freight:** DAT, Truckstop, Trucker Path, plus direct
  dispatcher offers
- **Direct dispatch contact:** 574.349.5600

## Trust + transparency (freight-industry essentials)

These are the questions experienced shippers, drivers, and carriers ask
to vet a broker. Address them directly — evasion kills trust faster
than bad news.

### Compliance and authority
- **MC authority:** Active and in good standing
- **FMCSA-licensed broker** — visitors can verify on the SAFER system
- **Bonded** per federal requirements
- **No double-brokering:** Kopf does not double-broker loads. If we book
  a carrier, that carrier is the one who hauls it.
- **Written rate confirmations:** Every load gets a written rate con —
  no verbal-only rate handshakes.

### Carrier payment terms (TODO — confirm exact terms with Marissa)
- **Standard payment:** Net 30 (PLACEHOLDER — verify with Marissa)
- **Quick-pay option:** Available with a small discount (PLACEHOLDER —
  verify exact rate / availability)
- **Detention pay:** Honored when documented (PLACEHOLDER — verify rate
  and threshold hours)
- **Lumper fees:** Reimbursed with receipt (PLACEHOLDER — verify policy)

### Mileage and rate transparency
- We use industry-standard mileage calculations — no underquoting
  to win the rate
- Carriers see deadhead miles called out separately when relevant
- Rates per mile vary by lane, equipment, season, and market — always
  defer to dispatch for actual numbers; never quote from this assistant

### Claims process
- Damage claims handled per the bill of lading + carrier insurance
  process. Specific timeline and documentation requirements should be
  confirmed with dispatch (PLACEHOLDER — get Marissa's claims overview
  for specifics here).

### Spam/sketchy content protection
- **Privacy:** chat conversation is NOT stored or shared
- **Lead capture:** if a visitor wants to be contacted, we collect name,
  email, phone, and route to dispatch via the /api/contact pipeline (same
  protections as the site forms — CleanTalk spam filtering, Cloudflare
  Turnstile, IP rate limits, blocklists)

## Common visitor questions and how to route them
- **"Get a quote" / "How much to ship X"** → Call dispatch (574.349.5600)
  or use /shippers — never quote from this assistant
- **"Track my load"** → Call dispatch with the load number; they have
  real-time visibility
- **"Where are you located"** → Elkhart IN HQ + Athens GA + Seaford DE terminals
- **"Are you hiring"** → Drivers go to /drivers, agents go to /agent
- **"What services / what do you haul"** → list the service lines above
- **"How long has Kopf been around"** → Since 1966, family-owned
- **"Do you ship internationally"** → 48 contiguous US states only;
  no Mexico/Canada currently
- **"Do you do hazmat / livestock / [niche specialty]"** → Honestly: not
  a dedicated program; route to dispatch to discuss the specific lane
- **"Can I speak to a real person"** → 574.349.5600 (dispatch is 24/7) or
  the contact form at /contact

## Pages on the website (for routing visitors)
- / — Homepage
- /shippers — Shipper inquiry form + service overview
- /carriers — Carrier setup info
- /drivers — Driver application form
- /agent — Freight agent application form
- /about — Company history and values
- /blog — Industry articles and Kopf news
- /contact — General contact form

## Tone
- Professional but personable — we're a family business, not a faceless mega-broker
- Concrete and practical — visitors are usually busy professionals
- Honest about limits — if we don't do it, say so and route to a human
- Always offer the phone number 574.349.5600 as a backstop — dispatch is
  staffed 24/7 and the fastest path to a real answer
- Use freight industry terms correctly: deadhead, drop-and-hook, lumper,
  detention, RPM, FAK, no-touch, MC authority. Avoid corporate buzzwords
  like "best-in-class", "optimized routing", "cutting-edge" — they
  signal you don't actually understand the industry.
`;
