# Implementation Plan: UI harmonisée + CTA mis en avant + animations au service du contenu

**Branch**: `007-ui-harmonisation-cta-animations` | **Date**: 2025-10-11 | **Spec**: ../007-ui-harmonisation-cta-animations/spec.md  
**Input**: Feature specification from `/docs/specs/007-ui-harmonisation-cta-animations/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
3. Fill the Constitution Check section based on the constitution document
4. Evaluate Constitution Check section
5. Execute Phase 0 → research.md
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent file
7. Re-evaluate Constitution Check section and STOP (ready for /tasks)
```

## Summary

Harmoniser l’UI sur tout le site (Astro + Tailwind) avec un système cohérent (typos, espaces, couleurs, composants), mettre en avant les CTA prioritaires au-dessus de la ligne de flottaison quand pertinent, et revoir les animations pour qu’elles soutiennent la compréhension du contenu, en respectant prefers-reduced-motion et l’accessibilité.

## Technical Context

-   Language/Version: TypeScript / Astro 5.x
-   Primary Dependencies: Astro, TailwindCSS, @astrojs/tailwind
-   Storage: N/A (site statique)
-   Testing: Vitest (déjà présent); audits: Lighthouse CI via npx
-   Target Platform: Web (mobile-first responsive)
-   Project Type: Single web app (frontend only)
-   Performance Goals: Aucun recul Lighthouse; idéalement LCP mobile < 3.5s sur Home (simulé)
-   Constraints: Accessibilité AA minimale, prefers-reduced-motion respecté, pas d’augmentation sensible du JS au-dessus de la ligne de flottaison
-   Scale/Scope: Ensemble des pages clés (Home, Speakers, Schedule, Sponsors, CFP, Team, Location)

## Constitution Check

-   Simplicité: OK – une seule app Astro, modifications UI incrémentales.
-   Anti-abstraction: OK – on réutilise les composants existants, pas de sur‑ingénierie de design system.
-   Test-first / Integration-first: OK – nous prévoyons d’ajouter des checks mesurables (Lighthouse + scénarios d’acceptation UI). Les tests unitaires restent légers; priorité à l’intégration (aperçu et audits).

Gate status (initial): PASS, sous réserve de clarifications de périmètre.

## Project Structure

### Documentation (this feature)

```
specs/007-ui-harmonisation-cta-animations/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
src/
├── components/
│   ├── home/
│   ├── schedule/
│   ├── ui-elements/
│   └── ...
├── layouts/
└── pages/
```

**Structure Decision**: Web single-app (Astro). Tous les changements sont localisés dans `src/pages`, `src/components`, `src/layouts` + styles utilitaires Tailwind.

## Phase 0: Outline & Research

1. Extraire les inconnues du spec (NEEDS CLARIFICATION) et établir une politique UI:

-   Tokens de référence (échelles type/espaces, palette, radius, ombres)
-   Politique d’animations (durée, easing, déclencheurs, reduced-motion)
-   Priorités page par page pour CTA et messages

2. Méthode:

-   Audit visuel page par page (mobile/desktop): cohérence typographique, espacements, contrastes, hiérarchies H1/H2/H3, states CTA
-   Inventaire composants clés (CTA, sections header, cards, badges, lists)
-   Audit perf/a11y SEO rapide (Lighthouse) pour s’assurer de « no‑regression »

3. Sortie attendue: research.md avec décisions, rationales et alternatives.

## Phase 1: Design & Contracts

1. Data model (conceptuel): tokens (typographie, espacement, palette, rayons/ombres), variants CTA (primaire/secondaire/tertiary), états (default/hover/focus/active/disabled), policy motion.
2. Contracts UI: conventions de CTA (taille, ordre visuel, emplacement), sections “intro/CTA/bénéfices/social proof”, règles d’animations (in‑view, hover, timing, reduced-motion), règles d’accessibilité (contraste, focus visible, alt texte).
3. Quickstart: exécution locale (dev/preview), audit Lighthouse rapide, checklist de revue UI.

Ré‑évaluation Constitution Check: le design reste simple, axé utilisateurs, mesurable via audits – PASS.

## Phase 2: Task Planning Approach (description, ne pas exécuter)

-   Générer tasks.md à partir du plan et des artefacts:
    -   Normalisation tokens/ui (styles utilitaires et classes Tailwind ciblées) [P]
    -   CTA surfacing par page (Home, Sponsors, CFP, Team, Location, Speakers, Schedule) [P]
    -   Motion policy (dégradé → micro‑interactions légères; `prefers-reduced-motion`) [P]
    -   A11y passes (focus states, roles/titles, alt décoratifs/pertinents) [P]
    -   Audits Lighthouse « no-regression » (CI locale via npx)
-   Ordonnancement: tests/audits et checks de revue visuelle avant code massif; itérations page par page.

## Phase 3+: Future Implementation

-   /tasks génère tasks.md, puis implémentation incrémentale en TDD visuel (aperçu + audits) et validation finale.

## Complexity Tracking

N/A (pas de déviations complexes prévues; si introduction d’un design token set global lourd est envisagée, re‑valider la simplicité).

## Progress Tracking

**Phase Status**:

-   [ ] Phase 0: Research complete (/plan command)
-   [ ] Phase 1: Design complete (/plan command)
-   [ ] Phase 2: Task planning complete (/plan command - describe approach only)
-   [ ] Phase 3: Tasks generated (/tasks command)
-   [ ] Phase 4: Implementation complete
-   [ ] Phase 5: Validation passed

**Gate Status**:

-   [ ] Initial Constitution Check: PASS
-   [ ] Post-Design Constitution Check: PASS
-   [ ] All NEEDS CLARIFICATION resolved
-   [ ] Complexity deviations documented
