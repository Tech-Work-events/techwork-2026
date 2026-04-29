---
id: TASK-001
title: Afficher les partenaires non-payants (community + animation J-jour)
status: To Do
assignee:
    - mderoullers
created_date: '2026-04-29 07:55'
labels:
    - feature
dependencies: []
references:
    - projects/tech-work-2026/needs/community-and-animation-partners.md
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Spec complète : `projects/tech-work-2026/needs/community-and-animation-partners.md` dans le vault llm-second-brain.

## Comportement attendu

Le site techwork.events doit afficher les partenaires non-payants (Yeeso + animation J-jour : Domaine des Braves, Viegne, Atelier Minuit 81) avec une hiérarchie visuelle préservant la valeur des sponsors payants. Maintenance via un seul fichier JSON.

## User Stories

-   **US-1 (P1)** : En tant que visiteur, je veux voir les partenaires associatifs (Yeeso) à côté des community partners actuels, afin de comprendre l'écosystème de valeurs.
-   **US-2 (P1)** : En tant que visiteur, je veux voir les acteurs animation J-jour (Domaine des Braves, Viegne, Atelier Minuit 81) avec leur lien web/Instagram, afin de soutenir les artisans locaux.
-   **US-3 (P1)** : En tant que sponsor payant, je veux que ma visibilité reste supérieure aux partenaires non-payants, afin de préserver la valeur perçue de mon investissement.
-   **US-4 (P2)** : En tant que mainteneur du site, je veux ajouter un nouveau partenaire en éditant un seul JSON, afin de ne pas toucher au code Astro.

## Contraintes métier

-   Hiérarchie visuelle sponsors > non-payants (taille logo ≤ X / 1.5)
-   partners.json = single source of truth (aucun composant ne hardcode un nom)
-   Atelier Minuit 81 : pas de site web, Instagram = canal principal
-   Yeeso : tagline officielle "L'avenir de l'IT avec les femmes"

## Décisions à trancher au /blueprint

1. Schéma `partners.json` : Option A (clés séparées `communityPartners` / `animationPartners`) vs Option B (liste unique `partners[].type`)
2. Page d'affichage : `/partenaires` section dédiée vs bandeau home vs nouvelle `/animations`
3. Logos à collecter (Domaine des Braves, Viegne) + recadrage Atelier Minuit 81
4. Schéma social : étendre à `social: { type, url }` ou ajouter `instagram` à côté de `linkedin`

## Historique

-   2026-04-28 : need spécifié dans le vault, statut ready-to-dev
-   2026-04-28 : créé en VK MDE-2 (id 42fb2077-0aea-47af-ae7f-f391ed7a1b17)
-   2026-04-29 : VK Cloud sunset → migration vers Backlog.md (cette task remplace MDE-2)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

-   [ ] #1 Yeeso est affiché à côté des community partners (Café DevOps, CARA, SoCraTes FR, GenAI France) sur la page partenaires
-   [ ] #2 Une section dédiée 'Animations & Artisans' (ou équivalent) liste Domaine des Braves, Viegne, Atelier Minuit 81 visuellement distincte des sponsors
-   [ ] #3 Atelier Minuit 81 affiche le lien Instagram (pas de LinkedIn affiché car non pertinent)
-   [ ] #4 Hiérarchie visuelle : taille logo non-payants ≤ taille logo sponsors / 1.5
-   [ ] #5 Ajouter un nouveau partenaire = éditer partners.json uniquement, sans toucher au code Astro
-   [ ] #6 Tests BDD Cucumber écrits (5 scenarios)
-   [ ] #7 Tests d'archi : aucun composant ne hardcode un nom de partenaire
-   [ ] #8 Tests E2E Playwright : page /partenaires rendue, logos cliquables
<!-- AC:END -->
