# OpenSpec: MusicStore Connector Registry

- Spec-ID: `music-store-registry-openspec`
- Version: `3.2.0`
- Status: `Active`
- Last-Updated: `2026-07-12`

## Scope

MusicStore is the public registry, submission, validation, discovery, and
distribution metadata layer for independently released `MusicConnect-*`
implementations.

MusicStore owns:

- the versioned connector manifest schema;
- validation rules for submitted manifests;
- the curated source registry under `registry/manifests/`;
- deterministic generation of `dist/registry/index.json`;
- a typed in-memory manifest registry for hosts and third-party tooling;
- submission guidance and CI checks for registry changes.

MusicStore does not own connector protocol types or concrete platform source.
The protocol belongs to `MusicConnect`; implementations remain in independent
`MusicConnect-*` repositories.

Long-form documentation is published by `DancingMusic/docs` at
`https://dancingmusic.github.io/docs/ecosystem/stores`. This repository keeps
the schema and registry source of truth; its legacy Pages root only redirects.

## Connector manifest v1

Each registry record MUST declare:

- `schemaVersion`: literal `1`;
- `id`: stable lower-case identifier;
- `name`, `description`, `publisher`, and SPDX-style `license` metadata;
- `repository`: canonical HTTPS source repository;
- `version`: immutable SemVer implementation version;
- `protocolVersion`: supported MusicConnect protocol SemVer range;
- `platforms`: one or more hosts from `web`, `desktop`, `ios`, and `android`;
- `capabilities`: only capabilities implemented by that release;
- `artifact`: immutable HTTPS ESM entry URL and optional SHA-256 integrity;
- `artifact.mirrors`: optional pinned `global` and `china` mirrors. The existing
  `artifact.url` remains canonical for manifest-v1 consumers; every mirror MUST
  serve identical bytes covered by the single `artifact.integrity` value;
- optional `releaseNotesUrl` and `publishedAt`: the HTTPS release notes and the
  implementation release timestamp used by update UI. `updatedAt` remains the
  registry-record audit timestamp;
- `status`: `active`, `deprecated`, or `unlisted`;
- `submittedAt` and `updatedAt`: ISO-8601 timestamps.

Mirror URLs are subject to the same HTTPS, immutable-version, and no-floating-
branch rules as the canonical artifact URL. A manifest may declare at most one
mirror for each region.

Optional `homepage`, `permissions`, and `tags` fields support discovery and
host review. Unknown fields are rejected so typos cannot silently enter the
distribution index.

### Mobile platform declarations

`ios` and `android` are native-host declarations, not aliases for `web`.
A release MAY declare either mobile platform only after review confirms that:

- its published ESM artifact uses browser/Capacitor-compatible runtime APIs;
- its required network origins and media URLs are usable from the native host;
- it does not depend on Electron, desktop cookie capture, or a desktop-only
  credential handoff;
- its advertised login and configuration path is implemented by that host.

Anonymous connectors that require a user-operated gateway are not considered
mobile-ready merely because they call `fetch`; the gateway configuration and
mobile user experience must be validated separately. A connector that lacks
evidence for a native host MUST omit that host from `platforms`.

The initial audited mobile set is intentionally limited to `itunes`,
`internet-archive`, and `radio-browser`. The self-hosted-gateway variants for
NetEase, QQ Music, and KuGou, plus the token-based Spotify account variant,
remain `web`/`desktop` until their mobile configuration or authorization flow
is implemented and tested.

## Registry behavior

- Manifest IDs are unique.
- A manifest is validated before it can be added or replaced.
- Replacing a record MUST keep the same `id`.
- Discovery can filter by status, capability, publisher, and keyword.
- Generated entries are sorted by `id` for reproducible output.
- `dist/registry/index.json` includes the schema version, generation metadata,
  and the validated connector list. Generated output MUST NOT contain secrets.

## Submission and distribution

1. A connector is developed, tested, tagged, and distributed independently.
2. The author adds or updates one JSON manifest in `registry/manifests/`.
3. `npm run validate:registry` validates every source record.
4. `npm run build` builds the TypeScript package and regenerates the public
   distribution index.
5. Reviewers verify repository ownership, permissions, immutable artifact URL,
   declared capabilities, license, and protocol compatibility.

Registry acceptance is metadata curation, not permission to copy implementation
source into MusicStore.

## Compatibility

The existing public connector runtime API remains exported for current hosts
and connector implementations:

- `MusicConnector` and related connector/login/playlist types;
- `MusicConnectorRegistry` with `register`, `unregister`, `activate`, `active`,
  `get`, `list`, and `dispose`;
- `MusicStoreClient` and legacy track/order types.

These compatibility exports are not the Store's new domain model and MUST NOT
be removed without a separate major-version migration through `MusicConnect`
and the host.

## MUST

- Build without a host checkout.
- Expose public TypeScript APIs only through `src/index.ts`.
- Validate source manifests in CI before publishing generated output.
- Reject undeclared platform values and duplicate platform entries.
- Use pinned version URLs for distributable connector artifacts.
- Keep generated output deterministic apart from explicit generation metadata.
- Preserve the existing connector registry public API during this migration.

## MUST NOT

- Contain concrete connector implementation source.
- redefine platform-specific credentials or login UI;
- store tokens, cookies, signing keys, or other credentials;
- treat mutable branch URLs as production distribution artifacts;
- absorb MusicConnect protocol ownership into this repository.

## Release

1. Update OpenSpec, README, source manifests, and tests.
2. Run `npm run check`.
3. Inspect `dist/registry/index.json`.
4. Version and publish the package and registry output together.
