# RegTech — Frontend

Application **React 19 + Vite 6 + Tailwind 4** pour le simulateur douanier AfCFTA. L’authentification est gérée par **Clerk** ([ADR-008](../docs/decisions/008-authentification-clerk.md)).

## Prérequis

| Outil | Version minimale |
|-------|------------------|
| [Node.js](https://nodejs.org/) | 20+ |
| npm | fourni avec Node.js |
| Compte [Clerk](https://dashboard.clerk.com) | accès à l’application RegTech |

Application Clerk du projet : **`app_3EdCISA6pWatOI514YUyYbnogLX`**

---

## 1. Installation et lancement (rapide)

```powershell
cd Front-End
npm install
```

Copiez les variables d’environnement :

```powershell
copy .env.example .env
```

Renseignez au minimum `VITE_CLERK_PUBLISHABLE_KEY` dans `.env` (voir section Clerk ci-dessous).

Lancez le serveur de développement :

```powershell
npm run dev
```

Ouvrez **http://localhost:5173** (si le port est occupé, Vite affiche l’URL réelle dans le terminal)

- Sans clé Clerk valide : message « variable manquante ».
- Avec Clerk configuré : écran de connexion Clerk, puis la plateforme après authentification.

Le proxy Vite redirige `/api` vers le Back FastAPI (`Back-End`, port 8000). En dev, seule la clé Clerk est requise dans `.env` :

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

(`VITE_PROXY_TARGET` et `VITE_API_BASE_URL` ont des défauts adaptés au dev local.)

### Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Dev server (port **5173** par défaut) |
| `npm run build` | Build production → `dist/` |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | Vérification TypeScript |

---

## 2. Variables d’environnement

Fichier **`.env`** (ne pas commiter — déjà dans `.gitignore`) :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | **Oui** | Clé publique Clerk (`pk_test_...` ou `pk_live_...`) |
| `VITE_PROXY_TARGET` | Non | URL de l’API (défaut : `http://localhost:8000`) |
| `VITE_API_BASE_URL` | Non | Préfixe API (vide = proxy Vite `/api`) |

Exemple `.env` :

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_VOTRE_CLE
VITE_PROXY_TARGET=http://localhost:8000
VITE_API_BASE_URL=
```

> `CLERK_SECRET_KEY` peut être présente dans `.env` pour le CLI ; elle sert au **backend**, jamais au code React.

---

## 3. Installation de Clerk

Deux méthodes : **CLI recommandée** (remplit `.env` automatiquement) ou **manuelle** (Dashboard).

### 3.1 Méthode CLI (recommandée)

Dans un terminal **interactif** (PowerShell ou CMD), depuis `Front-End/` :

```powershell
npm install -g clerk
clerk update --yes
clerk auth login
```

Une page navigateur s’ouvre : connectez-vous au compte Clerk qui gère l’app RegTech.

Puis liez le projet et récupérez les clés :

```powershell
clerk init --app app_3EdCISA6pWatOI514YUyYbnogLX --yes --no-skills
clerk doctor
```

**Script tout-en-un :**

```powershell
.\scripts\clerk-setup.ps1
```

`clerk init` détecte Vite/React, vérifie `@clerk/react`, lie l’application et écrit les variables dans **`.env`**.

### 3.2 Méthode manuelle (sans CLI)

1. [dashboard.clerk.com](https://dashboard.clerk.com) → application **RegTech**.
2. **API Keys** → copier la **Publishable key**.
3. Coller dans `Front-End/.env` :

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

### 3.3 Configuration Dashboard (obligatoire)

| Étape | Où | Action |
|-------|-----|--------|
| URLs autorisées | *Domains* / *Paths* | Ajouter `http://localhost:5173` (+ URL Netlify en prod) |
| Connexion sociale | *User & authentication* → *Social connections* | Activer **Google** (recommandé pour la démo) |
| Email | *User & authentication* → *Email* | Activer, requis pour l’inscription |
| Téléphone Cameroun | *Configure* → *SMS* → *Settings* | Activer **Cameroon** (+237) dans la **SMS allowlist** |
| Username | *User & authentication* → *Username* | Optionnel, ou pseudo sans `@` (ex. `vaneck_dongmo`) |

Guide détaillé Cameroun : [docs/clerk-activer-cameroun.md](./docs/clerk-activer-cameroun.md)

```powershell
.\scripts\open-clerk-sms-cameroon.ps1
```

---

## 4. Comportement de l’authentification

1. **Non connecté** : uniquement le composant Clerk `<SignIn />` (thème clair/sombre via le bouton en haut à droite).
2. **Connecté** : accès au dashboard (simulateur, classification, AfCFTA, export CSV).
3. Les appels API métier envoient `Authorization: Bearer` (jeton Clerk via `getToken()`).
4. **Déconnexion** : menu profil (`UserButton`) en haut à droite.

Le backend FastAPI valide le JWT Clerk sur les routes protégées — voir [ADR-011](../docs/decisions/011-authentification-clerk-fastapi.md).

---

## 5. API en développement

Le proxy Vite redirige `/api` vers `VITE_PROXY_TARGET`.

**Back FastAPI (cible normale) :**

```env
VITE_PROXY_TARGET=http://localhost:8000
```

**Prototype Express (si le Back n’est pas prêt) :**

```env
VITE_PROXY_TARGET=http://localhost:3000
```

Puis lancer le serveur dans `regtech-–-assistant-douanier-afcfta/` :

```powershell
cd ..\regtech-–-assistant-douanier-afcfta
npm run dev
```

Référentiels publics : `GET /api/v1/health`, `/countries`, `/tariffs`.  
Routes protégées (JWT) : `/simulate`, `/classify`, `/history`, `/batch`.

---

## 6. Dépannage

### Clerk CLI

| Problème | Solution |
|----------|----------|
| `npm install -g clerk` → EBUSY | La CLI est déjà installée ; exécuter `clerk --version` |
| CLI bloquée dans Cursor | Utiliser PowerShell/CMD **en dehors** de l’agent |
| `clerk doctor` en échec | Vérifier `.env` et `VITE_CLERK_PUBLISHABLE_KEY` |

### Connexion / inscription

| Message | Solution |
|---------|----------|
| Username : lettres, chiffres, `-`, `_` uniquement | Ne pas mettre l’email dans **Username** ; utiliser `vaneck_dongmo` |
| Cameroon not supported | Activer **Cameroon** dans *SMS allowlist* (voir doc ci-dessus) |
| Rien ne change après l’email | Corriger username/téléphone, ou **Continuer avec Google** |
| API indisponible (bandeau rouge) | Démarrer l’API ou ajuster `VITE_PROXY_TARGET` |

### Build

```powershell
npm run build
```

---

## 7. Structure du projet

```
Front-End/
├── src/
│   ├── main.tsx                    # ClerkProvider + AuthGate
│   ├── presentation/
│   │   ├── components/auth/        # SignIn, AuthGate, UserButton
│   │   ├── layout/RegTechShell.tsx # Shell principal
│   │   └── features/               # SIM, IA, EXP
│   └── infrastructure/http/      # Client API + jeton Clerk
├── scripts/
│   ├── clerk-setup.ps1
│   └── open-clerk-sms-cameroon.ps1
├── docs/
│   ├── architecture.md
│   └── clerk-activer-cameroun.md
├── .env.example
└── README.md
```

| Module | Onglet |
|--------|--------|
| SIM | Simulateur de taxes |
| IA | Classification HS |
| AFT | Règles ZLECAf |
| EXP | PDF, graphiques, lot CSV |

---

## 8. Documentation liée

- [Architecture Front-End](./docs/architecture.md)
- [ADR-008 — Authentification Clerk](../docs/decisions/008-authentification-clerk.md)
- [ADR-011 — Clerk + FastAPI](../docs/decisions/011-authentification-clerk-fastapi.md)
- [Clerk — React quickstart](https://clerk.com/docs/react/getting-started/quickstart)
- [Clerk CLI](https://clerk.com/docs/cli)
