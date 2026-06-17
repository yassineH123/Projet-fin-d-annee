# AtlasWay — Fonctionnalités du projet

Plateforme de covoiturage au Maroc. Stack : **Backend** Node.js/Express/Sequelize/MySQL, **Web** React/Vite/TailwindCSS, **Mobile** React Native (en cours de développement).

---

## 1. Partie Authentification / Connexion

- **Inscription** (`/register`) : prénom, nom, email, mot de passe (≥ 8 caractères), téléphone optionnel, code de parrainage optionnel.
- **Vérification par code OTP** (6 chiffres, valable 10 min) envoyé par **email** ou **SMS** au choix.
- **Connexion** (`/login`) : email + mot de passe, retourne un token JWT (7 jours).
- **Mot de passe oublié** : envoi d'un code OTP par email, puis réinitialisation (`/forgot-password`, `/reset-password`).
- **Changement de mot de passe** depuis le profil (`/change-password`).
- **Blocage de connexion** pour les comptes `suspended` (désactivé) ou `blocked` (banni) — message explicite à chaque cas.
- **Révocation immédiate** : le statut du compte est revérifié en base à chaque requête authentifiée (pas seulement au login) — un compte banni perd l'accès instantanément, même avec un token encore valide.
- **Code de parrainage** : généré automatiquement à l'inscription (`AT-XXXXXX`), utilisé pour le système de badges.

## 2. Partie Profil utilisateur

- Consultation et édition du profil (nom, téléphone, bio, langues parlées, préférences de trajet : musique/fumeur/animaux/discussion).
- Upload de photo de profil, photo de voiture.
- Informations conducteur : modèle, couleur, année du véhicule, plaque d'immatriculation.
- Upload de documents justificatifs (CIN, permis, carte grise) → déclenche une réinitialisation de la vérification conducteur (`driverVerified: false`) en attendant validation admin.
- Préférences d'accessibilité (PMR) : utilisateur en situation de handicap / véhicule accessible PMR.
- Profil public consultable par les autres utilisateurs (`/profile/:id`) avec ses trajets actifs et avis reçus.
- Onboarding obligatoire après inscription (choix passager/conducteur, infos de base).

## 3. Partie Trajets (covoiturage)

- **Publier un trajet** : ville de départ/arrivée, date, prix, nombre de places, description, réservation instantanée optionnelle, trajets récurrents.
- **Rechercher un trajet** : ville de départ/arrivée, date, fourchette de prix, **note minimum du conducteur**, **conducteurs vérifiés uniquement**, **véhicule accessible PMR**, **nombre de places souhaité**, tri (départ le plus tôt, prix croissant/décroissant, mieux notés).
- **Recherches sauvegardées** : sauvegarder une combinaison ville départ/arrivée et recevoir une **notification automatique** dès qu'un nouveau trajet correspondant est publié.
- **Page d'accueil** : trajets à venir, meilleurs conducteurs (note moyenne), villes tendance.
- **Détail d'un trajet** : infos conducteur, avis reçus, carte de l'itinéraire, réservation, contact direct du conducteur, **signaler ce trajet** (motif dédié "trajet suspect" + autres motifs).
- **Mes trajets** (conducteur) : liste, modification, suppression, marquage "terminé".
- **Comparateur** (`/compare`) : comparer plusieurs trajets entre deux mêmes villes.
- *Restriction : un compte admin/superadmin ne peut pas publier de trajet (bloqué côté backend).*

## 4. Partie Réservations

- Réserver des places sur un trajet (avec message optionnel au conducteur).
- Réservation **instantanée** (auto-acceptée) ou **en attente** de validation par le conducteur.
- Conducteur : accepter / refuser une réservation en attente.
- Passager : annuler sa réservation (replace les places disponibles si elle était acceptée).
- **Historique des trajets passés** (onglet "À venir" / "Historique" dans Mes réservations).
- **CO₂ économisé** affiché côté passager (en plus du dashboard conducteur), calculé sur les trajets effectués.
- Compteur de réservations en attente (badge navbar).
- *Restriction : un compte admin/superadmin ne peut pas réserver de trajet (bloqué côté backend).*

## 5. Partie Avis / Notation

- Laisser un avis (note 1-5 + commentaire) sur un conducteur ou un passager après un trajet effectué.
- Vérification qu'une réservation acceptée existe avant de pouvoir noter.
- Mise à jour automatique de la note moyenne (`avgRating`) et du nombre d'avis (`totalRatings`) de l'utilisateur noté.
- Consultation des avis reçus par un utilisateur sur son profil public.

## 6. Partie Messagerie

- Conversations directes entre deux utilisateurs (créées automatiquement au premier message).
- Conversations de groupe (ex. discussion liée à un trajet).
- Réactions emoji sur les messages.
- Compteur de messages non lus (badge navbar), marquage lu à l'ouverture.
- Temps réel via Socket.io (nouveaux messages, indicateur "en train d'écrire").
- C'est aussi le canal par lequel un utilisateur peut contacter directement un administrateur.

## 7. Partie Amis (réseau social)

- Envoyer / accepter / refuser une demande d'ami.
- Liste d'amis, demandes en attente, amis en commun avec un autre utilisateur.
- Compteur de demandes en attente (badge navbar).
- *Restriction : un compte admin/superadmin ne peut ni envoyer ni recevoir de demande d'ami (fonctionnalité totalement désactivée pour ce rôle, navbar + backend).*

## 8. Partie Fil d'actualité (Feed)

