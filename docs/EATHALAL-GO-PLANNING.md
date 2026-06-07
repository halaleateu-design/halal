# EatHalal Go — Project planning

> Living document. Update sections as decisions are made.  
> **Portuguese version (client Notion template):** [PLANEAMENTO-EATHALAL-GO.md](./PLANEAMENTO-EATHALAL-GO.md)  
> Code & deploy: see also [ESTADO-TECNICO.md](./ESTADO-TECNICO.md).

---

## Overview

- **Goal:** Launch a **100% halal** delivery marketplace in the EU, starting in **Porto (Portugal)**, with customer app/web, restaurant/butcher panel, and courier app — current phase = **waitlist + partners + WhatsApp/API pilot**.
- **Problem it solves:** Generic apps mix halal and non-halal; Muslim consumers and families want trust, clear menus, and reliable delivery in one place.
- **Target audience:** Halal families and young adults in Porto (EU expansion); local halal restaurants/butchers; couriers (bicycle/scooter/car).
- **Value proposition:** Verified halal partners only · one screen to order · transparent fees · local support (PT/EN).

---

## Scope

### Includes

- [x] Public site (homepage, categories, demo menu, WhatsApp checkout)
- [x] Customer / merchant / rider registration (`signup.html`, API `/auth/register`)
- [x] Merchant application (`partners.html` → `/merchants/apply`)
- [x] Rider waitlist (`rider/index.html` → `/riders/apply`)
- [x] Customer waitlist (`waitlist.html` → `/waitlist`)
- [x] Admin inbox (merchant + rider lists, tracking codes) — `admin/index.html`
- [x] Order flow API (customer → merchant accepts → rider pool → claim → GPS → track)
- [ ] In-app payments (Stripe / MB Way)
- [ ] Native iOS/Android apps (Capacitor in `mobile/` — roadmap)
- [ ] Automatic payment split (restaurant + courier + platform)

### Does not include (for now)

- [ ] Alcohol, gambling, non-halal categories
- [ ] Generic marketplace outside the halal vertical
- [ ] Full multi-city rollout beyond Porto pilot (EU prep only)
- [ ] Automatic PT accounting/invoicing (Lda + accountant = manual process)

---

## Deliverables

- [ ] **MVP (description):** Porto · 3–5 restaurants · waitlist ≥500 · orders via web/API or WhatsApp · merchant accepts · 1+ rider · public tracking.
- [ ] **Prototype (Figma/link):** _TBD_
- [x] **Initial backlog:** this document + [ESTADO-TECNICO.md](./ESTADO-TECNICO.md) + GitHub `halaleateu-design/halal`

---

## Requirements

### Functional

- [x] Customer: browse menu, order (guest or account), tracking code
- [x] Restaurant: receive order (API + optional email), accept, see customer address
- [x] Courier: job pool, claim, shop + customer address, GPS, picked_up → delivered states
- [x] Operator: admin stats + merchant/rider lists + manual tracking creation
- [ ] Customer: pay by card/MB Way/Apple Pay in app
- [ ] Courier: native push notifications
- [ ] Restaurant: tablet “new order” with sound

### Non-functional

- [ ] **Performance:** Render free tier API; optimize when >1k DAU
- [x] **Security/privacy:** JWT, `ADMIN_API_KEY`, env secrets on Render; GDPR pack before mass accounts
- [ ] **Accessibility:** improve forms and contrast (audit pending)

---

## Roadmap (high level)

| Phase | Goal | Deadline | Status |
| --- | --- | --- | --- |
| Discovery | Waitlist + 10 Porto restaurants mapped | _set date_ | In progress |
| MVP | 3–5 live partners + pilot deliveries | _set date_ | Not started |
| Beta | Stripe payments + app stores | _set date_ | Not started |

---

## Decisions

