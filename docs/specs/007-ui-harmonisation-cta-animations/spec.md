# Feature Specification: UI harmonisée + CTA mis en avant + animations au service du contenu

**Feature Branch**: `007-ui-harmonisation-cta-animations`  
**Created**: 2025-10-11  
**Status**: Draft  
**Input**: User description: "tu es un expert en UI, je veux que tu passes sur chaque page, block, template et component pour avoir une UI harmonieuse qui respecte les meilleurs standarts. Tu peux t'aider de context7 si besoin. Mets bien en avant les CTA et améliore la compréhension des messages grâce à l'UI. Met des animations quand c'est pertient. Rerefléchis aux animations du site pour qu'elle soit au service du contenu."

## Execution Flow (main)

```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

-   ✅ Focus on WHAT users need and WHY
-   ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
-   👥 Written for business stakeholders, not developers

### Section Requirements

-   Mandatory sections: Must be completed for every feature
-   Optional sections: Include only when relevant to the feature
-   When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. Mark all ambiguities: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. Don't guess: If the prompt doesn't specify something, mark it
3. Think like a tester: Every vague requirement should fail the "testable and unambiguous" checklist item
4. Common underspecified areas:
    - User types and permissions
    - Performance targets and scale
    - Error handling behaviors
    - Integration requirements
    - Security/compliance needs

---

## User Scenarios & Testing (mandatory)

### Primary User Story

En tant que visiteur (mobile et desktop), je parcours les pages du site et je comprends immédiatement la proposition de valeur, avec des CTA visibles et cohérents. L’UI est homogène (typographies, couleurs, espacements, composants), les animations sont discrètes et au service du contenu, et je peux agir (acheter billet, devenir sponsor, soumettre CFP, rejoindre l’équipe) sans hésitation.

### Acceptance Scenarios

1. Given un nouvel utilisateur sur Home (mobile), When la page charge, Then un CTA primaire visible dans le premier viewport et un résumé bénéfices sont présents, sans animation gênante.
2. Given un utilisateur sur Sponsors, When il scrolle légèrement, Then la valeur et les CTA « Discutons partenariat » sont visibles et cohérents avec le style global.
3. Given un utilisateur sur CFP (ouvert), When il lit le bloc d’intro, Then un CTA primaire clair « Proposer une session » est présent, et les bénéfices sont scannables.
4. Given un utilisateur sur Team et Location, When il arrive en haut de page, Then un CTA billetterie/utile est visible tôt, aligné sur la hiérarchie H1/H2.
5. Given un utilisateur avec préférence « reduced motion », When il visite le site, Then les animations non essentielles sont désactivées ou atténuées.
6. Given toutes les pages clés (Home, Speakers, Schedule, Sponsors, CFP, Team, Location), When on contrôle l’UI, Then la typographie, les espacements, la palette, l’iconographie et les composants CTA respectent le même système visuel (états hover/focus actifs, contrastes AA).

### Edge Cases

-   Navigation lente (3G simulée) : pas d’animations bloquantes ou lourdes au-dessus de la ligne de flottaison.
-   Préférence d’accessibilité « prefers-reduced-motion » : animations réduites.
-   Contrastes en dark backgrounds/dégradés : lisibilité et focus visibles.
-   Traductions et textes longs : CTA et titres ne débordent pas, restent lisibles.
-   [NEEDS CLARIFICATION: Cible design tokens existants (taille police, rampes d’espacement, couleurs, radius) et périmètre exact de normalisation à appliquer?]

## Requirements (mandatory)

### Functional Requirements

-   FR-001: L’UI MUST être harmonisée sur toutes les pages clés (Home, Speakers, Schedule, Sponsors, CFP, Team, Location) en typographie, espacement, palette, iconographie et composants.
-   FR-002: Les CTA primaires MUST être mis en avant dans le premier viewport sur Home, Sponsors, CFP (si ouvert), Team/Location (early CTA), avec hiérarchie visuelle claire et états hover/focus.
-   FR-003: Les messages clés MUST être rendus scannables (titres/bullets courts, sous-titres utiles) sans modifier la ligne éditoriale.
-   FR-004: Les animations MUST servir la compréhension (micro‑interactions, entrées douces), ne pas gêner la lecture ni retarder l’interaction; durée typique ≤ 300ms et facilité standard.
-   FR-005: MUST respecter prefers-reduced-motion: animations non essentielles désactivées ou fortement atténuées pour ces utilisateurs.
-   FR-006: MUST garantir l’accessibilité AA pour textes/CTA sur tous les fonds utilisés (y compris dégradés et overlays).
-   FR-007: MUST assurer la cohérence des composants CTA (tailles, variantes primaire/secondaire/tertiary, icônes, labels) sur l’ensemble du site.
-   FR-008: MUST clarifier et stabiliser la hiérarchie des contenus (H1/H2, partiels, cards), éviter doublons et collisions visuelles.
-   FR-009: MUST conserver ou améliorer les scores Lighthouse a11y/SEO/perf obtenus récemment; aucune régression > 2 points par catégorie.
-   FR-010: MUST documenter les décisions d’UI (mini guide de cohérence: couleurs, tailles, espaces, CTA states, micro‑interactions cibles).
-   FR-011: [NEEDS CLARIFICATION: Étendue des animations à (re)penser: quels modules précis doivent bouger/respirer? seuil d’usage?]
-   FR-012: [NEEDS CLARIFICATION: Pages ou blocs exclus de la passe? priorités business par page?]

### Key Entities (conceptuelles)

-   Page: surface avec un objectif (conversion, information, preuve sociale).
-   CTA: action cible prioritaire/secondaire avec états (default/hover/active/focus/disabled) et variantes.
-   Composant UI: bloc réutilisable (card, badge, section header) soumis aux règles d’harmonie.

---

## Clarifications (à résoudre avant /plan)

1. Priorisation des pages/blocs (ordre d’intervention exact).
2. Politique d’animations: intensité, familles autorisées, seuil d’apparition (scroll/hover/in-view).
3. Tokens design de référence: typographies (tailles/hauteurs), rampes d’espacement, palette (états), radius, ombres.
4. KPI de succès chiffrés: visibilité CTA (% above-the-fold), taux de clic sur CTA clés, scores Lighthouse cibles.
5. Contraintes branding (logo/mascotte/illustrations) et ton rédactionnel.

---

## Review & Acceptance Checklist

### Content Quality

-   [ ] No implementation details (languages, frameworks, APIs)
-   [ ] Focused on user value and business needs
-   [ ] Written for non-technical stakeholders
-   [ ] All mandatory sections completed

### Requirement Completeness

-   [ ] No [NEEDS CLARIFICATION] markers remain
-   [ ] Requirements are testable and unambiguous
-   [ ] Success criteria are measurable
-   [ ] Scope is clearly bounded
-   [ ] Dependencies and assumptions identified

---

## Execution Status

-   [ ] User description parsed
-   [ ] Key concepts extracted
-   [ ] Ambiguities marked
-   [ ] User scenarios defined
-   [ ] Requirements generated
-   [ ] Entities identified
-   [ ] Review checklist passed
