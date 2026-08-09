# Déployer STHECROH sur ton VPS Hostinger (sthecroh.com)

Ce guide déploie tout (frontend + API + PostgreSQL + Redis + HTTPS automatique) sur ton VPS avec
une seule commande, en utilisant le domaine `sthecroh.com` que tu as déjà acheté.

---

## Étape 1 — Récupérer les accès de ton VPS

Dans ton panneau Hostinger → **VPS** → ton serveur → note :
- L'**adresse IP** (ex: `123.45.67.89`)
- Le **mot de passe root** (ou configure une clé SSH si proposé)

---

## Étape 2 — Pointer le domaine vers le VPS (DNS)

Dans Hostinger → **Domains** → `sthecroh.com` → **DNS / Nameservers** → ajoute ou modifie ces
enregistrements :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | L'adresse IP de ton VPS |
| A | `api` | La même adresse IP de ton VPS |
| A | `www` | La même adresse IP de ton VPS |

La propagation DNS peut prendre de quelques minutes à quelques heures.

---

## Étape 3 — Se connecter au VPS

Depuis PowerShell (Windows) :
```powershell
ssh root@<adresse-ip-du-vps>
```
Tape "yes" si demandé, puis entre le mot de passe root.

---

## Étape 4 — Installer Docker sur le VPS

Une fois connecté en SSH, colle ces commandes une par une :

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
docker --version
docker compose version
```

---

## Étape 5 — Envoyer le code sur le VPS

**Depuis ton PC** (pas le VPS), ouvre un nouveau terminal PowerShell à l'endroit où se trouve ton
dossier `sthecroh`, et envoie-le sur le serveur :

```powershell
cd C:\Users\lalan
scp -r sthecroh root@<adresse-ip-du-vps>:/root/sthecroh
```

Ça peut prendre quelques minutes selon ta connexion.

---

## Étape 6 — Configurer les variables d'environnement

**Retourne sur le VPS** (le terminal SSH de l'étape 3) :

```bash
cd /root/sthecroh
cp .env.production.example .env
nano .env
```

Remplis au minimum `DOMAIN`, `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
(les autres peuvent rester vides pour l'instant — Stripe/PayPal/emails s'activeront plus tard).

Pour générer des secrets forts, dans un autre terminal SSH :
```bash
openssl rand -hex 32
```
Lance-la deux fois pour avoir deux valeurs différentes (une pour chaque secret JWT).

Dans nano : `Ctrl+O` puis `Entrée` pour sauvegarder, `Ctrl+X` pour quitter.

---

## Étape 7 — Lancer la plateforme

Toujours sur le VPS :
```bash
cd /root/sthecroh
docker compose -f docker-compose.prod.yml up -d --build
```

La première fois, ça construit toutes les images — compte 5 à 10 minutes. Caddy va aussi obtenir
automatiquement un certificat HTTPS valide pour `sthecroh.com` et `api.sthecroh.com` (aucune
action de ta part, à condition que le DNS de l'étape 2 soit déjà propagé).

---

## Étape 8 — Appliquer les migrations et le seed

```bash
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

---

## Étape 9 — Vérifier

- `https://sthecroh.com` → le site public doit s'afficher
- `https://api.sthecroh.com/api/v1/health` → doit répondre `{"status":"ok",...}`
- Connexion avec `emmanuel.mbeki@sthecroh.edu` / `Etudiant#2026`

Le lien `https://sthecroh.com` peut maintenant être envoyé à n'importe qui pour tester à distance.

---

## Mettre à jour après un changement de code

À chaque fois que je te donne un nouveau zip :

1. **Depuis ton PC**, renvoie le nouveau dossier :
   ```powershell
   scp -r sthecroh root@<adresse-ip-du-vps>:/root/sthecroh
   ```
2. **Sur le VPS** :
   ```bash
   cd /root/sthecroh
   docker compose -f docker-compose.prod.yml up -d --build
   ```
   (Ajoute `docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy` si le schéma a changé.)

---

## Commandes utiles

```bash
# Voir les logs en direct
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web

# Redémarrer un service
docker compose -f docker-compose.prod.yml restart api

# Tout arrêter
docker compose -f docker-compose.prod.yml down

# Voir l'état des services
docker compose -f docker-compose.prod.yml ps
```

---

## Dépannage rapide

| Symptôme | Cause probable |
|---|---|
| "Connection refused" sur https://sthecroh.com | DNS pas encore propagé — attends, ou vérifie avec `nslookup sthecroh.com` |
| Erreur de certificat HTTPS | Le DNS doit pointer vers le VPS AVANT que Caddy essaie d'obtenir le certificat — relance `docker compose -f docker-compose.prod.yml restart caddy` une fois le DNS propagé |
| Page d'accueil vide | Vérifie `docker compose -f docker-compose.prod.yml logs web` |
| "Impossible de joindre l'API" | Vérifie `docker compose -f docker-compose.prod.yml logs api`, et que `api.sthecroh.com` répond |