- **Decision:** Web + monolith Node API (Express + SQLite) on Render; static frontend on same host or Netlify.
    - **Date:** 2025–2026
    - **Context:** small team, low cost, fast deploy
    - **Options considered:** Firebase-only, microservices
    - **Choice:** Node + SQLite + static HTML
    - **Reason:** simplicity, E2E testable, single Render URL

- **Decision:** WhatsApp checkout while PSP is not live.
    - **Date:** 2025–2026
    - **Context:** in-app payments not integrated yet
    - **Options considered:** Stripe immediately vs manual WhatsApp
    - **Choice:** `wa.me/351931430970` on site
    - **Reason:** real revenue before Stripe

- **Decision:** Waitlist and B2B site in English (EN).
    - **Date:** 2026
    - **Context:** Porto pilot with PT/EN audience and tourists
    - **Options considered:** PT-only vs EN-only vs bilingual
    - **Choice:** `waitlist.html`, `waitlist-success.html`, `certification.html` in EN
    - **Reason:** launch copy aligned with flyers and Instagram outreach

---

## Risks and mitigation

- **Risk:** Render free — SQLite disk may reset
    - **Impact:** lead loss
    - **Probability:** medium
    - **Mitigation:** weekly admin export · backup · paid plan or Postgres

- **Risk:** Alert emails not delivered (`NOTIFY_TO` / SMTP / Resend)
    - **Impact:** leads visible in admin only
    - **Probability:** medium
    - **Mitigation:** `/api/v1/notify-status` · configure Resend or Gmail app password

- **Risk:** Failed deploy / wrong API base in admin
    - **Impact:** operator cannot see applications
    - **Probability:** low
    - **Mitigation:** API base = `https://…/api/v1` · `ADMIN_API_KEY` in Render Environment

---

## Success metrics

- [ ] **Acquisition:** site visits, waitlist conversion %
- [ ] **Activation:** 1st order per registered user
- [ ] **Retention:** 2nd order within 30 days
- [ ] **Revenue (if applicable):** GMV, 15–30% commission, service fee
- [ ] **NPS/CSAT (if applicable):** post-delivery survey

---

## Waitlist (focus)

### Waitlist goal

- [ ] **Target (e.g. 500 signups by DD/MM)**
- [x] **Priority segment:** Porto, Portugal (pilot)

### Offer and message

- [ ] **Main promise (1 sentence):** _e.g. “The first 100% halal delivery platform in Porto, at your door.”_
- [x] **Incentive:** early access · **free first delivery** + **1-year discount** for the **first 100** (`waitlist.html`)
- [x] **Proof/credentials:** demo partner Porto Halal Kitchen · halal policy on site · IHP path on `certification.html`

### Acquisition channels

- [ ] Instagram/TikTok (@eathalaleu)
- [ ] Local communities (Facebook/WhatsApp/Reddit)
- [ ] Partnerships (restaurants/mosques/associations)
- [ ] SEO/Google Maps (if applicable)
- [ ] Referral (implemented on `waitlist-success.html` with `?ref=`)

### Flow

1. [x] Landing page (copy + CTA) — `waitlist.html` (EN)
2. [x] Form (name + email/WhatsApp + city) — integrated API `POST /api/v1/waitlist`
3. [x] Confirmation + welcome message — `waitlist-success.html` (queue position + referral link)
4. [ ] Follow-up sequence (2–3 messages) — manual email/WhatsApp

### Metrics

- [ ] **Visits → conversion (%):**
- [ ] **Cost per lead (if paid):**
- [ ] **Daily/weekly growth:**
- [ ] **Lead source (channel):** _UTM to add_

### Assets (images) — where to use

> Paste/attach each image in the section below (so nothing gets lost).  
> **Tip:** name files before upload (e.g. `waitlist-qr.png`, `flyer-coming-soon.jpg`).

### Message to request “PDF Print” export (Canva)

