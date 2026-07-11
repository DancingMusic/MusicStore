import type { MusicConnectorCapability } from "./connector";

export const CONNECTOR_MANIFEST_SCHEMA_VERSION = 1 as const;

export type ConnectorManifestStatus = "active" | "deprecated" | "unlisted";

export interface ConnectorManifestPublisher {
  name: string;
  url?: string;
}

export interface ConnectorManifestArtifact {
  url: string;
  format: "esm";
  integrity?: `sha256-${string}`;
}

export interface ConnectorManifestPermissions {
  /** Network origins the connector implementation may contact at runtime. */
  networkOrigins?: string[];
  /** Whether the connector asks the host to coordinate an account login flow. */
  account?: boolean;
}

export interface ConnectorManifest {
  schemaVersion: typeof CONNECTOR_MANIFEST_SCHEMA_VERSION;
  id: string;
  name: string;
  description: string;
  publisher: ConnectorManifestPublisher;
  repository: string;
  homepage?: string;
  license: string;
  version: string;
  protocolVersion: string;
  capabilities: MusicConnectorCapability[];
  artifact: ConnectorManifestArtifact;
  permissions?: ConnectorManifestPermissions;
  tags?: string[];
  status: ConnectorManifestStatus;
  submittedAt: string;
  updatedAt: string;
}

export type ConnectorManifestIssueCode =
  | "invalid_type"
  | "missing_field"
  | "unknown_field"
  | "invalid_value"
  | "duplicate_value";

export interface ConnectorManifestIssue {
  path: string;
  code: ConnectorManifestIssueCode;
  message: string;
}

export interface ConnectorManifestValidationResult {
  valid: boolean;
  issues: ConnectorManifestIssue[];
}

export class ConnectorManifestValidationError extends Error {
  readonly issues: ConnectorManifestIssue[];

  constructor(issues: ConnectorManifestIssue[]) {
    super(issues.map(issue => `${issue.path}: ${issue.message}`).join("; "));
    this.name = "ConnectorManifestValidationError";
    this.issues = issues;
  }
}

const CAPABILITIES = new Set<MusicConnectorCapability>([
  "search",
  "stream",
  "lyrics",
  "playlist",
  "login",
  "user-library",
  "recommendations",
]);
const STATUSES = new Set<ConnectorManifestStatus>(["active", "deprecated", "unlisted"]);
const TOP_LEVEL_FIELDS = new Set([
  "schemaVersion", "id", "name", "description", "publisher", "repository",
  "homepage", "license", "version", "protocolVersion", "capabilities",
  "artifact", "permissions", "tags", "status", "submittedAt", "updatedAt",
]);
const PUBLISHER_FIELDS = new Set(["name", "url"]);
const ARTIFACT_FIELDS = new Set(["url", "format", "integrity"]);
const PERMISSION_FIELDS = new Set(["networkOrigins", "account"]);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const SEMVER_RANGE_PATTERN = /^(?:[~^]|>=?|<=?)?\s*(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:\s+-\s+(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*))?$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function hasUnknownFields(
  value: Record<string, unknown>,
  allowed: Set<string>,
  path: string,
  issues: ConnectorManifestIssue[],
): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      issues.push({ path: `${path}.${key}`, code: "unknown_field", message: "field is not allowed" });
    }
  }
}

function requireString(
  value: Record<string, unknown>,
  key: string,
  issues: ConnectorManifestIssue[],
  path = "$",
): string | undefined {
  const field = value[key];
  if (field === undefined) {
    issues.push({ path: `${path}.${key}`, code: "missing_field", message: "field is required" });
    return undefined;
  }
  if (typeof field !== "string" || field.trim() === "") {
    issues.push({ path: `${path}.${key}`, code: "invalid_type", message: "must be a non-empty string" });
    return undefined;
  }
  return field;
}

function validateOptionalHttpsUrl(value: unknown, path: string, issues: ConnectorManifestIssue[]): void {
  if (value !== undefined && (typeof value !== "string" || !isHttpsUrl(value))) {
    issues.push({ path, code: "invalid_value", message: "must be an HTTPS URL" });
  }
}

