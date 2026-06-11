# QR + lien de feedback OpenFeedback — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher un QR code + un lien vers la page de feedback OpenFeedback du talk, sur la page détail d'une session ayant au moins un orateur.

**Architecture:** Une fonction pure (`src/data/openfeedback.ts`) construit l'URL `https://openfeedback.io/{eventId}/{date}/{sessionId}` (ou `null` sans orateur). Un composant Astro (`SessionFeedback.astro`) génère le QR en SVG **au build** et affiche le bloc. La page détail (`[...slug].astro`) calcule l'URL depuis ses props et rend le composant conditionnellement.

**Tech Stack:** Astro 5 (SSG), TypeScript, Tailwind 3.4, Vitest, lib `qrcode` (génération SVG au build).

---

## File Structure

- **Create** `src/data/openfeedback.ts` — constante `OPENFEEDBACK_EVENT_ID` + `getFeedbackUrl()` (logique pure, testable).
- **Create** `src/components/schedule/SessionFeedback.astro` — génère le QR SVG au build et rend la section « Donnez votre avis ».
- **Create** `tests/unit/openfeedback.test.ts` — tests de `getFeedbackUrl`.
- **Modify** `src/pages/sessions/[...slug].astro` — import du helper + composant, ajout de `id` au destructure, rendu conditionnel.
- **Modify** `package.json` / `package-lock.json` — ajout de `qrcode` + `@types/qrcode` en devDependencies (la CI fait `npm ci` complet).

---

## Task 1: Ajouter la dépendance de génération de QR

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Installer qrcode + types en devDependencies**

```bash
npm install -D qrcode @types/qrcode
```

- [ ] **Step 2: Vérifier l'ajout**

Run: `node -e "require('qrcode'); console.log('qrcode ok', require('qrcode/package.json').version)"`
Expected: `qrcode ok <version>` (pas d'erreur de module introuvable)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add qrcode for build-time QR generation"
```

---

## Task 2: Helper d'URL de feedback (TDD)

**Files:**
- Create: `src/data/openfeedback.ts`
- Test: `tests/unit/openfeedback.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

`tests/unit/openfeedback.test.ts` :

```ts
import { describe, it, expect } from 'vitest'
import { getFeedbackUrl, OPENFEEDBACK_EVENT_ID } from '../../src/data/openfeedback'

describe('getFeedbackUrl', () => {
    it('construit l’URL OpenFeedback du talk (eventId, date, sessionId)', () => {
        const url = getFeedbackUrl({
            sessionId: 'abc123',
            dateStart: '2026-06-18T16:00:00.000',
            hasSpeakers: true,
        })
        expect(url).toBe(`https://openfeedback.io/${OPENFEEDBACK_EVENT_ID}/2026-06-18/abc123`)
    })

    it('dérive la date (YYYY-MM-DD) depuis le timestamp de début', () => {
        const url = getFeedbackUrl({
            sessionId: 'x',
            dateStart: '2026-06-19T09:30:00.000',
            hasSpeakers: true,
        })
        expect(url).toContain('/2026-06-19/')
    })

    it('retourne null pour une session sans orateur (pause / logistique)', () => {
        const url = getFeedbackUrl({
            sessionId: 'pause-1',
            dateStart: '2026-06-18T12:00:00.000',
            hasSpeakers: false,
        })
        expect(url).toBeNull()
    })

    it('retourne null si dateStart est vide', () => {
        const url = getFeedbackUrl({ sessionId: 'x', dateStart: '', hasSpeakers: true })
        expect(url).toBeNull()
    })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

