# STHECROH — Checklist de test complète

Coche au fur et à mesure. Pour chaque échec, note : l'URL, le compte utilisé, et le message
d'erreur exact (écran + terminal si possible) — ça permet de corriger vite plutôt que de deviner.

## 0. Environnement (préalable)

- [ ] Docker Desktop lancé + `docker compose up -d` depuis la racine → `docker ps` montre
      `sthecroh-postgres-1` et `sthecroh-redis-1` tous les deux "Up"
- [ ] `apps/api` : `.env` copié depuis `.env.example`, `npm install`, `npx prisma migrate dev`,
      `npm run prisma:seed`, puis `npm run start:dev` → message "STHECROH API démarrée sur le port 4000"
- [ ] `apps/web` : `.env.local` copié depuis `.env.local.example`, `npm install`, `npm run dev`
      → "Ready" sur le port 3000

## 1. Page d'accueil (visiteur non connecté)

- [ ] `localhost:3000` charge sans erreur, design fidèle (couleurs royal/or, typographie)
- [ ] Menu burger fonctionne en réduisant la fenêtre (mobile)
- [ ] Bascule thème clair/sombre (icône lune/soleil)
- [ ] Section Cours affiche les vrais cours du seed (Théologie systématique I, Herméneutique
      biblique, Histoire de l'Église, Grec biblique)
- [ ] Section Enseignants affiche les 4 enseignants du seed avec leur titre
- [ ] Bandeau statistiques affiche des nombres réels (pas 3482/128 fixes)
- [ ] Section Certificats : taper `STH-2026-0001` → affiche "Certificat vérifié" avec de vraies
      données (Emmanuel Mbeki)
- [ ] Formulaire de contact : envoi → toast de confirmation (vérifiable ensuite dans
      `/admin` → Messages de contact)
- [ ] Section Dons : remplir montant + e-mail → clic "Faire un don" → redirection vers Stripe
      (nécessite `STRIPE_SECRET_KEY` configurée, sinon message d'erreur clair attendu)

## 2. Inscription / Connexion

- [ ] Créer un nouveau compte étudiant depuis le modal "Créer un compte" → redirection automatique
      vers `/dashboard/student`
- [ ] Vérifier dans le terminal API : soit un e-mail part (si `RESEND_API_KEY` configurée), soit un
      avertissement de log clair sinon
- [ ] Se déconnecter, se reconnecter avec `emmanuel.mbeki@sthecroh.edu` / `Etudiant#2026`
- [ ] Tenter une mauvaise combinaison e-mail/mot de passe → message d'erreur clair (pas générique)

## 3. Espace étudiant (`emmanuel.mbeki@sthecroh.edu`)

- [ ] `/dashboard/student` : KPIs réels (2 cours, progression, certificats)
- [ ] Clic sur un cours dans "Mes cours" → page de contenu réelle avec modules/leçons
- [ ] Marquer une leçon "terminée" → la progression du cours augmente
- [ ] Onglet "Mes notes" → relevé de notes réel
- [ ] Onglet "Paiements" → historique + bouton "Payer" (redirige vers Stripe)
- [ ] Onglet "Certificats" → télécharger le PDF → QR code visible dans le fichier
- [ ] Onglet "Messagerie" → envoyer un message à Dr. Samuel Diarra
- [ ] Onglet "Bibliothèque" → parcourir/filtrer les 3 ouvrages du seed
- [ ] Cloche de notifications → badge apparaît après une note publiée ou un message reçu
- [ ] "Prochaines échéances" → passer le quiz "Fondements de la théologie systématique" →
      note affichée immédiatement, visible ensuite dans "Mes notes"
- [ ] Si une session en direct existe et n'est pas encore passée → bouton "Rejoindre" fonctionne
      (intégré sur la page, pas de nouvel onglet)

## 4. Espace enseignant (`samuel.diarra@sthecroh.edu` / `Enseignant#2026`)

- [ ] `/dashboard/teacher` : KPIs réels, panneau "Sessions en direct" si applicable
- [ ] "Mes cours" → créer un nouveau cours (brouillon)
- [ ] Dans "Gérer le contenu" : ajouter un module, une leçon (vidéo/PDF), un examen avec questions
      QCM/vrai-faux
- [ ] Publier le cours → vérifier qu'il apparaît sur la page d'accueil publique
- [ ] Un étudiant s'inscrit à ce cours → il apparaît dans "Mes cours" de l'enseignant
- [ ] Copie remise par un étudiant → apparaît dans "Copies à corriger" → noter → l'étudiant voit
      la note immédiatement

## 5. Administration (`admin@sthecroh.edu` / `Admin#2026`)

- [ ] `/admin` → formulaire de connexion propre à cette page (pas de redirection vers l'accueil)
- [ ] Chaque onglet (Témoignages, Événements, Galerie, FAQ, Actualités, Historique, Départements,
      Programmes, Cours, Bibliothèque) : ajouter / modifier / supprimer un élément → se reflète sur
      la page d'accueil
- [ ] Onglet Utilisateurs : changer le rôle/statut d'un compte
- [ ] Onglet Messages de contact : marquer traité, supprimer

## 6. Vérification publique (sans connexion)

- [ ] Scanner le QR code d'un certificat téléchargé (ou ouvrir son URL) →
      `/verification/certificat/[token]` affiche les vraies infos, sans connexion requise
- [ ] Tester avec un identifiant inexistant → message "Introuvable" propre

## 7. SEO

- [ ] `localhost:3000/robots.txt` → règles visibles, `/dashboard` et `/admin` interdits
- [ ] `localhost:3000/sitemap.xml` → contient l'accueil
- [ ] Partager le lien de l'accueil sur WhatsApp/Slack (ou utiliser un outil de preview OG en ligne)
      → image et description s'affichent correctement

## 8. Cas limites à ne pas négliger

- [ ] Se connecter sur deux comptes différents dans deux navigateurs (ou navigation privée) en
      simultané → pas de mélange de session
- [ ] Rafraîchir une page du dashboard (F5) → reste connecté (le token survit au rechargement)
- [ ] Tenter d'accéder à `/dashboard/teacher` en étant connecté comme étudiant → message
      "Accès réservé" (pas de plantage)
- [ ] Tenter d'accéder à `/admin` sans être connecté → formulaire de connexion (pas de 404 ni crash)
