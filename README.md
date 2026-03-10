# Restaurant Menu and Ordering System

<div align="center">
  <p>
    <a href="https://viswakowsikk2101.github.io/Restaurant-Menu/#/menu"><strong>Live Website</strong></a>
    ·
    <a href="https://github.com/ViswakowsikK2101/Restaurant-Menu"><strong>GitHub Repository</strong></a>
  </p>
  <p>
    <img alt="Angular" src="https://img.shields.io/badge/Frontend-Angular%2021-DD0031?logo=angular&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white" />
    <img alt="Node.js" src="https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white" />
    <img alt="Express" src="https://img.shields.io/badge/API-Express-000000?logo=express&logoColor=white" />
    <img alt="Deployment" src="https://img.shields.io/badge/Deployment-GitHub%20Pages-222222?logo=githubpages&logoColor=white" />
  </p>
</div>

Modern restaurant ordering app with:
- menu browsing and filtering
- cart and checkout flow
- user registration/login
- order history and cancellation window
- production deployment with mock fallback support

## Quick Links

- Live app: `https://viswakowsikk2101.github.io/Restaurant-Menu/#/menu`
- Repository: `https://github.com/ViswakowsikK2101/Restaurant-Menu.git`
- Frontend source: `restuarant-frontend/`
- Backend source: `restaurant-backend/`

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | Angular 21, TypeScript, Angular Material, Tailwind CSS |
| Backend | Node.js, Express |
| Data | JSON files + browser localStorage (mock mode) |
| Deployment | GitHub Pages (frontend via GitHub Actions) |

## Key Features

- category and price-range based menu filtering
- lazy-loaded Angular route components
- add/remove/update cart items
- checkout with form validations
- user registration and login
- order placement, tracking, and cancellation logic
- hash-based routing for reliable static hosting

## Project Structure

```text
Restaurant-Menu/
|- restuarant-frontend/
|  |- src/
|  |- public/
|  |- angular.json
|- restaurant-backend/
|  |- controllers/
|  |- routes/
|  |- data/
|  |- server.js
|- .github/workflows/
|  |- deploy-frontend-gh-pages.yml
```

## Run Locally

### 1) Backend

```bash
cd restaurant-backend
npm install
node server.js
```

Backend starts on `http://localhost:5000`.

### 2) Frontend

```bash
cd restuarant-frontend
npm install
npm start
```

Frontend starts on `http://localhost:4200`.

## Mock Login (Deployed Mode)

When running with mock backend (default on deployed site):

- Email: `johndoe@example.com`
- Password: `john@123`

You can also register a new user directly in the app.

## API Endpoints (Backend)

- `GET /api/menu`
- `GET /api/menu/:id`
- `POST /api/orders`
- `GET /api/orders`
- `PATCH /api/orders/:id/cancel`
- `POST /api/auth/register`
- `POST /api/auth/login`

## Deployment

Frontend deployment is automated with GitHub Actions:

- Workflow file: `.github/workflows/deploy-frontend-gh-pages.yml`
- Trigger: push to `main` with frontend/workflow changes
- Target: GitHub Pages

## Notes

- Production frontend defaults to mock API mode for seamless static hosting.
- Live API can be enabled by setting `window.__APP_CONFIG__` with:
  - `apiBaseUrl`
  - `useMockBackend: false`
