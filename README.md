# @dancingmusic/music-store-sdk

MusicStoreSdk is the standalone SDK for music-store domain capabilities.

## Install

```bash
npm install @dancingmusic/music-store-sdk
```

## Build

```bash
npm install
npm run build
```

## Quick Start

```ts
import { MusicStoreClient } from "@dancingmusic/music-store-sdk";

const client = new MusicStoreClient({
  baseUrl: "https://api.example.com",
  token: "your-token"
});

const tracks = await client.list({ page: 1, pageSize: 20 });
```

## Publish

```bash
npm publish
```

## GitHub Pages

This repository publishes a responsibility overview page from `docs/` via GitHub Actions.

- Expected URL: `https://dancingmusic.github.io/MusicStoreSdk/`
- Workflow: `.github/workflows/deploy-pages.yml`