- Publier un post (texte libre ou annonce de trajet avec ville départ/arrivée, date, prix, places).
- Liker / déliker un post.
- Commenter un post.
- Supprimer son propre post/commentaire (ou n'importe lequel si admin/superadmin).

## 9. Partie Notifications

- Notifications in-app : nouvelle réservation, réservation acceptée/refusée, nouvelle demande d'ami, demande acceptée, **nouveau trajet correspondant à une recherche sauvegardée**, etc.
- Marquer une notification (ou toutes) comme lue.
- Cloche de notifications avec compteur non-lues dans la navbar.

## 10. Partie Tableau de bord conducteur

- Statistiques personnelles : nombre de trajets, passagers transportés, gains totaux et du mois, CO₂ économisé (estimation).
- Système de **badges** : premier trajet, conducteur vérifié, 5 étoiles, top conducteur (10+ trajets), accessible PMR, 5 parrainages.
- Nombre de filleuls (parrainage) et code de parrainage personnel.
- Trajets à venir.

## 11. Partie Administration (rôles `admin` et `superadmin`)

### 11.1 Tableau de bord
- Statistiques globales : utilisateurs, conducteurs, trajets, réservations, avis, **signalements**, **comptes bannis**.
- Graphiques : inscriptions (6 derniers mois), trajets publiés (6 derniers mois), répartition des réservations par statut, répartition des signalements par statut.

### 11.2 Gestion des utilisateurs
- Liste paginée avec recherche (nom, email, **téléphone**) et filtre par rôle.
- Détail complet d'un utilisateur : infos, statut, nombre de trajets/réservations, signalements reçus/envoyés, **liste des commentaires/avis reçus**.
- Actions : **suspendre** (désactiver), **réactiver**, **bannir**, **supprimer**.
- Garde-fous : impossible d'agir sur soi-même, impossible d'agir sur un superadmin, seul un superadmin peut agir sur un compte admin.
- *Le mot de passe en clair n'est jamais affiché ni accessible — les mots de passe sont hachés (bcrypt) et donc irrécupérables, même pour un admin.*

### 11.3 Gestion des trajets
- Liste paginée avec recherche (villes) et filtre par statut.
- Détail d'un trajet (conducteur, réservations associées).
- Annuler un trajet (statut → annulé) ou le **supprimer définitivement** (avec ses réservations, en transaction) si frauduleux/signalé.
- Visualisation uniquement — un admin ne peut pas créer de trajet.

### 11.4 Signalements (modération)
- Tout utilisateur peut signaler **un autre utilisateur** ou **directement un trajet** (motif : comportement, fraude, sécurité, contenu inapproprié, **trajet suspect**, autre + description libre). Signaler un trajet vise implicitement son conducteur. Anti-spam (max 10 signalements / 15 min).
- Liste des signalements avec filtre par statut (en attente, en cours, résolu, rejeté), trajet lié visible directement dans le tableau.
- Détail d'un signalement (qui a signalé, qui est visé, motif, trajet lié éventuel).
- Changer le statut + ajouter une note administrative.

### 11.5 Journal d'audit
- Chaque action sensible (suspendre/bannir/réactiver/supprimer un utilisateur, annuler/supprimer un trajet, traiter un signalement, créer/supprimer un admin) est enregistrée : qui, quoi, sur quelle cible, quand.
- Consultable dans un onglet dédié, avec filtres par action/type de cible.

### 11.6 Gestion des comptes admin (superadmin uniquement)
- Lister les admins/superadmins.
- Créer un nouvel admin.
- Supprimer un admin (sauf soi-même).

### 11.7 Restrictions spécifiques au rôle admin/superadmin
- Pas d'accès à la fonctionnalité **Amis**.
- Pas d'accès aux **Réservations** (ne peut pas réserver de trajet).
- Pas d'accès à "Mes trajets" / "Publier un trajet" / tableau de bord conducteur (ne peut pas publier de trajet).
- Garde la **messagerie** (canal de contact avec les utilisateurs) et la visualisation des trajets.

## 12. Sécurité & Infrastructure

- **JWT** signé (7 jours) + vérification du statut du compte en base à chaque requête (révocation immédiate).
- **Helmet** : en-têtes de sécurité HTTP (anti-clickjacking, nosniff, masquage de la stack technique...).
- **Rate-limiting** global (300 req/15 min) + limite spécifique anti-spam sur les signalements.
- **bcrypt** pour le hachage des mots de passe (jamais stockés ni affichés en clair).
- **Logs d'accès** (morgan) et gestionnaire d'erreurs centralisé.
- Upload de fichiers sécurisé (Multer) pour photos/documents.
- Téléchargement de ses données / suppression de compte (RGPD) via `/privacy`.
- Communication temps réel via **Socket.io** (messages, indicateurs de frappe).

## 13. Application mobile (React Native) — état actuel

- Socle technique en place : navigation, contexte d'authentification, service API, saisie de code OTP, intégration carte (Google Maps).
- Fonctionnalités métier (trajets, réservations, etc.) pas encore portées — actuellement axé sur le flux d'authentification.

---

## Points faibles restants / fonctionnalités non traitées (hors Lot 1)

À traiter dans un futur lot, nécessitent des services/comptes externes ou un chantier dédié :

- **Paiement en ligne** (Stripe/CMI), remboursement, commission plateforme.
- **Vérification d'identité automatisée** (OCR, liveness check) sur les documents CIN/permis.
- **Notifications push** (FCM mobile, Web Push navigateur) — actuellement in-app uniquement.
- **Itinéraires avec étapes intermédiaires** (montées/descentes partielles).
- **Application mobile** : portage des fonctionnalités métier (trajets, réservations, messagerie...).
- **API publique / webhooks** pour intégrations tierces.
