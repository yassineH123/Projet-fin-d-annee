# AtlasWay — Documentation du projet

> Plateforme marocaine de covoiturage inter-villes : web (React), mobile (React Native) et backend (Express + MongoDB), avec chatbot IA, paiements Stripe, messagerie temps réel et prédictions de demande.

---

## 1. Vue d'ensemble

AtlasWay met en relation des **conducteurs** qui publient des trajets (ex. Casablanca → Rabat) avec des **passagers** qui réservent une place. Le tout est encadré par un **panneau d'administration** (admin / superadmin) qui supervise les utilisateurs, les trajets et la modération.

Le projet est un monorepo avec 3 parties :

```
Projet-fin-d-annee/
├── backend/   API Express + MongoDB (le cerveau : auth, données, logique métier)
├── web/       Application web React (Vite) — ce que les utilisateurs voient dans le navigateur
└── mobile/    Application React Native (Android/iOS)
```

### Stack technique

| Couche | Technologies |
|---|---|
| Backend | Node.js, Express, MongoDB/Mongoose, Socket.io, JWT |
| Frontend web | React 18, Vite, React Router |
| Mobile | React Native |
| IA | Ollama (llama3 pour le chatbot, llava pour la vision/KYC), prédictions de demande |
| Paiements | Stripe Checkout |
| Notifications | Web Push (VAPID), SMS Twilio, Email (Resend/SMTP) |
| Stockage fichiers | Cloudinary (avatars, documents, médias) |
| Auth | JWT (durée 7 jours) + code OTP email/SMS, mots de passe hashés (bcrypt) |

---

## 2. Base de données

**MongoDB**, via Mongoose (ORM). Le backend ne fonctionne pas sans une instance MongoDB accessible.

### Connexion (`backend/database.js`)
Le backend lit `MONGODB_URI` dans `backend/.env` et s'y connecte au démarrage (`backend/index.js`). Si la connexion échoue, **le serveur s'arrête immédiatement** (`process.exit(1)`).

