Exécute le workflow de développement complet : issue -> worktree -> branche -> dev -> commit -> push -> PR.

Ce workflow est OBLIGATOIRE pour tout changement de code. Il doit être suivi à la lettre.

---

## Paramètre attendu : $ARGUMENTS

Description de la tâche à réaliser (ex: "Ajouter une section sponsors à la page d'accueil").

---

## Étape 1 : Analyse et planification

1. Analyser la demande pour déterminer :
    - Le **type** : `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `ci`
    - Le **label GitHub** approprié : `enhancement`, `bug`, `documentation`
    - Un **titre concis** en anglais pour l'issue et la branche
    - Le **scope des fichiers** impactés
2. Lire les fichiers concernés pour comprendre l'état actuel

## Étape 2 : Créer l'issue GitHub

```bash
gh issue create \
  --title "<type>: <description en anglais>" \
  --body "<description détaillée en français du changement à effectuer, contexte, critères d'acceptance>" \
  --label "<label>"
```

Récupérer le numéro de l'issue :

```bash
gh issue list --limit 1 --json number -q '.[0].number'
```

## Étape 3 : Créer le worktree et la branche

```bash
# S'assurer que main est à jour
git fetch origin main

# Créer le worktree
git worktree add ../.worktrees/<type>/<issue-number>-<slug> -b <type>/<issue-number>-<slug> origin/main
```

Convention branche : `<type>/<issue-number>-<slug-kebab-case>`
Exemples : `feat/42-add-sponsors`, `fix/15-broken-hero`, `docs/8-update-cfp`

## Étape 4 : Préparer le worktree

```bash
cd ../.worktrees/<type>/<issue-number>-<slug>
npm ci
```

Copier le fichier `.env` depuis le projet principal si nécessaire :

```bash
cp <chemin-projet-principal>/.env .env
```

Vérifier que le build initial passe :

```bash
npm run build
```

## Étape 5 : Développer

Effectuer les modifications demandées dans le worktree.

Règles :

-   Travailler UNIQUEMENT dans le répertoire du worktree
-   Respecter les conventions du projet :
    -   Composants Astro dans `src/components/`
    -   Pages dans `src/pages/`
    -   Configuration dans `src/config/*.json`
    -   Contenu blog dans `src/content/blog/`
-   TypeScript strict (pas de `any`)
-   Préserver l'accessibilité (attributs ARIA, contraste, labels)
-   Vérifier le build après chaque modification significative

## Étape 6 : Valider le build

```bash
npm run build
```

Le build DOIT passer sans erreur avant de continuer.

## Étape 7 : Commit

```bash
git add <fichiers spécifiques modifiés>
git commit -m "$(cat <<'EOF'
<type>: <description concise>

<description détaillée si nécessaire>

Refs #<issue-number>
EOF
)"
```

Règles :

-   Ajouter les fichiers spécifiquement (pas de `git add .` ou `git add -A`)
-   Ne pas inclure de fichiers générés (`dist/`, `.astro/`, `.env`)
-   Conventional Commits obligatoire
-   Référencer l'issue avec `Refs #<number>`

## Étape 8 : Push

```bash
git push -u origin <branch-name>
```

## Étape 9 : Créer la PR

```bash
gh pr create \
  --title "<type>: <description>" \
  --body "$(cat <<'EOF'
## Summary
<1-3 bullet points décrivant les changements>

## Changes
<liste détaillée des fichiers modifiés et pourquoi>

## Test plan
- [ ] Build Astro réussi (`npm run build`)
- [ ] Vérification visuelle en local
- [ ] Mobile responsive vérifié (si applicable)
- [ ] Accessibilité préservée (si applicable)

Closes #<issue-number>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

IMPORTANT : Utiliser `Closes #<issue-number>` (pas `Refs`) pour que l'issue soit automatiquement fermée au merge.

## Étape 10 : Rapport final

Afficher un résumé :

-   URL de l'issue créée
-   URL de la PR créée
-   Branche : `<branch-name>`
-   Worktree : `../.worktrees/<branch-name>`
-   Fichiers modifiés
-   Status du build

Rappeler que le worktree peut être nettoyé après merge avec `/cleanup-worktree`.
