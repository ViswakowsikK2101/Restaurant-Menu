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

## GitHub Pages Deployment (Frontend) + Railway (Backend)

1. Build frontend for GitHub Pages:

```bash
npm run build -- --base-href /Restaurant-Menu/ --output-path dist/github-pages
```

2. Copy `dist/github-pages/browser/*` into repository root.
   This creates root `index.html` required by GitHub Pages.

3. In root `config.js`, set your Railway backend URL:

```js
// Example
var defaultApiBaseUrl = 'https://your-service-name.up.railway.app';
```

4. Keep `useMockBackend` as `false` for production.

## Screenshots

Add your screenshots under `docs/screenshots/` and list them here for submission.

## Component Hierarchy Diagram

See: `docs/component-hierarchy.md`
