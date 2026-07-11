import {
  assertConnectorManifest,
  type ConnectorManifest,
  type ConnectorManifestStatus,
} from "./manifest";
import type { MusicConnectorCapability } from "./connector";

export interface ConnectorManifestQuery {
  status?: ConnectorManifestStatus;
  capability?: MusicConnectorCapability;
  publisher?: string;
  keyword?: string;
}

export class ConnectorManifestRegistry {
  private readonly manifests = new Map<string, ConnectorManifest>();

  constructor(manifests: readonly ConnectorManifest[] = []) {
    for (const manifest of manifests) this.add(manifest);
  }

  add(manifest: ConnectorManifest): void {
    assertConnectorManifest(manifest);
    if (this.manifests.has(manifest.id)) {
      throw new Error(`Connector manifest "${manifest.id}" is already registered`);
    }
    this.manifests.set(manifest.id, structuredClone(manifest));
  }

  replace(manifest: ConnectorManifest): void {
    assertConnectorManifest(manifest);
    if (!this.manifests.has(manifest.id)) {
      throw new Error(`Connector manifest "${manifest.id}" is not registered`);
    }
    this.manifests.set(manifest.id, structuredClone(manifest));
  }

  remove(id: string): boolean {
    return this.manifests.delete(id);
  }

  get(id: string): ConnectorManifest | null {
    const manifest = this.manifests.get(id);
    return manifest ? structuredClone(manifest) : null;
  }

  list(query: ConnectorManifestQuery = {}): ConnectorManifest[] {
    const keyword = query.keyword?.trim().toLocaleLowerCase();
    return Array.from(this.manifests.values())
      .filter(manifest => query.status === undefined || manifest.status === query.status)
      .filter(manifest => query.capability === undefined || manifest.capabilities.includes(query.capability))
      .filter(manifest => query.publisher === undefined || manifest.publisher.name === query.publisher)
      .filter(manifest => keyword === undefined || [
        manifest.id,
        manifest.name,
        manifest.description,
        manifest.publisher.name,
        ...manifest.tags ?? [],
      ].some(value => value.toLocaleLowerCase().includes(keyword)))
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(manifest => structuredClone(manifest));
  }
}
