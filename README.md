# @dancingmusic/music-store

MusicStore is the standalone SDK for music catalog, connector, and client APIs.

## Install

```bash
npm install @dancingmusic/music-store
```

## Build

```bash
npm install
npm run build
```

## Quick Start

```ts
import { MusicStoreClient } from "@dancingmusic/music-store";

const client = new MusicStoreClient({
  baseUrl: "https://api.example.com",
  token: "your-token"
});

const tracks = await client.list({ page: 1, pageSize: 20 });
```

## Connector Login

Connectors that declare the `login` capability may implement the single
`login(request)` hook. Hosts render the returned actions and persist the opaque
`configPatch`, so platform cookies and tokens remain connector-owned config
rather than host-specific fields.

For `open-url` actions, connectors may add `cookieCapture` metadata. Desktop
hosts can use it to open the provider's official web page in an isolated login
window, read the allowed cookie names, and pass the cookie back through
`login({ intent: "continue", input })`. Web hosts can still render the same URL
in an iframe/modal as a fallback.

## Publish

```bash
npm publish
```

## GitHub Pages

This repository publishes a responsibility overview page from `docs/` via GitHub Actions.

- Expected URL: `https://dancingmusic.github.io/MusicStore/`
- Workflow: `.github/workflows/deploy-pages.yml`
