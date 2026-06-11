# Spec 008 — QR code + lien de feedback OpenFeedback dans le détail des talks

- **Date** : 2026-06-11
- **Statut** : validé (design), prêt pour implémentation
- **Dépend de** : intégration OpenFeedback étape 1 (feed `/openfeedback.json`, PR #103)

## Contexte

L'agenda Tech'Work est alimenté par ConferenceHall (`src/data/schedule.json` →
`src/data/conference-hall.ts`). L'étape 1 expose un feed `public/openfeedback.json`
consommé par OpenFeedback (`https://openfeedback.io`) pour collecter le feedback
des talks. L'évènement OpenFeedback existe : `eventId = BR8HzqCDbXYeLhhvcLNk`.

Cette étape 2 ajoute, sur la **page de détail d'un talk**
(`src/pages/sessions/[...slug].astro`), un **QR code** et un **lien cliquable**
menant à la page de feedback OpenFeedback **du talk concerné**, pour que les
participants puissent donner leur avis facilement (scan en fin de session ou clic).

## Format de l'URL de feedback (confirmé par le code source OpenFeedback)

Routing public OpenFeedback (`src/App.jsx` → `/:projectId/*`, puis
`src/feedback/FeedbackApp.jsx` → `/:date/:talkId`) :

```
https://openfeedback.io/{eventId}/{date}/{talkId}
```

- `{eventId}` = `BR8HzqCDbXYeLhhvcLNk`
- `{date}` = jour du talk au format `YYYY-MM-DD`, dérivé du `start` de la session
- `{talkId}` = `id` de la session (identique à la clé de `openfeedback.json`)

Exemple :
`https://openfeedback.io/BR8HzqCDbXYeLhhvcLNk/2026-06-18/cmmt4f37m05p301nvcg23xauv`

Note fuseau : `conference-hall.ts` applique `fixTimestamp()` qui retire le suffixe
de fuseau, donc `dateStart` est une heure locale naïve (`2026-06-18T16:00:00.000`).
`dateStart.slice(0, 10)` donne donc la bonne date sans décalage UTC.

## Exigences fonctionnelles

1. **FR1** — Sur la page détail d'un talk **ayant au moins un orateur**, afficher
   une section « Donnez votre avis » contenant un QR code et un lien vers l'URL de
   feedback OpenFeedback du talk.
2. **FR2** — Sur les créneaux **sans orateur** (pauses, accueil, logistique — les
   créneaux marqués `hideInFeedback` dans le feed), **ne rien afficher** (pas de
   section feedback). La règle d'éligibilité = « la session a au moins un orateur ».
3. **FR3** — Le QR encode exactement l'URL de feedback du talk. Le lien cliquable
   pointe vers la même URL, ouvre OpenFeedback dans un nouvel onglet
   (`target="_blank"`, `rel="noopener noreferrer"`).
4. **FR4** — L'URL est aussi affichée en texte (petit) pour saisie manuelle.

## Exigences non fonctionnelles

1. **NFR1** — Site statique : le QR est généré **au build** et inliné en **SVG**.
   Aucune dépendance réseau ni JS client au runtime (compatible Lighthouse CI).
2. **NFR2** — Si la génération du QR échoue pour une URL, le build doit **échouer
   franchement** (pas de fallback silencieux).
3. **NFR3** — Style cohérent avec les sections existantes de la carte détail
   (Speakers, Description) : titre `h2` uppercase tracking-wider, paddings
   `px-6 sm:px-8 py-8`.
4. **NFR4** — `eventId` centralisé dans une seule constante (public et stable),
   facilement remplaçable par une variable d'env si besoin futur.

## Périmètre

**Inclus** : helper d'URL, composant d'affichage QR + lien, intégration dans la
page détail, test unitaire de la logique d'URL, ajout de la dépendance de
génération de QR.

**Exclu (YAGNI)** : QR/lien sur les listes de programme (`DaySchedule`,
`SessionItem`), page speakers, gestion multi-évènements, configuration runtime de
l'eventId via UI.

## Critères d'acceptation

- Page détail d'un talk avec orateur → section feedback visible, QR scannable
  menant à `https://openfeedback.io/BR8HzqCDbXYeLhhvcLNk/2026-06-18/{id}`.
- Page détail d'un créneau sans orateur → aucune section feedback.
- `npm run build` (donc `astro check && astro build`) passe sans erreur de type.
- Test unitaire de `getFeedbackUrl` vert (format, dérivation de date, `null` sans
  orateur).
- Aucun appel réseau ajouté côté client ; le SVG du QR est inline dans le HTML.
```
