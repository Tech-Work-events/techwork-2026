Lance le serveur de développement Astro.

Étapes :

1. Vérifier que les dépendances npm sont installées (`node_modules/` existe), sinon exécuter `npm ci`
2. Vérifier qu'un fichier `.env` existe avec les variables d'environnement requises (OPENPLANNER*URL, FIREBASE*\*)
3. Lancer `npm run dev` en arrière-plan (serveur Astro avec hot reload)
4. Attendre que le serveur soit prêt (surveiller la sortie pour "http://localhost:4321")
5. Confirmer l'URL d'accès : http://localhost:4321/

Note : le serveur reste actif en arrière-plan. Utiliser le task ID pour vérifier les logs ou l'arrêter.
