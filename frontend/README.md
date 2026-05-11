# 📱 Frontend React Native - Application Covoiturage IA

Application mobile React Native avec Expo pour une plateforme de covoiturage intelligente.

## ✨ Fonctionnalités implémentées

- ✅ Page de connexion (Login)
- ✅ Page d'inscription (Register)
- ✅ Page d'accueil moderne et attractive
- ✅ Navigation automatique selon l'état d'authentification
- ✅ Mock de l'authentification (pas de backend requis pour tester)
- ✅ UI moderne et professionnelle

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer l'application

```bash
npm start
```

Un QR code s'affichera dans le terminal.

### 3. Tester sur votre téléphone

#### Sur iOS :
1. Installez l'app **Expo Go** depuis l'App Store
2. Ouvrez l'appareil photo et scannez le QR code
3. L'app se charge automatiquement

#### Sur Android :
1. Installez l'app **Expo Go** depuis le Play Store
2. Ouvrez Expo Go et scannez le QR code
3. L'app se charge automatiquement

## 🎯 Utilisation

### Tester l'authentification

L'authentification est **mockée** (simulée), vous n'avez pas besoin de backend.

#### Pour se connecter :
- Email : n'importe quel email
- Mot de passe : n'importe quel mot de passe

Cliquez sur "Se connecter" et vous serez automatiquement redirigé vers la page d'accueil !

#### Pour s'inscrire :
- Remplissez tous les champs
- Le mot de passe doit faire au moins 8 caractères
- Les mots de passe doivent correspondre
- Cliquez sur "S'inscrire"

## 📂 Structure du projet

```
frontend/
├── App.tsx                          # Point d'entrée
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Configuration navigation
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx      # Page connexion
│   │   │   └── RegisterScreen.tsx   # Page inscription
│   │   └── Home/
│   │       └── HomeScreen.tsx       # Page d'accueil
│   └── store/
│       └── authStore.ts             # State management (Zustand)
├── package.json
└── README.md
```

## 🎨 Design

L'application utilise un design moderne avec :
- **Couleurs** : Bleu (#007AFF), Vert (#34C759), Orange (#FF9500)
- **Typographie** : System fonts (SF Pro iOS, Roboto Android)
- **Composants** : Cards avec ombres, boutons arrondis, animations
- **Layout** : Responsive, adaptatif iOS/Android

## 📱 Écrans

### 1. Login Screen
- Formulaire email + mot de passe
- Indicateur de chargement
- Lien vers inscription
- Lien "Mot de passe oublié" (non implémenté)

### 2. Register Screen
- Formulaire complet (prénom, nom, email, mot de passe)
- Validation des champs
- Confirmation mot de passe
- Lien vers connexion

### 3. Home Screen
- Header avec avatar utilisateur
- Barre de recherche
- Grid de services (Rechercher, Publier, Messages, Avis)
- Liste des trajets populaires avec :
  - Ville départ/arrivée
  - Date et heure
  - Prix
  - Info conducteur + note
  - Bouton réserver
- Statistiques (15K+ trajets, 5K+ conducteurs, 4.8 note)
- Bouton déconnexion

## 🔧 Technologies

- **React Native** : Framework mobile
- **Expo** : Toolchain développement
- **TypeScript** : Typage statique
- **React Navigation** : Navigation entre écrans
- **Zustand** : State management léger
- **React Native Paper** : Composants UI (non utilisés pour l'instant)

## 🚧 Prochaines étapes

Une fois le backend prêt :

1. **Connecter au backend** :
   - Remplacer les mock dans `authStore.ts`
   - Créer un client API (axios)
   - Gérer les tokens JWT
   
2. **Ajouter les écrans manquants** :
   - Recherche de trajets
   - Détail d'un trajet
   - Publier un trajet
   - Mes réservations
   - Messages
   - Profil utilisateur
   
3. **Fonctionnalités avancées** :
   - Notifications push
   - Géolocalisation
   - Chat en temps réel
   - Upload de photos

## 🐛 Dépannage

### Problème : Expo ne démarre pas
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

### Problème : QR code ne fonctionne pas
- Vérifiez que votre téléphone et PC sont sur le même réseau WiFi
- Désactivez les VPN
- Utilisez le tunnel mode : `expo start --tunnel`

### Problème : L'app crash au démarrage
```bash
# Clear cache
expo start -c
```

## 📞 Support

Pour toute question, consultez :
- [Documentation Expo](https://docs.expo.dev)
- [Documentation React Native](https://reactnative.dev)
- [Documentation React Navigation](https://reactnavigation.org)

## 📝 Notes

Cette version est une **démo frontend** sans backend.
L'authentification est simulée pour permettre de tester l'interface.
Toutes les données affichées sont des données fictives (mock data).

**Bon développement ! 🚀**
