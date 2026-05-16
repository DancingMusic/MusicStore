# OpenSpec: MusicStoreSdk

- Spec-ID: `music-store-sdk-openspec`
- Version: `1.0.0`
- Status: `Active`
- Last-Updated: `2026-05-16`

## Scope

Defines boundaries, API surface expectations, and release policy for MusicStoreSdk.

## MUST

- Keep package independently buildable with `npm run build`.
- Keep public API stable under SemVer.
- Expose only documented exports from `src/index.ts`.

## MUST NOT

- Depend on `DancingStoreSdk` or `DancingPluginSdk` internals.
- Include host application UI/runtime code.

## Release

1. Update changelog/readme.
2. Run `npm run typecheck && npm run build`.
3. Publish version tag and package.
