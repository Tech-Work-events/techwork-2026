# Tasks: UI harmonisée + CTA mis en avant + animations au service du contenu

**Input**: Design documents from `/docs/specs/007-ui-harmonisation-cta-animations/`  
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] Description`

-   [P]: Can run in parallel (different files, no dependencies)
-   Include exact file paths in descriptions

---

## Phase 3.1: Setup & Baseline

-   [ ] T001 Establish baseline LHCI scores (static build) and archive links [no code]
    -   Cmd: `npm run build && npx -y @lhci/cli autorun --collect.staticDistDir=dist`
    -   Output: paste links into research.md
-   [ ] T002 Confirm/record prefers-reduced-motion policy in research.md and contracts/README.md
-   [ ] T003 Add a short UI audit checklist to quickstart.md (ensure CTA above-the-fold, contrast, focus)

## Phase 3.2: Tokens & Motion Policy (Design surfaces, minimal footprint)

-   [ ] T004 Define lightweight token references (type/spacing/palette/radius/shadow) in data-model.md; align examples to Tailwind utility usage
-   [ ] T005 Specify motion policy details (timings 150–300ms, easing, triggers) in contracts/README.md; add guidance for reduced motion

## Phase 3.3: CTA surfacing and copy scannability (pages indépendantes) — Tests-first = checks/audits avant/après

-   [ ] T006 [P] Home: verify hero CTA prominence and benefits summary placement; adjust if needed (src/pages/index.astro)
-   [ ] T007 [P] Sponsors: ensure early CTA + header value bullets are scannable; confirm mailto/action (src/pages/sponsors.astro)
-   [ ] T008 [P] CFP: ensure primary CTA visible when open; concise benefits bullets; fallback contact when closed (src/pages/cfp.astro)
-   [ ] T009 [P] Team: keep early billetterie CTA under hero; confirm join-us section hierarchy (src/pages/team.astro)
-   [ ] T010 [P] Location: early CTA + reassurance copy; bullets scannables (src/pages/location.astro)
-   [ ] T011 [P] Speakers index/detail: primary actions (if any) clear; thumbnails optimized with lazy/async (src/pages/speakers/index.astro, src/pages/speakers/[slug].astro)
-   [ ] T012 [P] Schedule: confirm visual clarity for session actions; ensure focus states visible (src/pages/schedule/\*)

## Phase 3.4: Motion refinements (micro-interactions au service du contenu)

-   [ ] T013 Document allowable micro-interactions per block (hover accents, subtle in-view) in research.md
-   [ ] T014 Implement reduced-motion gates: ensure decorative animations are aria-hidden and respect user prefs (Hero already addressed) (src/components/home/Hero.astro et similaires)
-   [ ] T015 [P] Home: refine subtle in-view transitions for benefits/social proof only if helpful; avoid heavy parallax (src/pages/index.astro, src/components/home/\*)
-   [ ] T016 [P] Sponsors: optional subtle hover lift on logos/CTA; ensure accessible focus alternative (src/pages/sponsors.astro, src/components/home/SponsorsBlock.astro)
-   [ ] T017 [P] CFP/Team/Location: apply gentle appear/focus styles where beneficial; keep content-first (respective pages)

## Phase 3.5: A11y & Contrast sweep

-   [ ] T018 Run a11y pass: alt text correctness (decorative alt=""), landmarks/roles where needed (headers/sections), focus rings visibility (multiple pages)
-   [ ] T019 Verify contrast ratios for text on gradient/overlay backgrounds; adjust utilities if needed
-   [ ] T020 Ensure keyboard navigation order is logical for CTAs; add `title`/`aria-label` where needed (links/socials)

## Phase 3.6: SEO polish (UI-level)

-   [ ] T021 Ensure meta description present/clear across key pages (src/layouts/Layout.astro usage); avoid duplicates
-   [ ] T022 Preconnect/preload only where beneficial (fonts/analytics/images LCP); validate no overuse

## Phase 3.7: Perf guardrails

-   [ ] T023 Verify responsive image variants for critical hero(s) and heavy sections; avoid unnecessary JS above-the-fold
-   [ ] T024 Confirm lazy+decoding async on non-critical images (speakers/team/sponsors) — already largely done, re-check
-   [ ] T025 Remove/disable any costly runtime preloads (e.g., gallery orientation probing) — already removed, verify

## Phase 3.8: Validation & “no-regression” gate

-   [ ] T026 Build + LHCI (static dist); paste links in research.md; confirm no category regresses by > 2 points vs baseline
-   [ ] T027 Visual review pass with checklist from quickstart.md (mobile and desktop)
-   [ ] T028 Prepare short UI harmony summary (decisions + before/after screenshots) appended to research.md

## Dependencies

-   T001 baseline before major changes (guides acceptance for T026)
-   T004–T005 before T013–T017 (policy before implementation)
-   Page-specific tasks T006–T012 are parallelizable [P] (distinct files) but coordinate to avoid conflicting shared components
-   T026 after all page/motion/a11y perf tasks

## Parallel Execution Examples

-   In parallel: T006+T007+T008+T009+T010+T011+T012 (distinct pages)
-   In parallel: T015+T016+T017 (distinct page/component sets)

## Validation Checklist

-   [ ] Every key page has a clearly visible primary CTA in context
-   [ ] Animations are subtle, content-first, and respect reduced motion
-   [ ] Contrast and focus pass AA guidelines
-   [ ] Lighthouse categories: no regression > 2 points; ideally improved LCP on Home
-   [ ] Research.md updated with final decisions and report links
