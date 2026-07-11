import { describe, expect, it } from "vitest";
import {
  assertConnectorManifest,
  ConnectorManifestRegistry,
  ConnectorManifestValidationError,
  validateConnectorManifest,
  type ConnectorManifest,
} from "../index";

function manifest(id = "example"): ConnectorManifest {
  return {
    schemaVersion: 1,
    id,
    name: "Example connector",
    description: "A connector used by the registry test suite.",
    publisher: { name: "Example publisher", url: "https://example.com" },
    repository: `https://github.com/example/${id}`,
    homepage: "https://example.com/connector",
    license: "MIT",
    version: "1.2.3",
    protocolVersion: ">=0.1.0",
    capabilities: ["search", "stream"],
    artifact: {
      url: `https://cdn.example.com/${id}@v1.2.3/index.js`,
      format: "esm",
    },
    permissions: { networkOrigins: ["https://api.example.com"] },
    tags: ["example"],
    status: "active",
    submittedAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-12T00:00:00.000Z",
  };
}

describe("connector manifest validation", () => {
  it("accepts a complete v1 manifest", () => {
    expect(validateConnectorManifest(manifest())).toEqual({ valid: true, issues: [] });
    expect(() => assertConnectorManifest(manifest())).not.toThrow();
  });

  it("accepts pinned regional mirrors and release metadata", () => {
    const value = manifest();
    value.artifact.integrity = "sha256-YWJj";
    value.artifact.mirrors = [
      { region: "global", url: "https://global.example.com/example@v1.2.3/index.js" },
      { region: "china", url: "https://china.example.com/example@v1.2.3/index.js" },
    ];
    value.releaseNotesUrl = "https://example.com/releases/1.2.3";
    value.publishedAt = "2026-07-10T00:00:00.000Z";
    expect(validateConnectorManifest(value)).toEqual({ valid: true, issues: [] });
  });

  it("requires integrity and unique regions for mirrors", () => {
    const value = manifest();
    value.artifact.mirrors = [
      { region: "china", url: "https://one.example.com/example@v1.2.3/index.js" },
      { region: "china", url: "https://two.example.com/example@v1.2.3/index.js" },
    ];
    const paths = validateConnectorManifest(value).issues.map(issue => issue.path);
    expect(paths).toContain("$.artifact.integrity");
    expect(paths).toContain("$.artifact.mirrors[1].region");
  });

  it("rejects a floating mirror branch", () => {
    const value = manifest();
    value.artifact.integrity = "sha256-YWJj";
    value.artifact.mirrors = [{ region: "global", url: "https://cdn.example.com/example@main/index.js" }];
    expect(validateConnectorManifest(value).issues.some(issue => issue.path === "$.artifact.mirrors[0].url")).toBe(true);
  });

  it("reports all actionable validation issues", () => {
    const invalid = {
      ...manifest(),
      id: "Bad ID",
      repository: "http://example.com/repository",
      capabilities: ["search", "search", "teleport"],
      artifact: { url: "https://cdn.example.com/example@main/index.js", format: "esm" },
      extra: true,
    };
    const result = validateConnectorManifest(invalid);

    expect(result.valid).toBe(false);
    expect(result.issues.map(issue => issue.path)).toEqual(expect.arrayContaining([
      "$.id",
      "$.repository",
      "$.artifact.url",
      "$.capabilities[1]",
      "$.capabilities[2]",
      "$.extra",
    ]));
    expect(() => assertConnectorManifest(invalid)).toThrow(ConnectorManifestValidationError);
  });
});

describe("ConnectorManifestRegistry", () => {
  it("sorts records and filters discovery fields", () => {
    const spotify: ConnectorManifest = { ...manifest("spotify"), publisher: { name: "DancingMusic" }, capabilities: ["search", "playlist"], tags: ["preview"] };
    const radio: ConnectorManifest = { ...manifest("radio"), publisher: { name: "Community" }, capabilities: ["search", "stream"], tags: ["live"] };
    const registry = new ConnectorManifestRegistry();
    registry.add(spotify);
    registry.add(radio);

    expect(registry.list().map(item => item.id)).toEqual(["radio", "spotify"]);
    expect(registry.list({ capability: "playlist" }).map(item => item.id)).toEqual(["spotify"]);
    expect(registry.list({ publisher: "Community" }).map(item => item.id)).toEqual(["radio"]);
    expect(registry.list({ keyword: "PREVIEW" }).map(item => item.id)).toEqual(["spotify"]);
  });

  it("rejects duplicate IDs and requires an existing record for replacement", () => {
    const registry = new ConnectorManifestRegistry([manifest()]);
    expect(() => registry.add(manifest())).toThrow("already registered");
    expect(() => registry.replace(manifest("missing"))).toThrow("not registered");
  });

  it("returns defensive copies", () => {
    const registry = new ConnectorManifestRegistry([manifest()]);
    const copy = registry.get("example");
    if (!copy) throw new Error("expected manifest");
    copy.name = "Mutated";
    expect(registry.get("example")?.name).toBe("Example connector");
  });
});
