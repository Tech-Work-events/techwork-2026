Exécute un build complet du site Astro et vérifie qu'il n'y a aucune erreur.

Étapes :

1. Exécuter `npm run build` (qui lance `astro check` puis `astro build`)
2. Analyser la sortie pour détecter :
    - Erreurs TypeScript (types manquants, imports cassés)
    - Erreurs Astro (composants manquants, props invalides)
    - Warnings importants (deprecated features, images manquantes)
    - Erreurs de fetch OpenPlanner (API indisponible)
3. Vérifier que le dossier `dist/` a été généré correctement
4. Lister les pages générées avec `find dist/ -name "*.html" | sort`
5. Résumer le résultat : succès/échec, nombre de pages, taille du build, warnings éventuels

Si le build échoue, analyser l'erreur en détail et proposer un correctif.