Hi! Look, I was speaking with the print shop about printing our flyers in A5 size (14.8 x 21 cm). To ensure that the QR Code works perfectly on phones and the image doesn't lose any quality (like what happened in our previous tests), we need to export the file with professional print settings.

Could you handle this on Canva using your computer and send me the final file? The guy at the print shop asked us to do exactly this:

1. Adjust the size: Make sure the design is in the correct vertical A5 proportion (14.8 x 21 cm).
2. Turn on margins: In the Canva menu, enable the 'Show print bleed' option (so we don't risk the printer's cutter cropping out text or leaving white edges).
3. Export in maximum quality (Most important):
   - Click on Share > Download.
   - Choose the file type: PDF Print.
   - Check the box for 'Crop marks and bleed'.
   - Under the color profile, change it from RGB to CMYK (best for professional printing).

If you can download the original PDF file with these settings, the print shop will be able to print it directly with maximum sharpness. Thanks!

### Images (attach here)

- [ ] Attach/paste flyer + QR code images in this section.
- [ ] **EatHalal QR Code (IMG_7543.png):** landing page, printed flyers, Instagram bio.
- [ ] **Pack “Questions?/Join our Community/English-Arabic” (533B5A1E…jpeg):** Instagram carousel + street material (WhatsApp CTA + waitlist link).
- [ ] **Flyer “Porto’s Halal Revolution…” (82328078…jpeg):** main outreach piece (print + social). A/B version with and without Porto background.
- [ ] **Banner “Get ready for launch” (IMG_7534.png):** landing page hero / story / paid ad for conversion.
- [ ] **Asset kit (IMG_7533.png):** library (logos, seals, badges) for future pieces.

#### New assets (added now)

- [ ] **Full landing/website mockup (IMG_7443.png):** hero/thumbnail for product pitch (deck, LinkedIn, press kit) and main image on “About / How it works”.
- [ ] **3 hero/section variations (IMG_7444.png):** A/B landing tests (headline/benefit/couriers) and “How it works” carousel.
- [ ] **Strategy triptych (IMG_7438.png):** internal slide/1-pager (Direct Benefit vs Viral/Queue vs Badge) + educational carousel.
- [ ] **Posts/ads grid (IMG_7354.png):** campaign creative bank (Instagram feed + ads). Split into individual pieces when needed.
- [ ] **App screens (IMG_7336.png):** “Features”, future App Store/Google Play, partner pitch, product posts.

### Next actions (this week)

- [ ] Set target and audience
- [ ] Write landing copy (headline + 3 bullets + CTA)
- [x] Create form and integrate with API (replaces spreadsheet/Notion — data in waitlist DB + admin)
- [ ] Prepare 5 posts + 1 story with CTA
- [ ] List 20 communities/partners for outreach

---

## Next steps

- [ ] List of 10 Restaurants (Porto)
- [ ] Business Model and Commissions
- [ ] Partner Outreach Playbook

---

## POINT 1: How the Systems and Technology Work

An app like EatHalal is not just “one” application — it is **three integrated systems** that communicate in real time:

1. **Customer app:** Where people browse the menu, choose food, pay, and track the courier on the map.
2. **Restaurant/butcher panel:** A screen (usually a tablet or phone at the partner counter) that alerts when an order arrives. The restaurant accepts, prepares food, and taps “Ready for pickup”.
3. **Courier app:** The system detects the nearest courier to that restaurant and sends a notification: “Order available at Restaurant X. Earnings: €3.50”. The courier accepts, picks up, and delivers.

**The “brain” (backend):** In the middle, a central server calculates distances automatically via the Google Maps API, sets delivery pricing, and distributes tasks.

**Status in GO project (technical reference):**

| System | Files / routes |
| --- | --- |
| Customer app / web | `index.html`, `delivery-place-order.html`, `track-order.html` |
| Restaurant panel | `delivery-merchant-console.html` + SSE + email |
| Courier app | `delivery-rider-console.html` + SSE |
| Backend | `backend/src` · routes `/api/v1/orders/*` · SSE `/api/v1/orders/stream/...` |

