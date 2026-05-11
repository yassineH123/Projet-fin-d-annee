Backend scaffold for the mobile app frontend.

Quick start:

1. Open a terminal in `backend` folder.
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

By default the server runs on `http://localhost:4000`.

Available endpoints (mock):

- POST /auth/login { email, password }
- POST /auth/register { email, password, firstName, lastName }
- POST /auth/change-password { email, currentPassword, newPassword }
- GET /users/:id
- GET /trips
- POST /trips { from, to, date, price, driver, seats }
- GET /privacy/export
- POST /privacy/delete { email }

This is a minimal mock backend to run locally and prototype the front-end integration. It uses a simple JSON store at `data/store.json`.
