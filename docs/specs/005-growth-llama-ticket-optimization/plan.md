# Implementation Plan: Growth-driven "Llama" conversion optimization (005)

Status: Draft
Spec: ./spec.md
Principles: Simplicity, anti-abstraction, integration-first testing

## 1) Objectives & Guardrails

-   Primary: Increase ticket conversions (homepage ➜ purchase) without harming UX (CLS/LCP budgets) or accessibility.
-   Secondary: Improve email capture, social proof, and sharing.
-   Guardrails: No breaking changes to existing routes; keep playful llama tone; respect RGPD.

## 2) Scope by Surface (High-level)

-   Global: persistent/visible CTA strategy (header, mobile drawer, footer, sticky), UTM propagation, OG/social assets.
-   Homepage: Hero copy/CTA; Tickets section; proof (logos/quotes/photos); FAQ; sticky CTA.
-   Content pages (CFP, Team, Sponsors, CoC, Location, Blog): add/repeat CTA blocks; OG/meta tuning; link to Tickets.
-   Mobile-first: ensure above-the-fold CTA, sticky behavior; avoid scroll-jank.

## 3) Copy & Brand Strategy (llama)

-   Voice: fun/décalé, pro, inclusif; microcopy qui réduit la friction.
-   Pillars: partager • réseauter • se former; afterwork vibe + journée de talks/ateliers.
-   CTA labels (initial set): "Réserver ma place", variantes test A/B ("Je viens", "Banco", "Mon billet").

## 4) Experiments (A/B-ready structure)

-   Hero CTA text: Réserver vs Je viens.
-   Social proof prominence: logos vs témoignages court.
-   Sticky CTA presence vs absence (thresholds).
    Note: Tooling TBD; plan components and copy slots to be switchable via simple flags to enable future experiments.

## 5) Analytics & Consent (High-level)

-   Preserve UTM/source params from entry ➜ ticketing link.
-   Respect existing consent banner; do not add new trackers without consent.
-   Measure events: CTA click locations, Tickets section view, outbound to ticketing.

## 6) SEO/Sharing

-   Ensure unique title/desc; OG and Twitter Cards per key page with llama visuals.
-   Homepage OG emphasizes conversion angle ("Prends ton billet").

## 7) Performance & Accessibility Budgets

-   CLS ≤ 0.1; LCP ≤ 2.5s (mobile 4G); images lazy; avoid layout shifts from sticky.
-   Focus visible, color contrast, keyboard, reduced motion respect.

## 8) Architecture Notes (Non-technical)

-   Introduce a centralized TicketCTA config (label, URL, UTM defaults) consumable by layout/blocks.
-   Reusable CTA block for insertion across pages (header/footer/section/sticky variants).
-   Content-driven social proof + FAQ blocks with llama tone.

## 9) Workstreams

1. CTA System
    - Define CTA contract (label, url, utm, variant, placement).
    - Header/mobile drawer CTA consistency; footer CTA; sticky CTA threshold.
2. Tickets Section
    - Value bullets (share/network/learn), pricing highlights (clarify with stakeholders), trust snippet (refund policy), venue/date.
3. Proof & FAQ
    - Minimal social proof (logos/testimonials/photos); short FAQ objections.
4. UTM/Tracking
    - UTM propagation through CTA links; outbound click events honoring consent.
5. SEO/OG
    - OG/Twitter meta refresh with llama visuals; per-page titles.

## 10) Risks & Dependencies

-   Pricing/tiers and refund policy clarity needed.
-   Ticketing provider deep-link behavior may vary.
-   Asset availability (logos, photos, OG images) required.

## 11) Milestones

-   M1: CTA system + sticky CTA (visible everywhere); UTM propagation.
-   M2: Homepage tickets block + proof + FAQ (baseline copy).
-   M3: Rollout CTAs to content pages; OG/meta updates.
-   M4: Copy refinements (llama tone) + experiment toggles.

## 12) Testing Strategy (Integration-first)

-   Visual regression for header/footer/sticky on mobile/desktop.
-   Automated checks for presence of CTA on all key routes.
-   Unit tests for UTM propagation utility.
-   Manual accessibility pass (keyboard, focus outlines, contrast).

## 13) Acceptance Mapping

-   Mirrors spec Acceptance Criteria 1–6 with page-by-page verification checklist.

## 14) Out-of-Scope (for now)

-   Payment integration changes; complex referral system; multi-language (unless approved); new tracking vendors.
