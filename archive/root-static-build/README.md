# Root Static Build Archive

These files were previously generated static frontend artifacts at the repository root.

For GitHub Pages deployment, use build output from:

- `restuarant-frontend/dist/app/browser`

Recommended deploy flow:

1. Run `npm run build --prefix restuarant-frontend`.
2. Publish only `restuarant-frontend/dist/app/browser` to GitHub Pages (or `gh-pages` branch).

This archive is kept only as backup and is not required for normal frontend development.