### Local vs Production — deux bases séparées
- **En local** : `backend/.env` (jamais poussé sur Git, il est dans `.gitignore`) contient une URI du type `mongodb://localhost:27018/atlasway?replicaSet=rs0`. C'est une base qui n'existe que sur la machine de développement (on l'a fait tourner via un conteneur Docker `atlasway-mongo`, replica set `rs0` requis pour les transactions Mongoose).
- **En production (Render)** : le backend lit la variable d'environnement `MONGODB_URI` configurée **dans le dashboard Render**, pas dans le code. C'est typiquement un cluster **MongoDB Atlas** (cloud). Tout utilisateur qui s'inscrit sur le site déployé (Vercel + Render) a son compte stocké dans cette base de production — totalement indépendante de la base locale.
- **MongoDB Compass** n'est qu'un client graphique (comme phpMyAdmin) pour visualiser une base à partir de son URI — ce n'est pas un fournisseur de base de données et ne nécessite pas de "compte" séparé.

### Modèles principaux (`backend/models/`)
| Modèle | Rôle |
|---|---|
| `User` | Comptes (passager, conducteur, admin, superadmin) |
| `Ride` | Trajets publiés par les conducteurs |
| `Booking` | Réservations de places sur un trajet |
| `Message` / `Conversation` / `ConversationMember` | Messagerie instantanée |
| `Notification` | Notifications in-app/push |
| `Review` | Avis/notes laissés entre utilisateurs |
| `Friendship` | Demandes et relations d'amitié |
| `Post` / `PostComment` / `PostLike` / `PostReaction` / `PostSave` | Fil social (Feed) |
| `Story` | Stories éphémères |
| `Group` / `GroupMember` | Groupes communautaires |
| `Event` | Événements |
| `Transaction` / `Premium` | Portefeuille, recharge, abonnement Premium |
| `PromoCode` | Codes promo |
| `Report` / `AdminLog` | Signalements et journal des actions admin |
| `SupportTicket` | Tickets de support |
| `EmergencyContact` | Contacts SOS |
| `FavoriteRide` / `RideAlert` / `SavedSearch` | Favoris, alertes et recherches sauvegardées |
| `LoginHistory` / `AuditLog` | Historique de connexions et audit |
| `Prediction` | Prédictions de demande générées par IA |
| `VerificationCode` | Codes OTP (email/SMS) |
| `PushSubscription` | Abonnements aux notifications push |
| `WaitlistEntry` | Liste d'attente |

Le champ clé du modèle `User` pour les rôles :
```js
role: { enum: ['user', 'admin', 'superadmin'], default: 'user' }
isDriver: Boolean        // un même compte "user" peut être passager ET conducteur
driverVerified: Boolean  // vérifié par l'IA (CIN + permis + véhicule)
kycStatus: 'none' | 'pending' | 'approved' | 'rejected'
status: 'active' | 'suspended' | 'blocked'
```

---

## 3. Authentification & rôles

- Inscription/connexion : `POST /auth/register`, `/auth/login` → token JWT (7 jours) + vérification par code OTP (email, SMS en fallback console si Twilio absent).
- 3 niveaux de rôle : **user** (passager/conducteur), **admin**, **superadmin**.
- `isDriver` est un booléen indépendant du rôle : un `user` peut activer le mode conducteur sans devenir admin.
- Les routes sensibles sont protégées par des middlewares qui vérifient le JWT et le rôle (ex. `/admin/*` exige `role: admin` ou `superadmin`).

---

## 4. Compte Voyageur (passager)

Compte par défaut (`role: 'user'`, `isDriver: false`).

**Ce qu'il peut faire :**
- Rechercher un trajet (ville départ/arrivée, date) — `GET /rides/search`
- Réserver une place sur un trajet (`bookingController.create`) avec paiement Stripe
- Suivre sa réservation : QR code de confirmation + suivi GPS en temps réel du conducteur (`TrackRide.jsx`)
- Annuler une réservation (`bookingController.cancel`)
- Consulter ses réservations (page **Mes voyages** / `MyBookings.jsx`)
- Laisser un avis/note au conducteur après le trajet (`Review`)
- Messagerie instantanée avec le conducteur (Socket.io)
- Réseau social : ajouter des amis, poster sur le **Feed**, stories, rejoindre des groupes/événements
- Portefeuille (**Wallet**) : recharge via Stripe, historique des transactions
- Notifications (réservations, messages, alertes) — push ou in-app
- Alertes de trajet (`RideAlert`) et recherches sauvegardées (`SavedSearch`)
- Favoris (trajets/conducteurs)
- Contacts d'urgence + bouton **SOS**
- Support/tickets d'aide
- Chat avec **AtlasBot** (assistant IA, Ollama/llama3, répond en français et darija)
- Abonnement **Premium** et programme de fidélité (**Leaderboard**, niveaux bronze → diamant, badges)

## 5. Compte Conducteur

Un `user` avec `isDriver: true` et idéalement `driverVerified: true`.

**Vérification conducteur (KYC) :**
- Upload CIN, permis de conduire, carte grise, photo du véhicule.
- Vérification **automatique par IA** (`driverVerificationController.verifyDriver`, modèle vision Ollama **llava**) — pas de validation manuelle par un admin pour le KYC standard (l'admin garde un accès `listPendingKyc` / `approveKyc` / `rejectKyc` en backup).

**Ce qu'il peut faire (en plus des fonctions passager) :**
- Publier un trajet (`PublishRide.jsx`, `rideController.create`) : ville départ/arrivée, date, heure, places, prix
- Gérer ses trajets publiés — **Mes trajets** (`MyRides.jsx`, `rideController.getMine`)
- Modifier/supprimer un trajet (`EditRide.jsx`, `rideController.update/remove`)
- Accepter ou refuser les demandes de réservation (`bookingController.accept/refuse`)
- Dashboard conducteur (`DriverDashboard.jsx`) avec statistiques (revenus, trajets effectués, taux d'acceptation)
- Statistiques avancées (`DriverAnalytics.jsx`, `analyticsController`)
- Marquer un trajet comme terminé (`rideController.complete`)
- Accès au **Tableau entreprise** (`enterpriseRoutes.js`) si applicable

## 6. Compte Admin

`role: 'admin'`. Accès au panneau `/admin` (`AdminDashboard.jsx`, protégé par `Shield` dans la navbar).

**Ce qu'il peut faire (`adminController.js`) :**
- Tableau de bord global + graphiques (`getDashboard`, `getCharts`)
- Lister/voir le détail de **tous les utilisateurs** (`listUsers`, `getUserDetail`) — l'admin voit donc le compte de n'importe quel utilisateur inscrit, avec ses infos, trajets, réservations
- Suspendre / bloquer / réactiver un compte (`suspendUser`, `banUser`, `reactivateUser`)
- Changer le rôle d'un utilisateur (`changeUserRole`)
- Supprimer un utilisateur (`deleteUser`)
- Lister/annuler/supprimer des trajets (`listRides`, `cancelRide`, `deleteRide`)
- Gérer les signalements (`listReports`, `updateReportStatus`)
- Consulter le journal des actions admin (`listAdminLogs` — `AdminLog`, traçabilité de chaque action)
- Gérer les demandes KYC en attente (`listPendingKyc`, `approveKyc`, `rejectKyc`)

**Ce qu'il ne fait PAS** (corrigé dans `Navbar.jsx` — masqué pour `admin`/`superadmin`) :
- Pas d'icône **Amis**, pas de **Feed** (poster un statut), pas de **Publier un trajet** / réservations — un admin gère la plateforme, il n'utilise pas les fonctionnalités sociales/passager.

## 7. Compte Superadmin

`role: 'superadmin'`. Hérite de toutes les capacités admin, **plus** la gestion des comptes admin eux-mêmes (`superadminController.js`) :
- Lister les administrateurs (`listAdmins`)
- Créer un nouvel admin (`createAdmin`)
- Supprimer un admin (`deleteAdmin`)

---

## 8. Fonctionnalités transverses (tous comptes connectés)

- **Messagerie temps réel** (Socket.io) — conversations 1-to-1
- **Notifications** in-app + push (Web Push/VAPID)
- **AtlasBot** — chatbot IA (Ollama/llama3), répond en français et darija
- **Prédictions de demande** — un service tourne en tâche de fond (`predictionService`, régénération périodique) pour estimer la demande par route/date à partir des données historiques
- **Réseau social** : Feed (posts, commentaires, likes/réactions), Stories, Groupes, Événements, système d'amis
- **Portefeuille & paiements** : solde interne, recharge Stripe (`walletController`), webhook Stripe pour confirmer les paiements
- **Programme de fidélité** : niveaux (bronze/argent/or/platine/diamant), badges, classement (`Leaderboard.jsx`)
- **Export de données** (`exportRoutes.js`) et **historique de connexion** (`LoginHistory`)
- **SOS / contacts d'urgence** — bouton visible partout dans l'app

---

## 9. Comment ça marche techniquement

### Démarrage du backend (`backend/index.js`)
1. Connexion à MongoDB (`connect()`) — **bloquant**, le serveur s'arrête si ça échoue.
2. Seed automatique des comptes admin/superadmin de test (`seedAuthUsers`).
3. Vérifie la disponibilité d'Ollama (chatbot) et du modèle de vision `llava` (KYC) — non bloquant, juste un avertissement si absent.
4. Lance la génération des prédictions de demande, puis la régénère périodiquement.
5. Démarre le serveur HTTP + Socket.io sur le port `PORT` (défaut 4000).
6. En production, un **self-ping** toutes les 14 minutes empêche Render (plan gratuit) de mettre le service en veille.

### Sécurité
- `helmet` (en-têtes HTTP sécurisés), CORS strict (liste blanche d'origines selon l'environnement), rate-limiting global + rate-limiting renforcé sur `/auth` (anti brute-force).

### Frontend web (`web/`)
- React + Vite, routage avec `react-router-dom`.
- `AuthContext` gère l'utilisateur connecté (token JWT stocké côté client) ; la navbar et les routes s'adaptent selon `user.role` et `user.isDriver`.
- `WelcomeTour.jsx` affiche un guide d'accueil pour les nouveaux utilisateurs — **désactivé pour les comptes admin/superadmin**.

### Déploiement
- **Web** → Vercel (`web/vercel.json`)
- **Backend** → Render (variable d'environnement `MONGODB_URI` configurée côté Render, pointant probablement vers un cluster MongoDB Atlas en production)
- Les secrets (`.env`) ne sont jamais commités — chaque environnement (local/Render) a sa propre configuration.

---

## 10. Lancer le projet en local

```bash
# 1. Base de données MongoDB (Docker, une seule fois)
docker run -d --name atlasway-mongo -p 27018:27018 mongo:7 --replSet rs0 --bind_ip_all --port 27018
docker exec atlasway-mongo mongosh --port 27018 --quiet --eval 'rs.initiate({_id:"rs0", members:[{_id:0, host:"localhost:27018"}]})'
# Les fois suivantes : docker start atlasway-mongo

# 2. Backend
cd backend
npm install
npm run dev        # http://localhost:4000

# 3. Web
cd web
npm install
npm run dev         # http://localhost:5173
```

### Comptes de test
| Rôle | Email | Mot de passe |
|---|---|---|
| Super Admin | superadmin@atlasway.com | superadmin123 |
| Admin | admin@atlasway.com | admin123 |

---

## 11. Auteurs
- Adam Khoulani
- Yassine H.