export function validateConnectorManifest(value: unknown): ConnectorManifestValidationResult {
  const issues: ConnectorManifestIssue[] = [];
  if (!isRecord(value)) {
    return { valid: false, issues: [{ path: "$", code: "invalid_type", message: "must be an object" }] };
  }

  hasUnknownFields(value, TOP_LEVEL_FIELDS, "$", issues);
  if (value.schemaVersion === undefined) {
    issues.push({ path: "$.schemaVersion", code: "missing_field", message: "field is required" });
  } else if (value.schemaVersion !== CONNECTOR_MANIFEST_SCHEMA_VERSION) {
    issues.push({ path: "$.schemaVersion", code: "invalid_value", message: "must equal 1" });
  }

  const id = requireString(value, "id", issues);
  if (id && !ID_PATTERN.test(id)) {
    issues.push({ path: "$.id", code: "invalid_value", message: "must be a lower-case kebab-case identifier" });
  }
  requireString(value, "name", issues);
  requireString(value, "description", issues);
  requireString(value, "license", issues);

  const repository = requireString(value, "repository", issues);
  if (repository && !isHttpsUrl(repository)) {
    issues.push({ path: "$.repository", code: "invalid_value", message: "must be an HTTPS URL" });
  }
  validateOptionalHttpsUrl(value.homepage, "$.homepage", issues);

  const version = requireString(value, "version", issues);
  if (version && !SEMVER_PATTERN.test(version)) {
    issues.push({ path: "$.version", code: "invalid_value", message: "must be a SemVer version without a v prefix" });
  }
  const protocolVersion = requireString(value, "protocolVersion", issues);
  if (protocolVersion && !SEMVER_RANGE_PATTERN.test(protocolVersion)) {
    issues.push({ path: "$.protocolVersion", code: "invalid_value", message: "must be a supported simple SemVer range" });
  }

  if (!isRecord(value.publisher)) {
    issues.push({ path: "$.publisher", code: value.publisher === undefined ? "missing_field" : "invalid_type", message: "must be an object" });
  } else {
    hasUnknownFields(value.publisher, PUBLISHER_FIELDS, "$.publisher", issues);
    requireString(value.publisher, "name", issues, "$.publisher");
    validateOptionalHttpsUrl(value.publisher.url, "$.publisher.url", issues);
  }

  if (!Array.isArray(value.capabilities) || value.capabilities.length === 0) {
    issues.push({ path: "$.capabilities", code: value.capabilities === undefined ? "missing_field" : "invalid_type", message: "must be a non-empty array" });
  } else {
    const seen = new Set<string>();
    value.capabilities.forEach((capability, index) => {
      if (typeof capability !== "string" || !CAPABILITIES.has(capability as MusicConnectorCapability)) {
        issues.push({ path: `$.capabilities[${index}]`, code: "invalid_value", message: "is not a supported connector capability" });
      } else if (seen.has(capability)) {
        issues.push({ path: `$.capabilities[${index}]`, code: "duplicate_value", message: "capability is duplicated" });
      }
      if (typeof capability === "string") seen.add(capability);
    });
  }

  if (!isRecord(value.artifact)) {
    issues.push({ path: "$.artifact", code: value.artifact === undefined ? "missing_field" : "invalid_type", message: "must be an object" });
  } else {
    hasUnknownFields(value.artifact, ARTIFACT_FIELDS, "$.artifact", issues);
    const url = requireString(value.artifact, "url", issues, "$.artifact");
    if (url && !isHttpsUrl(url)) issues.push({ path: "$.artifact.url", code: "invalid_value", message: "must be an HTTPS URL" });
    if (url && version && (!url.includes(version) || /@(main|master|head)(?:\/|$)/i.test(url))) {
      issues.push({ path: "$.artifact.url", code: "invalid_value", message: "must identify the immutable manifest version" });
    }
    if (value.artifact.format !== "esm") issues.push({ path: "$.artifact.format", code: "invalid_value", message: "must equal esm" });
    if (value.artifact.integrity !== undefined && (typeof value.artifact.integrity !== "string" || !/^sha256-[A-Za-z0-9+/=]+$/.test(value.artifact.integrity))) {
      issues.push({ path: "$.artifact.integrity", code: "invalid_value", message: "must be an SRI sha256 value" });
    }
  }

  if (value.permissions !== undefined) {
    if (!isRecord(value.permissions)) {
      issues.push({ path: "$.permissions", code: "invalid_type", message: "must be an object" });
    } else {
      hasUnknownFields(value.permissions, PERMISSION_FIELDS, "$.permissions", issues);
      if (value.permissions.account !== undefined && typeof value.permissions.account !== "boolean") {
        issues.push({ path: "$.permissions.account", code: "invalid_type", message: "must be a boolean" });
      }
      if (value.permissions.networkOrigins !== undefined) {
        if (!Array.isArray(value.permissions.networkOrigins)) {
          issues.push({ path: "$.permissions.networkOrigins", code: "invalid_type", message: "must be an array" });
        } else {
          value.permissions.networkOrigins.forEach((origin, index) => {
            if (typeof origin !== "string" || !isHttpsUrl(origin)) {
              issues.push({ path: `$.permissions.networkOrigins[${index}]`, code: "invalid_value", message: "must be an HTTPS origin" });
            }
          });
        }
      }
    }
  }

  if (value.tags !== undefined && (!Array.isArray(value.tags) || value.tags.some(tag => typeof tag !== "string" || tag.trim() === ""))) {
    issues.push({ path: "$.tags", code: "invalid_type", message: "must be an array of non-empty strings" });
  }

  if (typeof value.status !== "string" || !STATUSES.has(value.status as ConnectorManifestStatus)) {
    issues.push({ path: "$.status", code: value.status === undefined ? "missing_field" : "invalid_value", message: "must be active, deprecated, or unlisted" });
  }

  for (const field of ["submittedAt", "updatedAt"] as const) {
    const timestamp = requireString(value, field, issues);
    if (timestamp && (Number.isNaN(Date.parse(timestamp)) || !timestamp.includes("T"))) {
      issues.push({ path: `$.${field}`, code: "invalid_value", message: "must be an ISO-8601 timestamp" });
    }
  }
  if (typeof value.submittedAt === "string" && typeof value.updatedAt === "string" && Date.parse(value.updatedAt) < Date.parse(value.submittedAt)) {
    issues.push({ path: "$.updatedAt", code: "invalid_value", message: "must not be earlier than submittedAt" });
  }

  return { valid: issues.length === 0, issues };
}

export function assertConnectorManifest(value: unknown): asserts value is ConnectorManifest {
  const result = validateConnectorManifest(value);
  if (!result.valid) throw new ConnectorManifestValidationError(result.issues);
}
