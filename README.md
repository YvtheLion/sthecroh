# STHECROH — Plateforme LMS

Monorepo : `apps/api` (NestJS + Prisma + PostgreSQL) et `apps/web` (Next.js). Utilise **npm** partout
(pas pnpm, pour éviter les conflits d'installation).

## Démarrer en local

```bash
docker compose up -d                    # Postgres + Redis (Docker Desktop doit être lancé)

cd apps/api
cp ../../.env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed                     # crée départements, cours, enseignant, étudiant, admin de démo
npm run start:dev                       # API sur :4000

# Dans un second terminal
cd apps/web
cp .env.local.example .env.local
npm install
npm run dev                             # Frontend sur :3000
```

**Comptes de démo créés par le seed** :
- Admin : `admin@sthecroh.edu` / `Admin#2026` → connexion directement sur `/admin`
- Enseignant : `samuel.diarra@sthecroh.edu` / `Enseignant#2026`
- Étudiant : `emmanuel.mbeki@sthecroh.edu` / `Etudiant#2026` (déjà inscrit à 2 cours, 1 certificat)

**⚠️ Nouvelle migration nécessaire** (champ de vérification d'e-mail ajouté au schéma) :
```bash
cd apps/api
npm install
npx prisma migrate dev --name email-verification
npm run prisma:seed
npm run start:dev
```

## État actuel

**Architecture** : le site vitrine (`/`) est une page publique unique pour convaincre un visiteur.
Une fois connecté, chaque rôle a sa propre page dédiée avec sa propre URL :
- `/dashboard` — redirige automatiquement vers le bon espace selon le rôle
- `/dashboard/student` — espace étudiant réel
- `/dashboard/teacher` — espace enseignant réel
- `/admin` — administration (déjà séparée)

Chaque page protégée affiche son propre formulaire de connexion si tu n'es pas encore authentifié —
aucune redirection croisée entre espaces.

**Fonctionnel de bout en bout :**
- **Authentification réelle** (inscription, connexion, JWT, 2FA, hash bcrypt) — chaque espace (page
  d'accueil, `/admin`) a son propre formulaire de connexion, pas de redirection entre les deux.
- **Espace étudiant** (`/dashboard/student`) : vrais cours inscrits, progression réelle, échéances
  réelles, bouton "Remettre" pour les devoirs, et chaque cours est cliquable vers une **vraie page de
  contenu** (`/dashboard/student/courses/[id]`) listant modules et leçons (vidéo/PDF), avec un bouton
  "Marquer comme terminée" qui recalcule la progression réelle du cours.
- **Espace enseignant** (`/dashboard/teacher`) : vrais cours enseignés, nombre réel d'étudiants, copies en attente de
  correction avec formulaire de notation — la note est immédiatement visible par l'étudiant concerné.
- **Paiements** (`/dashboard/student/payments`) : checkout Stripe réel pour les frais de scolarité,
  historique des paiements, récupération automatique du lien de reçu Stripe une fois le paiement
  confirmé (nécessite une vraie clé `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` dans `.env` pour
  fonctionner de bout en bout — sans clé configurée, le bouton "Payer" affichera une erreur claire).
- **Certificats & diplômes** (`/dashboard/student/certificates`) : génération de **vrais PDF**
  téléchargeables (mise en page soignée + QR code de vérification intégré), via `pdfkit` — plus un
  aperçu visuel statique. La vérification publique par QR code fonctionne déjà (`/verification/:token`).
- **Messagerie** (`/dashboard/student/messages` et `/dashboard/teacher/messages`) : un étudiant ne peut
  contacter que les enseignants de ses cours (et vice-versa), fil de discussion en temps réel au
  rechargement, indicateur de messages non lus.
- **Notifications réelles** : cloche avec compteur dans la barre du haut de chaque espace connecté,
  déclenchée automatiquement par 3 événements réels (note publiée, nouveau message reçu, paiement
  confirmé) — marquage lu au clic, actualisation automatique toutes les 30 secondes.
- **Examens/quiz interactifs** (`/dashboard/student/exams/[id]`) : QCM et vrai/faux avec **correction
  automatique côté serveur** (les bonnes réponses ne sont jamais envoyées au navigateur), note publiée
  instantanément dans "Mes notes". Les questions ouvertes sont mises de côté pour correction manuelle
  par l'enseignant. Un seul passage autorisé par examen.
- **Gestion de cours par l'enseignant** (`/dashboard/teacher/courses`) : un enseignant peut créer ses
  propres cours (brouillon → publié), ajouter des modules/leçons (vidéo/PDF), créer des examens/quiz
  avec un vrai éditeur de questions QCM/vrai-faux/ouvertes — sans passer par l'administration.
- **Upload réel de fichiers (Cloudinary)** : bouton "📎 Téléverser" pour l'enseignant (vidéo/PDF de
  leçon) et pour l'étudiant (pièce jointe de devoir) — nécessite un compte Cloudinary gratuit et les 3
  clés dans `.env` (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`), sinon un
  message d'erreur clair s'affiche au clic plutôt qu'un échec silencieux.
- **Visioconférence (Jitsi Meet)** : un enseignant crée une leçon de type "🔴 Session en direct" avec
  une date/heure — un lien de salle unique est généré automatiquement (aucune clé API requise,
  contrairement à Zoom/Google Meet). L'étudiant voit la date prévue et un bouton "Rejoindre le cours en
  direct" qui ouvre la session dans un nouvel onglet.
- **Emails transactionnels (Resend)** : e-mail de vérification à l'inscription (lien vers
  `/verifier-email/[token]`), reçu automatique par e-mail pour chaque paiement de scolarité confirmé
  et chaque don reçu. Nécessite une clé `RESEND_API_KEY` dans `.env` — sans elle, les e-mails ne
  partent pas mais rien ne plante (juste un avertissement dans les logs du serveur).
- **Vérification publique par QR code réelle** (`/verification/certificat/[token]` et
  `/verification/diplome/[token]`) et par identifiant humain (boîte de recherche sur l'accueil).
- **Module Dons connecté au vrai paiement Stripe** (don ponctuel ou mensuel), avec vraie page de
  remerciement après paiement.
- **SEO** : sitemap.xml et robots.txt générés dynamiquement, métadonnées Open Graph/Twitter Card
  complètes avec image de partage, titre/description optimisés. Les espaces privés (`/dashboard`,
  `/admin`) et pages utilitaires sont exclus de l'indexation.
- **Bibliothèque numérique** (`/dashboard/student/library`, accessible étudiants et enseignants) :
  parcourir/rechercher/filtrer par catégorie les ouvrages et supports mis à disposition. Gestion
  complète (ajouter/modifier/supprimer) depuis `/admin` → onglet "Bibliothèque".
- **Tests automatisés** (`apps/api/test`) : un test qui compile l'application entière (aurait
  détecté immédiatement les bugs de câblage de modules rencontrés en développement), plus des
  tests unitaires sur l'authentification et sur la logique d'inscription aux cours (dont la
  régression "déjà inscrit" corrigée récemment). Lancer avec `npm test` dans `apps/api`.
- **Intégration continue (GitHub Actions)** (`.github/workflows/ci.yml`) : à chaque `push`/pull
  request, lance automatiquement les tests backend, compile l'API et le frontend. Fonctionne dès
  que le projet est poussé sur GitHub — aucune configuration supplémentaire nécessaire.
- **PayPal réel** (frais de scolarité et dons ponctuels) : à côté de Stripe, un bouton PayPal
  fonctionnel utilisant l'API REST v2 (mode Sandbox par défaut). Nécessite un compte développeur
  PayPal gratuit (`PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET` dans `.env`) — sans ça, message d'erreur
  clair. Les dons mensuels restent réservés à Stripe (API d'abonnement différente chez PayPal).
  Mobile Money (Orange/MTN/Airtel) reste hors de portée générique : chaque opérateur exige un
  contrat commercial local et une intégration propre à chaque pays, impossible à construire sans
  ces accès réels — le formulaire l'indique clairement plutôt que de simuler un faux succès.
- **Compteur d'impact des dons** affiché publiquement sur la page d'accueil (montant collecté,
  nombre de donateurs, projets soutenus).
- **Annonces enseignant → étudiants** : un enseignant envoie une annonce depuis "Gérer le contenu"
  d'un cours, tous les étudiants inscrits reçoivent une notification et la voient sur leur tableau
  de bord.
- **Administration étendue** : nouveaux onglets "Années académiques", "Semestres", "Certificats &
  diplômes" (vrai formulaire d'émission), "Paiements", "Dons" et "Journaux d'activité" — l'admin a
  maintenant une vue complète sur les finances et l'activité de la plateforme, plus seulement le
  contenu éditorial.
- **PayPal et Mobile Money** : déjà intégrés (checkout PayPal réel avec redirection, enregistrement
  des paiements Mobile Money Orange/MTN/Airtel), aussi bien pour les frais de scolarité que pour
  les dons.

- **Dashboard admin (`/admin`)** : CRUD complet (ajouter/modifier/supprimer) pour témoignages,
  événements, galerie, FAQ, actualités, historique, départements, programmes, cours, utilisateurs
  (rôle/statut), et consultation des messages de contact reçus.
- **Page d'accueil 100% connectée à l'API** : cours, enseignants, départements/formations,
  statistiques, témoignages, événements, galerie, FAQ, actualités, histoire, contact — tout vient de
  la base ; si elle est vide, un contenu de démonstration s'affiche à la place (jamais d'écran cassé).
- Paiements : checkout Stripe fonctionnel, enregistrement Mobile Money, webhook Stripe.
- Dons : causes, checkout ponctuel/mensuel, compteur d'impact.
- Certificats/diplômes : numérotation automatique, QR Code sécurisé, vérification publique par lien.
- Sécurité transverse : Helmet, CORS, rate limiting, 2FA, hash bcrypt.

**Ce qui reste à construire :**
- Génération réelle des PDF de certificats/diplômes (mise en page, signature numérique, Cloudinary).
- PayPal + Mobile Money (Orange/MTN/Airtel) côté serveur réel (au-delà de Stripe).
- Visioconférence (Zoom/Meet/Jitsi).
- Emails transactionnels via Resend (vérification de compte, reçus, notifications).
- Tests automatisés, CI/CD, scripts de déploiement Vercel/Railway.
- SEO (sitemap, robots.txt, Open Graph).

## Recommandation

Vu l'ampleur du projet, envisage de poursuivre ce développement avec **Claude Code** pour itérer plus
efficacement sur le dépôt au fil de nombreuses sessions.
#   s t h e c r o h  
 #   s t h e c r o h  
 #   s t h e c r o h  
 