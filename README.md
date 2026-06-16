# AtlasWay

Plateforme de covoiturage au Maroc — Web + Mobile + Backend API.

## Structure

```
tlasWay/
├── backend/        API Express (JWT, OTP email, Sequelize)
├── web/            Application web (Vite + React + TailwindCSS)
├── mobile/         Application mobile (React Native CLI)
└── package.json    Workspaces npm
```

## Stack

- **Backend** : Node.js, Express, Sequelize, JWT, bcrypt, Nodemailer
- **Web** : Vite, React, TailwindCSS, React Router
- **Mobile** : React Native CLI 0.74.5
- **Auth** : JWT + OTP email (vérification à l'inscription)
- **Rôles** : superadmin, admin, user

## Démarrage

```bash
# Backend
cd backend && npm install && npm start

# Web
cd web && npm install && npm run dev

# Mobile
cd mobile && npm install && npm run android
```

## Comptes par défaut

Ces comptes sont créés automatiquement au démarrage du backend.

| Rôle           | Email                        | Mot de passe    |
|----------------|------------------------------|-----------------|
| Super Admin    | superadmin@atlasway.com      | superadmin123   |
| Admin          |admin@atlasway.com            | admin123        |

> Les comptes admin et superadmin ont accès au dashboard d'administration sur `/admin`.

## Flux d'inscription

1. L'utilisateur remplit le formulaire d'inscription
2. Un code OTP est envoyé à son adresse email
3. Il vérifie son email avec le code reçu
4. Il est connecté automatiquement avec un token JWT

## Email (Nodemailer)

Configuré dans `backend/.env` :
```
GMAIL_USER=atlaswaymaroc@gmail.com
GMAIL_PASS=<app-password>
```