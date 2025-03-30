# Système d'Authentification

Ce module implémente un système d'authentification basé sur JWT avec deux types de tokens pour une sécurité renforcée et une expérience utilisateur fluide.

## Architecture d'authentification

Le système repose sur deux types de tokens :

1. **Token d'accès (Access Token)**:

   - Courte durée de vie (15 minutes)
   - Utilisé pour authentifier chaque requête API
   - Stocké dans un cookie HTTP-only côté client

2. **Token de rafraîchissement (Refresh Token)**:
   - Longue durée de vie (7 jours)
   - Stocké en base de données et dans un cookie HTTP-only côté client
   - Usage unique (one-time use) pour plus de sécurité
   - Utilisé uniquement pour obtenir un nouveau token d'accès

## Flux d'authentification

### Inscription (Register)

- Endpoint: `POST /auth/register`
- Le service valide les données et crée un nouvel utilisateur
- Le mot de passe est haché avec bcrypt avant stockage
- Retourne les informations de l'utilisateur (sans le mot de passe)

### Connexion (Login)

- Endpoint: `POST /auth/login`
- Le service vérifie l'email et le mot de passe
- Si valides, génère un access token et un refresh token
- Les tokens sont renvoyés au client
- Le frontend les stocke dans des cookies HTTP-only

### Validation des requêtes

- Les routes protégées utilisent le `JwtAuthGuard`
- Le guard vérifie la présence et la validité de l'access token
- Si valide, la requête est traitée
- Si expiré, le client doit utiliser le refresh token

### Rafraîchissement des tokens

- Endpoint: `POST /auth/refresh`
- Le client envoie le refresh token
- Le service vérifie que le token est valide, non révoqué et non expiré
- Si valide, il est révoqué immédiatement (usage unique)
- Un nouveau couple de tokens (access + refresh) est généré et renvoyé

### Déconnexion (Logout)

- Endpoint: `POST /auth/logout`
- Le client envoie le refresh token
- Le service révoque ce token et tous les autres tokens de l'utilisateur
- Les cookies sont supprimés côté client

## Avantages de cette approche

1. **Sécurité renforcée**:

   - Access tokens à courte durée de vie (15min)
   - Refresh tokens à usage unique (protection contre les attaques de rejeu)
   - Cookies HTTP-only (protection contre les attaques XSS)
   - Possibilité de révoquer des sessions individuelles ou toutes les sessions

2. **Expérience utilisateur fluide**:
   - Rafraîchissement automatique des tokens côté client
   - Session persistante sans compromis sur la sécurité
   - Pas de déconnexions fréquentes

## Implémentation technique

### Entités

- `User`: Stocke les informations utilisateur
- `RefreshToken`: Stocke les refresh tokens avec leur statut (révoqué ou non) et date d'expiration

### Services

- `AuthService`: Gère l'inscription, la connexion, la déconnexion et le rafraîchissement des tokens
- `AuthHelper`: Facilite la génération et validation des JWT
- `RefreshTokenService`: Gère le cycle de vie des refresh tokens

### Guards

- `JwtAuthGuard`: Protège les routes nécessitant une authentification

### Configuration

Les paramètres de configuration des tokens sont définis dans les variables d'environnement:

- `JWT_ACCESS_SECRET`: Clé secrète pour les access tokens
- `JWT_ACCESS_EXPIRES`: Durée de vie des access tokens (15m par défaut)
- `JWT_REFRESH_SECRET`: Clé secrète pour les refresh tokens
- `JWT_REFRESH_EXPIRES`: Durée de vie des refresh tokens (7d par défaut)

## Pour aller plus loin

Ce système pourrait être enrichi avec:

- Une option "Remember me" pour ajuster la durée du refresh token
- Une gestion des appareils connectés (permettant à l'utilisateur de voir et révoquer ses sessions)
- Un système de liste noire pour les tokens compromis
- Une rotation périodique des clés secrètes JWT
