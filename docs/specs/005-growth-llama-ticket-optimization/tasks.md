# Tasks: 005 Growth-driven "Llama" conversion optimization

Input: Design documents from `docs/specs/005-growth-llama-ticket-optimization/`
Prerequisites: plan.md (required), research.md, data-model.md, contracts/

Format: `[ID] [P?] Description`

-   [P] = Parallelizable (different files and no dependencies)
-   Tests-first: write tests or validation scripts before implementation when feasible; request permission if test runner install is required.

---

## Phase 3.1: Setup / Baseline

-   [ ] T001 Confirm ticketing provider URL and UTM default scheme in a central config (no code yet) — owners sign-off
-   [ ] T002 Create content brief for llama-toned CTA/copy variants (labels, microcopy) — shared doc for review

## Phase 3.2: Tests First (TDD) — gated by test runner availability

-   [ ] T010 Decide test runner. If none present, request permission to add Vitest/Playwright (Package install required). If denied, prepare lightweight script-based validations instead (no deps).
-   [ ] T011 [P] Contract tests for CTA contract (fields/behavior) in `tests/contract/cta.contract.test.(ts|js)` — covers: required fields, placement enum, variant enum, accessibility flags
-   [ ] T012 [P] Unit tests for UTM merge util in `tests/unit/utm.test.(ts|js)` — covers: incoming params override defaults; remove empties; preserve unknown params
-   [ ] T013 Integration test plan (manual or Playwright) for CTA click preserving UTM → ticketing — document steps in `docs/specs/005.../quickstart.md`

Dependencies: T010 → (T011, T012). If T010 not approved, convert T011–T013 into script/manual validations before implementing.

## Phase 3.3: Core Implementation

1. CTA System

-   [ ] T020 Create central CTA config `src/config/cta.ts` with: label, baseUrl, utmDefaults, placements
-   [ ] T021 [P] Implement UTM propagation util `src/utils/utm.ts` per contract/tracking.md
-   [ ] T022 [P] Reusable CTA component `src/components/cta/PrimaryCTA.astro` (props: label, href, placement, variant) with consent-friendly data-attrs
-   [ ] T023 Wire analytics hooks (Plausible custom event or no-op if no consent) in CTA component

2. Global surfacing

-   [ ] T030 Add CTA to header (desktop) `src/components/Menu.astro` — consistent with config; ensure no layout shift
-   [ ] T031 Add CTA to mobile drawer header `src/components/Menu.astro` (top prominent button)
-   [ ] T032 Footer CTA block `src/components/FooterBlock.astro` or equivalent; ensure contrast and focus visible
-   [ ] T033 Sticky CTA `src/components/cta/StickyCTA.astro` and mount in `src/layouts/Layout.astro` with sensible scroll threshold

3. Homepage optimization

-   [ ] T040 Refine Hero copy to llama tone and ensure CTA visible above the fold `src/components/home/Hero.astro`
-   [ ] T041 Tickets section enrichments in `src/components/home/HomeTicketsBlock.astro`: value bullets (partager / réseauter / se former), pricing highlights (placeholders), trust snippet (refund policy placeholder)
-   [ ] T042 [P] Social proof strip `src/components/home/HomeSocialProof.astro` (logos/quotes/photos from content)
-   [ ] T043 [P] Mini-FAQ `src/components/home/HomeFAQ.astro` covering typical objections

4. Tracking and consent

-   [ ] T050 Implement UTM merge on all CTA hrefs site-wide (Header, Hero, Tickets, Footer, Sticky)
-   [ ] T051 Ensure analytics events dispatch only with consent; otherwise no-op

5. SEO / Sharing

-   [ ] T060 Update OG/Twitter meta for key pages in `src/layouts/Layout.astro` (llama visuals, conversion-forward titles)
-   [ ] T061 Provide llama-themed OG assets (paths only; assets delivered separately) and wire fallbacks

## Phase 3.4: Validation & Polish

-   [ ] T070 Visual pass mobile/desktop: CTA above-the-fold, sticky behavior, no clipping, no overlaps
-   [ ] T071 Accessibility check: keyboard focus, labels/aria, contrast, reduced motion compliance
-   [ ] T072 Performance spot-check: CLS ≤ 0.1, LCP ≤ 2.5s on mobile; lazy images ok
-   [ ] T073 UTM propagation verification: navigate with `?utm_source=test` → click CTA → confirm params on outbound URL
-   [ ] T074 SEO preview checks: OG/Twitter cards render with llama visuals and copy
-   [ ] T075 Content review (tone of voice): ensure playful yet pro copy across new blocks

## Dependencies

-   T020 depends on T001; T021–T023 can start after T010 or proceed with no-test validation if tests unavailable
-   T030–T033 depend on CTA component (T022) and util (T021)
-   T040–T043 depend on CTA availability for wiring
-   T050–T051 depend on util (T021)
-   T060–T061 can run in parallel to core UI tasks but require asset decisions

## Parallelizable [P] examples

-   T021 (utm util) and T022 (CTA component)
-   T042 (Social proof) and T043 (FAQ) — different files
-   T060 (meta) and T061 (assets wiring)

## Notes

-   Avoid code changes that require new packages without explicit permission (tests/tools/pixels)
-   Keep llama tone consistent; prefer short, high-contrast copy
-   Commit per task; small PRs if gating reviews are preferred
