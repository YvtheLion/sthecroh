# Déployer STHECROH en ligne

Ce guide déploie :
- **Backend (API NestJS + PostgreSQL + Redis)** sur **Railway**
- **Frontend (Next.js)** sur **Vercel**

Les deux offrent un plan gratuit suffisant pour tester. Une fois en ligne, toute personne avec le
lien peut tester la plateforme — plus besoin de lancer quoi que ce soit en local.

**Temps estimé : 30-45 minutes la première fois.**

---

## 0. Prérequis

- Un compte GitHub (gratuit) — les deux plateformes déploient depuis un dépôt Git
- Le code poussé sur GitHub :
  ```bash
  cd sthecroh
  git init
  git add .
  git commit -m "Version initiale STHECROH"
  ```
  Puis crée un dépôt sur github.com (vide, sans README) et suis les instructions `git remote add origin ...` / `git push`.
- Un compte [Railway](https://railway.app) (gratuit, connexion via GitHub)
- Un compte [Vercel](https://vercel.com) (gratuit, connexion via GitHub)

---

## 1. Backend sur Railway

### 1.1 Créer le projet

1. Sur [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → sélectionne ton dépôt `sthecroh`
2. Railway va détecter plusieurs dossiers — configure le service pour qu'il pointe sur `apps/api` :
   Dans les paramètres du service → **Settings** → **Root Directory** → `apps/api`
3. Railway détectera le `Dockerfile` et l'utilisera automatiquement (grâce à `railway.json`)

### 1.2 Ajouter PostgreSQL et Redis

1. Dans le même projet Railway → **+ New** → **Database** → **PostgreSQL** (se connecte automatiquement)
2. **+ New** → **Database** → **Redis**
3. Railway génère automatiquement une variable `DATABASE_URL` sur le service Postgres, et `REDIS_URL` sur le service Redis

### 1.3 Variables d'environnement du service API

Dans le service API → **Variables**, ajoute :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | Clique "Add Reference" → sélectionne la variable `DATABASE_URL` du service Postgres |
| `REDIS_URL` | Idem, référence celle du service Redis |
| `JWT_ACCESS_SECRET` | Une longue chaîne aléatoire (ex: génère avec `openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET` | Une autre longue chaîne aléatoire différente |
| `BCRYPT_ROUNDS` | `12` |
| `CORS_ORIGINS` | L'URL Vercel une fois connue (étape 2) — ex: `https://sthecroh.vercel.app` |
| `WEB_URL` | Idem, l'URL Vercel |
| `API_URL` | L'URL Railway du service API elle-même (ex: `https://sthecroh-api.up.railway.app`) |
| `STRIPE_SECRET_KEY` | Ta clé Stripe (optionnel pour tester, sinon paiements désactivés proprement) |
| `STRIPE_WEBHOOK_SECRET` | Idem |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Optionnel |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Optionnel |
| `RESEND_API_KEY` | Optionnel |

Railway assigne automatiquement `PORT` — ne pas le définir manuellement.

### 1.4 Déployer

Railway déploie automatiquement à chaque `git push`. Le premier déploiement :
1. Construit l'image Docker
2. Applique les migrations Prisma (`prisma migrate deploy`, inclus dans le `CMD` du Dockerfile)
3. Démarre l'API

Une fois "Deployed" affiché, note l'URL publique (**Settings** → **Networking** → **Generate Domain**).

### 1.5 Lancer le seed (une seule fois)

Depuis Railway, ouvre un terminal sur le service (**⋮** → **Shell**, ou installe la CLI Railway en local) et lance :
```bash
npx prisma db seed
```

---

## 2. Frontend sur Vercel

1. Sur [vercel.com](https://vercel.com) → **Add New** → **Project** → importe le même dépôt GitHub
2. **Root Directory** → clique "Edit" → sélectionne `apps/web`
3. Vercel détecte Next.js automatiquement (aucune configuration de build nécessaire)
4. **Environment Variables** :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<ton-service-railway>.up.railway.app/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Laisse vide pour l'instant, Vercel donnera l'URL après le premier déploiement |

5. Clique **Deploy**

Une fois déployé, Vercel donne une URL du type `https://sthecroh.vercel.app`. Retourne dans les
Environment Variables et renseigne `NEXT_PUBLIC_SITE_URL` avec cette URL, puis redéploie
(**Deployments** → **⋮** sur le dernier déploiement → **Redeploy**).

---

## 3. Connecter les deux

Retourne sur **Railway** → variables du service API → mets à jour :
- `CORS_ORIGINS` = l'URL Vercel exacte (ex: `https://sthecroh.vercel.app`)
- `WEB_URL` = la même URL

Railway redéploie automatiquement après une modification de variable.

---

## 4. Webhooks Stripe (si utilisé)

Sur le [tableau de bord Stripe](https://dashboard.stripe.com/webhooks) → **Add endpoint** :
- URL : `https://<ton-service-railway>.up.railway.app/api/v1/payments/webhooks/stripe`
- Événements à écouter : `checkout.session.completed`
- Copie le "Signing secret" généré → colle-le dans `STRIPE_WEBHOOK_SECRET` sur Railway

---

## 5. Vérifier que tout fonctionne

1. `https://<url-railway>/api/v1/health` → doit répondre `{"status":"ok",...}`
2. `https://<url-vercel>` → la page d'accueil doit charger avec les vrais cours/enseignants
3. Se connecter avec un compte du seed (`emmanuel.mbeki@sthecroh.edu` / `Etudiant#2026`)
4. Envoyer ce lien Vercel à qui tu veux — tout le monde peut tester sans rien installer

---

## Mettre à jour après un changement de code

À chaque `git push` sur la branche principale, Railway ET Vercel redéploient automatiquement.
Aucune commande manuelle nécessaire — c'est le principal avantage de cette configuration.

Si le schéma Prisma change, la migration s'applique automatiquement au démarrage du service
Railway (via `prisma migrate deploy` dans le Dockerfile).

---

## Dépannage rapide

| Symptôme | Cause probable |
|---|---|
| Page d'accueil vide / erreurs réseau | `NEXT_PUBLIC_API_URL` mal configurée sur Vercel, ou API pas encore déployée |
| "Impossible de joindre le serveur API" | Vérifie que le service Railway est "Active" et que l'URL est correcte (avec `/api/v1` à la fin) |
| Erreur CORS dans la console navigateur | `CORS_ORIGINS` sur Railway ne correspond pas exactement à l'URL Vercel |
| Paiements/emails ne partent pas | Clés Stripe/Resend non configurées — comportement attendu, pas un bug |
| Migration échoue au déploiement | Vérifie que `DATABASE_URL` est bien référencée depuis le service Postgres Railway |
