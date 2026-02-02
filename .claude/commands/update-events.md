Met à jour les événements depuis l'API Luma.

Note : les données OpenPlanner (speakers, sessions, sponsors) sont fetchées au runtime dans les pages Astro, pas au build time. Cette commande vérifie uniquement la disponibilité et le contenu de l'API.

Étapes :

1. Lire l'URL de l'API OpenPlanner depuis `src/config/services.json` (champ `sponsors.api.endpoint`)
2. Fetcher les données depuis l'API : `curl -s <OPENPLANNER_URL>`
3. Analyser et afficher un résumé lisible :
    - Nombre de speakers
    - Nombre de sessions (talks, lightning, workshops)
    - Nombre de sponsors par catégorie
    - Nombre de tracks/salles
4. Si erreur (timeout, 404, JSON invalide), expliquer le problème et vérifier :
    - Connectivité réseau
    - Validité de l'URL API dans `src/config/services.json`
    - Format de réponse de l'API OpenPlanner
5. Vérifier que la variable `OPENPLANNER_URL` dans `.env` pointe bien vers la même API

Note : Un rebuild du site n'est pas nécessaire pour les données OpenPlanner car elles sont fetchées côté serveur à chaque requête. Pour forcer un refresh en production, déclencher un redéploiement via `gh workflow run deploy-on-merge.yml`.
