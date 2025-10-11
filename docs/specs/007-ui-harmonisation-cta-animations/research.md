# Research: UI harmonisée + CTA + animations au service du contenu

## Objectives

-   Définir un système d’UI cohérent (typo, espacement, palette, CTA) sans sur-ingénierie
-   Politique d’animations au service du contenu + respects prefers-reduced-motion
-   Vérifier l’absence de régression Lighthouse (perf/a11y/SEO)

## Current Context (observations à valider)

-   Stack: Astro 5.x, TailwindCSS
-   Pages clés: Home, Speakers (+detail), Schedule, Sponsors, CFP, Team, Location
-   CTA déjà présents mais hétérogènes selon pages (labels/placements)
-   Animations existantes (gradients, parallax léger, floats) à cadrer (réduire sur mobile si besoin)

## Decisions (initiales, à confirmer)

-   Tokens légers (utiliser Tailwind + classes utilitaires) pour ne pas créer un design system lourd
-   CTA: 3 variantes (primaire, secondaire, tertiaire) + états (default/hover/focus/active/disabled), usage consistant
-   Motion policy: durées 150–300ms, easing standard, in-view léger (opacity/translate), pas de scale agressif; respect strict prefers-reduced-motion
-   Accessibilité: contrastes AA mini, focus visibles, alt textes pertinents (alt="" pour décoratifs)

## Alternatives considérées

-   Design system complet (tokens + theming étendu) → rejeté (sur-abstraction, délai)
-   Framework d’animations dédié → rejeté (coût/JS additionnel); préférer CSS/IntersectionObserver minimal si requis

## Open Questions

-   Priorisation business par page (quels CTA absolument au-dessus de la ligne de flottaison?)
-   Palette de référence à figer (nuances exactes pour badges/fonds dégradés)
-   Icônes standardisées (taille/épaisseur) et sets autorisés

## Next Steps

-   Valider priorités CTA avec stakeholders
-   Établir une matrice « page × CTA » et « page × animations autorisées »
-   Définir les tailles typographiques et rampes d’espacement cibles (mobile/desktop)
-   Lancer première passe d’harmonisation sur Home/Sponsors/CFP, puis les autres pages

## Baseline LHCI (2025-10-11 19:32)

-   404: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1760204130680-39775.report.html
-   Home (/index.html): https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1760204131528-28814.report.html
-   Home (/): https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1760204132429-48810.report.html

## Reduced Motion Policy (confirmed)

-   Respect strict de `prefers-reduced-motion`: animations non essentielles désactivées.
-   Les éléments décoratifs restent statiques; transitions raccourcies/simplifiées.
-   Les visuels LCP (hero) ne dépendent pas d’animations bloquantes.
