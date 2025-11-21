# Project Overview

Welcome to the **GripStore** codebase. This workspace mixes frontend assets for a customer-facing storefront with backend tooling for administrative dashboards and API services. The repository currently contains both browser-side JavaScript/CSS and Node.js backend components under the `gripstore-backend` directory.

---

## Key Paths

| Path | Description |
|---|---|
| `admin.js`, `admin.css`, `product.css`, etc. | Frontend assets powering the admin dashboard and product pages. |
| `route/` | Holds additional frontend routing/middleware scripts. |
| `gripstore-backend/` | Node.js backend service (Express + MySQL) serving API requests and authentication. |
| `.zencoder/` | Assistant metadata (you may ignore). |

---

## Backend Quick Facts

- **Entry point:** `gripstore-backend/server.js`
- **Environment variables:** Loaded from `gripstore-backend/.env`
- **Database config:** `gripstore-backend/config/database.js`
- **REST endpoints:** Located in `gripstore-backend/routes/`
- **Models:** Sequelize-style definitions in `gripstore-backend/models/`

### Running the Backend
1. `cd gripstore-backend`
2. `npm install`
3. `npm run dev` or `npm start`

---

## Frontend Quick Facts

- Plain JavaScript (no framework) controlling UI states.
- Admin dashboard logic lives in `admin.js` and related CSS.
- Cart and storefront behavior in `route/` scripts.

### Local Development Tips
- Use Live Server / static hosting to serve HTML files.
- Ensure localStorage keys (e.g., `gripstore_cart`, `gripstore_promo`) retain consistent casing.
- Keep promo codes and credentials in sync between frontend and backend.

---

## Contribution Tips

1. Keep class methods self-contained and ensure DOM query selectors exist.
2. Avoid storing sensitive secrets directly in frontend files.
3. Add inline comments for complex DOM or fetch logic.
4. Maintain consistent formatting (Prettier style, 2/4 spaces as appropriate).
5. Test key flows: cart operations, admin login, product CRUD.

---

*Last updated: 2024-12-05*