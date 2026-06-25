# Backend Tema Concept

API REST pour la plateforme digitale Tema Concept.

## Stack technique

- Node.js + Express.js
- PostgreSQL + Prisma ORM
- JWT (authentification admin)
- bcryptjs (hash des mots de passe)
- Zod (validation des données)

## 1. Installation

```bash
cd backend
npm install
```

## 2. Configuration `.env`

Copiez le fichier d'exemple et adaptez les valeurs :

```bash
cp .env.example .env
```

Variables requises :

| Variable       | Description                          |
|----------------|--------------------------------------|
| `PORT`         | Port du serveur (défaut : 5000)      |
| `DATABASE_URL` | URL de connexion PostgreSQL          |
| `JWT_SECRET`   | Clé secrète pour les tokens JWT      |
| `FRONTEND_URL` | URL du frontend (CORS)               |
| `NODE_ENV`     | `development` ou `production`        |

## 3. Migration Prisma

Assurez-vous que PostgreSQL est démarré et que la base `tema_concept` existe, puis :

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 4. Seed admin

Crée l'administrateur par défaut et les services initiaux :

```bash
npm run seed
```

**Identifiants admin :**
- Email : `admin@temaconcept.com`
- Mot de passe : `admin123`

## 5. Lancement du backend

**Développement :**
```bash
npm run dev
```

**Production :**
```bash
npm start
```

L'API sera accessible sur `http://localhost:5000`.

## 6. Routes API

### Routes publiques

| Méthode | Route                        | Description                    |
|---------|------------------------------|--------------------------------|
| GET     | `/`                          | Vérification API               |
| POST    | `/api/auth/login`            | Connexion admin                |
| POST    | `/api/devis`                 | Créer une demande de devis     |
| GET     | `/api/devis/:id`             | Détail d'une demande           |
| POST    | `/api/contact`               | Envoyer un message contact     |
| GET     | `/api/contact/:id`           | Détail d'un message            |
| GET     | `/api/services`              | Liste des services actifs      |
| POST    | `/api/chat`                  | Envoyer un message au chatbot  |
| GET     | `/api/chat/conversations/:id`| Détail d'une conversation      |

### Routes admin (JWT requis)

Header : `Authorization: Bearer <token>`

| Méthode | Route                          | Description                  |
|---------|--------------------------------|------------------------------|
| GET     | `/api/auth/me`                 | Profil admin connecté        |
| GET     | `/api/devis`                   | Liste des demandes de devis  |
| PUT     | `/api/devis/:id/status`        | Modifier le statut d'un devis|
| DELETE  | `/api/devis/:id`               | Supprimer une demande        |
| GET     | `/api/contact`                 | Liste des messages contact   |
| PUT     | `/api/contact/:id/status`      | Modifier le statut d'un msg  |
| DELETE  | `/api/contact/:id`             | Supprimer un message         |
| POST    | `/api/services`                | Créer un service             |
| PUT     | `/api/services/:id`            | Modifier un service          |
| DELETE  | `/api/services/:id`            | Supprimer un service         |
| GET     | `/api/chat/conversations`      | Liste des conversations IA   |

## 7. Connexion avec le frontend

1. Créez un fichier `.env` à la racine du frontend :
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. Démarrez le backend (`npm run dev` dans `backend/`).

3. Démarrez le frontend (`npm run dev` à la racine).

4. Le frontend utilise `src/services/api.js` pour communiquer avec l'API.

## Déploiement sur Render

1. Créez une base PostgreSQL sur Render.
2. Déployez le backend en service Web Node.js.
3. Variables d'environnement à configurer : `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`.
4. Commande de build : `npm install && npx prisma generate && npx prisma migrate deploy`
5. Commande de démarrage : `npm start`
