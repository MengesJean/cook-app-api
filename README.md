# 🍲 Cook App API

> **⚠️ API EN COURS DE DÉVELOPPEMENT ⚠️**

API RESTful construite avec NestJS pour l'application Cook App, permettant la gestion de recettes, utilisateurs et authentification.

## 📋 À propos

Cette API constitue le backend de l'application Cook App, fournissant toutes les fonctionnalités nécessaires pour gérer les recettes, les utilisateurs et l'authentification. Elle est construite avec NestJS et utilise une architecture modulaire pour faciliter la maintenance et l'évolution.

## 🚀 Fonctionnalités principales

- **🔐 Authentification** : Système JWT avec refresh tokens
- **👤 Gestion des utilisateurs** : Création, mise à jour, récupération des profils
- **🍽️ Gestion des recettes** : CRUD complet pour les recettes
- **🔍 Recherche avancée** : Filtrage des recettes par divers critères
- **❤️ Favoris** : Gestion des recettes favorites des utilisateurs

## 🛠️ Technologies utilisées

- **NestJS** : Framework backend moderne basé sur Node.js
- **TypeScript** : Typage statique pour une meilleure maintenabilité
- **TypeORM** : ORM pour interagir avec la base de données
- **MySQL** : Base de données relationnelle
- **JWT** : JSON Web Tokens pour l'authentification
- **Swagger** : Documentation API automatisée

## 📚 Documentation API

### 🔐 Authentification

| Méthode | Endpoint         | Description                                             | Corps de la requête          | Réponse                                  |
| ------- | ---------------- | ------------------------------------------------------- | ---------------------------- | ---------------------------------------- |
| POST    | `/auth/register` | Inscription d'un nouvel utilisateur                     | `{ email, password, name? }` | Objet utilisateur (sans le mot de passe) |
| POST    | `/auth/login`    | Connexion utilisateur                                   | `{ email, password }`        | `{ accessToken, refreshToken }`          |
| POST    | `/auth/refresh`  | Rafraîchissement du token d'accès                       | `{ refreshToken }`           | `{ accessToken, refreshToken }`          |
| POST    | `/auth/logout`   | Déconnexion (révocation du token de rafraîchissement)   | `{ refreshToken }`           | `{ success: true }`                      |
| POST    | `/auth/me`       | Récupération des informations de l'utilisateur connecté | -                            | Objet utilisateur                        |

### 👤 Utilisateurs

| Méthode | Endpoint     | Description                          | Corps de la requête       | Réponse                      |
| ------- | ------------ | ------------------------------------ | ------------------------- | ---------------------------- |
| GET     | `/users/:id` | Récupération d'un profil utilisateur | -                         | Objet utilisateur            |
| PUT     | `/users/:id` | Mise à jour d'un profil utilisateur  | `{ name?, email?, bio? }` | Objet utilisateur mis à jour |
| DELETE  | `/users/:id` | Suppression d'un compte utilisateur  | -                         | `{ success: true }`          |

### 🍽️ Recettes

| Méthode | Endpoint                | Description                                  | Corps de la requête                                                 | Réponse                                            |
| ------- | ----------------------- | -------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| GET     | `/recipes`              | Liste des recettes (avec pagination)         | Query params: `page`, `limit`, `sort`, `category`, etc.             | `{ data: Recipe[], meta: { total, page, limit } }` |
| GET     | `/recipes/:id`          | Détails d'une recette                        | -                                                                   | Objet recette avec relations                       |
| POST    | `/recipes`              | Création d'une nouvelle recette              | `{ title, description, ingredients, steps, categoryId, etc. }`      | Objet recette créée                                |
| PUT     | `/recipes/:id`          | Mise à jour d'une recette                    | `{ title?, description?, ingredients?, steps?, categoryId?, etc. }` | Objet recette mis à jour                           |
| DELETE  | `/recipes/:id`          | Suppression d'une recette                    | -                                                                   | `{ success: true }`                                |
| GET     | `/recipes/user/:userId` | Recettes d'un utilisateur spécifique         | Query params: `page`, `limit`                                       | `{ data: Recipe[], meta: { total, page, limit } }` |
| POST    | `/recipes/:id/favorite` | Ajouter une recette aux favoris              | -                                                                   | `{ success: true }`                                |
| DELETE  | `/recipes/:id/favorite` | Retirer une recette des favoris              | -                                                                   | `{ success: true }`                                |
| GET     | `/recipes/favorites`    | Recettes favorites de l'utilisateur connecté | Query params: `page`, `limit`                                       | `{ data: Recipe[], meta: { total, page, limit } }` |

### 🔍 Catégories

| Méthode | Endpoint          | Description                 | Corps de la requête       | Réponse                       |
| ------- | ----------------- | --------------------------- | ------------------------- | ----------------------------- |
| GET     | `/categories`     | Liste des catégories        | -                         | `[ Category, Category, ... ]` |
| GET     | `/categories/:id` | Détails d'une catégorie     | -                         | Objet catégorie               |
| POST    | `/categories`     | Création d'une catégorie    | `{ name, description? }`  | Objet catégorie créée         |
| PUT     | `/categories/:id` | Mise à jour d'une catégorie | `{ name?, description? }` | Objet catégorie mis à jour    |
| DELETE  | `/categories/:id` | Suppression d'une catégorie | -                         | `{ success: true }`           |

## 🔒 Sécurité et authentification

L'API utilise un système d'authentification JWT basé sur deux types de tokens :

1. **Access Token** :

   - Durée de vie courte (15 minutes)
   - Utilisé pour authentifier les requêtes API
   - Doit être inclus dans l'en-tête `Authorization: Bearer <token>`

2. **Refresh Token** :
   - Durée de vie longue (7 jours)
   - Usage unique (révoqué après utilisation)
   - Utilisé uniquement pour obtenir un nouveau access token

Pour plus de détails sur le système d'authentification, consultez la [documentation dédiée](./src/api/user/auth/README.md).

## 🚦 Installation et démarrage

### Prérequis

- Node.js 18+
- MySQL

### Installation

```bash
# Installation des dépendances
npm install
```

### Configuration des environnements

L'API utilise un système d'environnements configurés dans le dossier `/src/common/envs/`. Vous y trouverez différents fichiers selon l'environnement :

- `development.env` : Configuration pour le développement local
- `production.env` : Configuration pour la production
- `test.env` : Configuration pour les tests

Exemple de configuration pour le développement (`development.env`) :

```env
PORT=3333

DATABASE_HOST=localhost
DATABASE_NAME=cook-app
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_PORT=3306
DATABASE_SYNC=true

JWT_ACCESS_SECRET=votre_clé_secrète_access_token
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=votre_clé_secrète_refresh_token
JWT_REFRESH_EXPIRES=7d
```

Vous pouvez copier le fichier `development.env.example` (s'il existe) pour créer votre propre fichier de configuration.

### Démarrage

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📁 Structure du projet

```
src/
├── api/                 # Modules API
│   ├── recipe/          # Module de gestion des recettes
│   ├── user/            # Module de gestion des utilisateurs
│   │   └── auth/        # Sous-module d'authentification
│   └── category/        # Module de gestion des catégories
├── common/              # Éléments communs
│   ├── envs/            # Fichiers d'environnement (.env)
│   ├── filters/         # Filtres d'exception
│   ├── guards/          # Guards d'authentification
│   └── interceptors/    # Intercepteurs de requêtes/réponses
├── shared/              # Utilitaires partagés
└── main.ts              # Point d'entrée de l'application
```

## 📝 License

[MIT](LICENSE)