---

## POINT 2: How Payments Work in Practice

The customer pays in the app (card, MB Way, or Apple/Google Pay). The money **does not go directly to the restaurant** — it first lands in EatHalal’s account.

**Money flow (payment gateway)**

To process in-app payments securely, you need a provider like **Stripe** or **Adyen**. The process works like this:

1. The customer places a **€20.00** order (€15 food + €3 delivery fee + €2 service fee).
2. **Stripe** processes payment, charges a small fee (e.g. 1.4% + €0.25), and holds the net amount in your company’s digital account.
3. **The split:** Once a week (or every 15 days), your system makes automatic transfers:
   - Restaurant share (€15 minus your commission).
   - Courier share (€3 delivery fee).
   - What remains is your gross profit.

**Today in code:** **WhatsApp** checkout (`wa.me/351931430970`) and API orders without payment capture.

---

## POINT 3: Profit Math (Business Model)

How does EatHalal earn money to cover costs and generate profit? There are **three main revenue streams**:

**Commission on food (largest slice):** You charge restaurants a percentage on each in-app sale. Market range is **15–30%**. At **20%**, on €15 of food, **€3.00** stays with EatHalal.

**Service fee to the customer:** A fixed fee (e.g. €0.80 or €1.50) per order to help cover system costs.

**Delivery fee margin (optional):** Customer pays e.g. €3.50 delivery. You can pass €3.00 to the courier and keep €0.50, or pass 100% to the courier (as suggested on the flyer) and profit only from the two fees above.

---

## POINT 4: Initial Costs (What You Need to Buy and Spend)

To launch on the ground lean, without wasting money, focus investment here:

**1. Technology and infrastructure (essential)**

- **Site/app hosting:** Servers (AWS, Firebase, or Heroku). At the start, with few users, cost is very low or nearly free; it rises as you reach thousands of visits.
- **Developer licenses:** ~$99/year for Apple App Store and $25 (one-time) for Google Play Store.
- **Maps APIs:** Google Maps charges per map load or route calculation. Substantial free monthly credit, but plan for cost as the business grows.

**2. Operations and marketing (Porto launch)**

- **Courier equipment:** For launch, buy **5–10 green branded thermal bags** for first couriers — food quality + free street advertising in Porto.
- **Promotional material:** Print courier recruitment flyers and QR stickers for partner restaurant doors.
- **Digital marketing:** Small Instagram/Facebook ads strictly geo-targeted to Porto for first waitlist signups.

**3. Legal costs (company formation)**

- **Create company (Lda):** In Portugal via “Empresa na Hora”. Commercial registration ~€360. Also budget a **Certified Accountant** (mandatory for companies) for monthly billing and taxes.

---

## POINT 5: Chronological Step-by-Step to Get Started

To avoid overwhelm, divide work into three clear phases:

**Current phase (Waitlist):** Near-zero spend. Goal is to put the site online with the waitlist and test Porto market interest. If you get 500 signups in a few weeks, you know the business can work.

**Preparation phase:** While the app is in Apple/Google review, close the first 3–5 restaurants and buy the first bags for waitlist couriers.

**Launch (Go-Live):** Enable Stripe payments, notify everyone on the list by email/WhatsApp, and start official deliveries.

---

## Technical reference (dev team)

| What | URL / file |
| --- | --- |
| Live site | https://halall-dm79.onrender.com |
| Customer waitlist | https://halall-dm79.onrender.com/waitlist.html |
| Admin | https://halall-dm79.onrender.com/admin/ |
| Merchant | https://halall-dm79.onrender.com/partners.html |
| Rider | https://halall-dm79.onrender.com/rider/index.html |
| API health | https://halall-dm79.onrender.com/api/v1/health |
| Operator checklist | `OPERATOR-CHECKLIST.txt` |
| Automated test | `npm run test:e2e` |
