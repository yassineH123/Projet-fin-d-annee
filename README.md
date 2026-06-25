# AtlasWay — Covoiturage Maroc

Plateforme de covoiturage marocaine full-stack avec chatbot IA, messagerie temps réel, paiements Stripe et prédictions de demande par LLM.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Backend** | Node.js, Express, MongoDB/Mongoose, Socket.io, JWT |
| **Frontend** | React 18, Vite, React Router, PWA |
| **IA** | Ollama (llama3 + llava) — chatbot AtlasBot + prédictions |
| **Paiements** | Stripe Checkout |
| **Notifications** | Web Push (VAPID), SMS Twilio |
| **Auth** | JWT (7j) + OTP email/SMS, bcrypt |

## Structure

```
Projet-fin-d-annee/
├── backend/          API Express + MongoDB
│   ├── controllers/  Logique métier
│   ├── models/       Schémas Mongoose
│   ├── routes/       Endpoints API
│   ├── services/     Stripe, Ollama, Email, Push...
│   ├── middleware/   Auth, erreurs
│   └── __tests__/   Tests Jest
├── web/              SPA React (Vite)
└── mobile/           React Native (iOS/Android)
```

## Prérequis

- Node.js 18+
- MongoDB Community 8+ (`brew install mongodb-community`)
- Ollama (`brew install ollama`) + modèles `llama3` et `llava`

## Installation

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install
npm start              # port 4000

# 2. Frontend
cd ../web
npm install
npm run dev            # port 5173
```

## Services à démarrer

```bash
brew services start mongodb-community
ollama serve
```

## Variables d'environnement

Copier `backend/.env.example` vers `backend/.env` et remplir :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `MONGODB_URI` | Oui | URI MongoDB |
| `JWT_SECRET` | Oui | Clé secrète JWT (min 32 chars) |
| `SMTP_USER` / `SMTP_PASS` | Oui | Gmail pour emails de vérification |
| `STRIPE_SECRET_KEY` | Non | Paiements Stripe (mode test disponible) |
| `TWILIO_*` | Non | SMS OTP (fallback console si absent) |
| `VAPID_PUBLIC` / `VAPID_PRIVATE` | Non | Notifications push |
| `OLLAMA_URL` | Non | Defaut: http://localhost:11434 |

## Tests

```bash
cd backend
npm test                 # Lancer les tests
npm run test:coverage    # Avec couverture
```

## Comptes de test

| Role | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | superadmin@atlasway.com | superadmin123 |
| Admin | admin@atlasway.com | admin123 |

## Fonctionnalites

- Publication et recherche de trajets avec filtres
- Reservation avec QR code et suivi GPS temps reel
- Messagerie instantanee (Socket.io)
- AtlasBot — chatbot support (Ollama/llama3)
- Predictions de demande IA par route et date
- Wallet + recharge Stripe
- Notifications push (PWA)
- Reseau social (amis, stories, groupes, evenements)
- Verification conducteur (photo CIN via llava)
- Dashboard admin + analytics

## Auteurs

- Adam Khoulani
- Yassine H.
