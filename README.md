# BlablacarMaroc — Guide de démarrage

## Structure du projet

```
blablacar-maroc/
├── index.html
├── package.json          ← Frontend (React + Vite)
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx
│   └── components/
│       ├── Header.jsx / Header.css
│       ├── Hero.jsx   / Hero.css
│       ├── HowItWorks.jsx / HowItWorks.css
│       └── AuthModal.jsx / AuthModal.css
└── server/
    ├── package.json      ← Backend (Node.js + Express)
    ├── index.js
    └── .env.example
```

---

## 1. Configurer le backend Gmail

### Étape 1 — Mot de passe d'application Gmail
1. Va sur : https://myaccount.google.com/security
2. Active la **Validation en 2 étapes** (obligatoire)
3. Va dans **Mots de passe des applications**
4. Crée un mot de passe pour "Autre" → nomme-le "BlablacarMaroc"
5. Copie le mot de passe généré (format : xxxx xxxx xxxx xxxx)

### Étape 2 — Créer le fichier .env
```bash
cd server
cp .env.example .env
```
Ouvre `.env` et remplis :
```
GMAIL_USER=ton.email@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx
PORT=5000
```

---

## 2. Lancer le backend

```bash
cd server
npm install
npm run dev
```
Tu dois voir : `✅ Serveur BlablacarMaroc démarré sur http://localhost:5000`

---

## 3. Lancer le frontend

Dans un **nouveau terminal** :
```bash
cd blablacar-maroc   (le dossier racine)
npm install
npm run dev
```
Ouvre : http://localhost:5173

---

## 4. Tester le flux complet

1. Clique **Inscription**
2. Remplis le formulaire
3. Vérifie ta boîte email → tu reçois un code à 6 chiffres
4. Saisis le code dans la modal
5. Tu es connecté automatiquement
6. Clique **Connexion** → teste avec tes identifiants
