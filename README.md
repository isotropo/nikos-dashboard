# Nikos Dashboard

React dashboard for exploring income gaps, work feasibility, and scenario-based planning.

## Scripts

### `npm start`

Runs the app locally in development mode at `http://localhost:3000`.

### `npm test`

Runs the test suite.

### `npm run build`

Builds the production bundle into `build/`.

## Netlify Deployment

This repo is configured for Netlify with:

- [netlify.toml](/Users/nikosstroubos/dev/NSQ/nikos-dashboard/netlify.toml)
- [public/_redirects](/Users/nikosstroubos/dev/NSQ/nikos-dashboard/public/_redirects)

Recommended Netlify settings:

- Build command: `npm run build`
- Publish directory: `build`

Deploy steps:

1. Push your branch to GitHub.
2. In Netlify, choose `Add new site` -> `Import an existing project`.
3. Connect GitHub and select this repository.
4. Confirm the build command is `npm run build`.
5. Confirm the publish directory is `build`.
6. Deploy the site.

The redirect rule is included so SPA routes can resolve to `index.html` if client-side routing is added later.
