# Quickstart — UI Harmonisation Feature

This quickstart outlines how to run local previews and audits to validate the UI harmonisation without touching implementation details.

## Prerequisites

-   Node 18+
-   Project deps installed (npm ci)

## Local Preview

```
npm run dev
```

Visit http://localhost:4321 and navigate key pages (Home, Sponsors, CFP, Team, Location, Speakers, Schedule).

## Static Build + Preview

```
npm run build
npm run preview
```

## Lighthouse (local, static dist)

Run a quick audit on the built site:

```
npm run build
npx -y @lhci/cli autorun --collect.staticDistDir=dist --upload.target=temporary-public-storage
```

Open the printed report links. Ensure no category regresses by > 2 points.

## Reviewer Checklist (visual)

-   CTA primaire visible au-dessus de la ligne de flottaison (pages cls)
-   Titres/subtitles courts et scannables; bullets concis
-   Focus visibles; alt cohrents; textes lisibles sur fonds dgrdgs
-   Animations discrtes (opacity/translate), dsactives si prefers-reduced-motion

-   Vérifier aussi en mode `prefers-reduced-motion` (simulateur navigateur) que les animations non essentielles sont désactivées.

## Success Criteria

-   Harmonisation perue (typographie, espaces, palette)
-   Mise en avant CTA conforme au spec
-   Lighthouse: pas de rgression (> 2 points) et idalement meilleure Perf mobile (LCP plus bas)
