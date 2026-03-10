# Restaurant Menu and Ordering System

Angular + TypeScript frontend with Angular Material UI and a Node/Express mock backend.

## Tech Stack

- Angular 21 (standalone components)
- TypeScript
- Angular Material
- Tailwind CSS (utility classes)
- Node.js + Express mock API

## Project Structure

- Frontend: `restuarant-frontend/`
- Backend: `restaurant-backend/`

## Run Locally

### Prerequisites

- Node.js 20+
- npm

### 1. Start Backend

From `restaurant-backend/`:

```bash
npm install
node server.js
```

Backend runs on `http://localhost:5000`.

### 2. Start Frontend

From `restuarant-frontend/`:

```bash
npm install
npm start
```

Frontend runs on `http://localhost:4200`.

## Feature Coverage

- Menu listing with category and price-range filters
- Menu detail page with route parameter (`/menu/:id`)
- Cart management (add, update quantity, remove)
- Checkout with reactive forms + validations
- Template-driven feedback form on confirmation page
- Route guard for checkout access when cart is empty
- Lazy-loaded route components (`loadComponent`)
- Custom pipe: `CategoryFilterPipe`
- Custom pipe: `PriceRangePipe`
- Custom directive: `HighlightDirective`
- Built-in pipes: `CurrencyPipe`, `DatePipe`

## Mock API Endpoints

- `GET /api/menu`
- `GET /api/menu/:id`
- `POST /api/orders`
- `GET /api/orders`

## Deployment

- Frontend is deployed automatically to GitHub Pages via
  `.github/workflows/deploy-frontend-gh-pages.yml`.
- Production URL: `https://viswakowsikk2101.github.io/Restaurant-Menu/`
- Every push to `main` that changes `restuarant-frontend/` triggers a new deploy.

### Runtime API Mode

- `public/config.js` now defaults to `useMockBackend: true` so the deployed site works
  even when backend hosting is unavailable.
- Default mock login account:
  - Email: `johndoe@example.com`
  - Password: `john@123`
- To force live backend usage in production, inject `window.__APP_CONFIG__` before
  `config.js` loads and set:
  - `apiBaseUrl` to your API URL
  - `useMockBackend` to `false`

## Screenshots

Add your screenshots under `docs/screenshots/` and list them here for submission.

## Component Hierarchy Diagram

See: `docs/component-hierarchy.md`
