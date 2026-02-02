Effectue une vérification complète avant déploiement.

Exécuter les vérifications suivantes dans l'ordre :

### 1. Validation du build

-   Exécuter `npm run build` et vérifier l'absence d'erreurs (astro check + astro build)
-   Compter les pages HTML générées dans `dist/`

### 2. Validation des fichiers de configuration JSON

-   Vérifier que tous les fichiers dans `src/config/` sont des JSON valides :
    -   `event.json` : sections event, organization, branding
    -   `tickets.json` : tableau de billets
    -   `cfp.json` : sections event, cfp, formats, topics
    -   `team.json` : tableau de membres
    -   `menu.json` : tableau d'entrées de menu
    -   `social.json` : sections networks, contact, hashtags
    -   `services.json` : sections ticketing, cfp, streaming, sponsors, newsletter
-   Vérifier que les URLs dans les fichiers JSON sont valides (pas de liens cassés évidents)

### 3. Validation des images

-   Vérifier que les images référencées dans `src/config/team.json` existent dans `public/`
-   Vérifier que le favicon et les assets de base existent dans `public/`

### 4. Validation de la configuration Astro

-   Vérifier que `astro.config.mjs` est valide (pas d'erreur de syntaxe)
-   Vérifier que les variables d'environnement requises sont documentées

### 5. Validation de l'API OpenPlanner

-   Lire l'URL de l'API depuis `src/config/services.json`
-   Tester la connectivité avec un `curl -s` et vérifier que le JSON retourné est valide
-   Signaler si l'API est indisponible (le build continuera mais les pages dynamiques seront vides)

### 6. Validation des tests

-   Exécuter `npm test` si des tests existent
-   Signaler les tests en échec

### 7. Résumé

Produire un rapport synthétique avec statut par vérification (OK / WARNING / ERROR) et les actions correctives si nécessaire.