Run: `npm test -- openfeedback`
Expected: FAIL — `Failed to resolve import "../../src/data/openfeedback"` (le module n'existe pas encore)

- [ ] **Step 3: Implémenter le helper minimal**

`src/data/openfeedback.ts` :

```ts
// Identifiant de l'évènement OpenFeedback de Tech'Work — public et stable.
// À modifier ici si l'évènement est recréé. Sert à construire les URLs de
// feedback par talk : https://openfeedback.io/{eventId}/{date}/{sessionId}
export const OPENFEEDBACK_EVENT_ID = 'BR8HzqCDbXYeLhhvcLNk'

const OPENFEEDBACK_BASE_URL = 'https://openfeedback.io'

interface FeedbackUrlInput {
    sessionId: string
    // Timestamp de début en heure locale naïve (conference-hall.ts a déjà
    // retiré le fuseau via fixTimestamp), ex. "2026-06-18T16:00:00.000".
    dateStart: string
    hasSpeakers: boolean
}

// Construit l'URL publique de feedback OpenFeedback d'un talk.
// Retourne null pour les créneaux sans orateur (pauses, logistique) : ils sont
// masqués du feedback, comme dans public/openfeedback.json (hideInFeedback).
export function getFeedbackUrl({ sessionId, dateStart, hasSpeakers }: FeedbackUrlInput): string | null {
    if (!hasSpeakers || !dateStart) return null
    const date = dateStart.slice(0, 10)
    return `${OPENFEEDBACK_BASE_URL}/${OPENFEEDBACK_EVENT_ID}/${date}/${sessionId}`
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu'il passe**

Run: `npm test -- openfeedback`
Expected: PASS (4 tests verts)

- [ ] **Step 5: Commit**

```bash
git add src/data/openfeedback.ts tests/unit/openfeedback.test.ts
git commit -m "feat(openfeedback): add getFeedbackUrl helper"
```

---

## Task 3: Composant SessionFeedback (QR SVG + lien)

**Files:**
- Create: `src/components/schedule/SessionFeedback.astro`

- [ ] **Step 1: Créer le composant**

`src/components/schedule/SessionFeedback.astro` :

```astro
---
import QRCode from 'qrcode'

interface Props {
    url: string
}

const { url } = Astro.props

// QR généré en SVG inline AU BUILD : aucun JS client, aucun appel réseau au
// runtime. Si l'URL est invalide, le build échoue franchement (pas de fallback).
const qrSvg = await QRCode.toString(url, { type: 'svg', margin: 1, width: 200 })
---

<div class="px-6 sm:px-8 py-8 border-t border-gray-100">
    <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Donnez votre avis</h2>
    <div class="flex flex-col sm:flex-row items-center gap-6">
        <div
            class="w-44 h-44 flex-shrink-0 rounded-xl bg-white p-2 ring-1 ring-gray-100 [&>svg]:h-full [&>svg]:w-full"
            set:html={qrSvg}
            aria-hidden="true">
        </div>
        <div class="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <p class="text-gray-700">
                Scannez le QR code ou cliquez pour partager votre retour sur ce talk via OpenFeedback.
            </p>
            <a href={url} target="_blank" rel="noopener noreferrer" class="btn btn-primary"> Donner mon avis </a>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-gray-400 break-all hover:text-primary-600">
                {url}
            </a>
        </div>
    </div>
</div>
```

- [ ] **Step 2: Vérifier que le composant compile (type-check)**

Run: `npx astro check`
Expected: 0 error (le composant est valide ; `QRCode.toString` est typé via `@types/qrcode`)

- [ ] **Step 3: Commit**

```bash
git add src/components/schedule/SessionFeedback.astro
git commit -m "feat(openfeedback): add SessionFeedback QR component"
```

---

## Task 4: Brancher dans la page détail du talk

**Files:**
- Modify: `src/pages/sessions/[...slug].astro`

- [ ] **Step 1: Ajouter les imports**

Dans le frontmatter, après l'import `getScheduleData` (ligne ~5), ajouter :

```astro
import { getFeedbackUrl } from '../../data/openfeedback'
import SessionFeedback from '../../components/schedule/SessionFeedback.astro'
```

- [ ] **Step 2: Ajouter `id` au destructure des props et calculer l'URL**

Remplacer le début du bloc de destructure :

```astro
const {
    title,
    track,
```

par :

```astro
const {
    id,
    title,
    track,
```

Puis, juste après la ligne `const levelInfo = ...` (fin du frontmatter), ajouter :

```astro
const feedbackUrl = getFeedbackUrl({ sessionId: id, dateStart, hasSpeakers: speakers.length > 0 })
```

- [ ] **Step 3: Rendre le composant dans la carte, après la Description**

Dans le `<div class="bg-white rounded-2xl ...">`, juste après le bloc `{ abstract && ( ... ) }` (et avant le `</div>` qui ferme la carte), ajouter :

```astro
{feedbackUrl && <SessionFeedback url={feedbackUrl} />}
```

- [ ] **Step 4: Type-check**

Run: `npx astro check`
Expected: 0 error

- [ ] **Step 5: Commit**

```bash
git add src/pages/sessions/'[...slug].astro'
git commit -m "feat(openfeedback): show feedback QR on talk detail pages"
```

---

## Task 5: Vérification build complet + QR rendu

**Files:** aucun (vérification)

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: `astro check` 0 error, build OK, pages `sessions/<id>` générées.

- [ ] **Step 2: Vérifier qu'un talk a un SVG QR inline et le lien OpenFeedback**

Run :
```bash
node -e '
const fs=require("fs"),p=require("path");
const dir="dist/sessions";
const slug=fs.readdirSync(dir).find(d=>fs.existsSync(p.join(dir,d,"index.html")));
const html=fs.readFileSync(p.join(dir,slug,"index.html"),"utf8");
console.log("slug:", slug);
console.log("Donnez votre avis présent:", html.includes("Donnez votre avis"));
console.log("SVG QR inline:", /<svg[^>]*>/.test(html) && html.includes("Donnez votre avis"));
console.log("lien openfeedback:", html.includes("https://openfeedback.io/BR8HzqCDbXYeLhhvcLNk/"));
'
```
Expected : `Donnez votre avis présent: true`, `SVG QR inline: true`, `lien openfeedback: true`.

- [ ] **Step 3: Vérifier qu'un créneau sans orateur n'a PAS le bloc**

Run :
```bash
node -e '
const fs=require("fs"),p=require("path");
const of=JSON.parse(fs.readFileSync("public/openfeedback.json","utf8"));
const hidden=Object.keys(of.sessions).find(id=>of.sessions[id].hideInFeedback);
const f=p.join("dist/sessions",hidden,"index.html");
if(!fs.existsSync(f)){console.log("page créneau masqué non générée (ok si pas de page):",hidden);process.exit(0)}
const html=fs.readFileSync(f,"utf8");
console.log("créneau masqué", hidden, "→ bloc feedback absent:", !html.includes("Donnez votre avis"));
'
```
Expected : `→ bloc feedback absent: true`.

- [ ] **Step 4: Lancer toute la suite de tests**

Run: `npm test`
Expected: tous les tests passent (dont les 4 de `getFeedbackUrl`).

---

## Self-review (rempli à l'écriture du plan)

- **Couverture spec** : FR1 → Task 3+4 ; FR2 (null sans orateur) → Task 2 (helper) + Task 4 (rendu conditionnel) + Task 5 step 3 ; FR3 (QR encode l'URL, lien `_blank`/`noopener`) → Task 3 ; FR4 (URL en texte) → Task 3. NFR1 (SVG build, pas de JS client) → Task 3 + Task 5 step 2 ; NFR2 (build casse si QR échoue) → Task 3 (`await` sans try/catch) ; NFR3 (style aligné) → Task 3 classes ; NFR4 (eventId constante) → Task 2.
- **Placeholders** : aucun — tout le code est fourni.
- **Cohérence des types** : `getFeedbackUrl({ sessionId, dateStart, hasSpeakers })` identique entre Task 2 (def), Task 4 (appel) et les tests ; `SessionFeedback` prop `url: string` identique entre Task 3 (def) et Task 4 (usage).
