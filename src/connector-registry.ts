import type { MusicConnector } from "./connector";

export class MusicConnectorRegistry {
  private connectors = new Map<string, MusicConnector>();
  private activeId: string | null = null;

  async register(connector: MusicConnector, config?: Record<string, unknown>): Promise<void> {
    if (this.connectors.has(connector.meta.id)) {
      throw new Error(`Connector "${connector.meta.id}" is already registered`);
    }
    if (connector.init) {
      await connector.init(config);
    }
    this.connectors.set(connector.meta.id, connector);
  }

  unregister(connectorId: string): void {
    const connector = this.connectors.get(connectorId);
    if (!connector) return;
    if (this.activeId === connectorId) {
      this.activeId = null;
    }
    connector.dispose?.();
    this.connectors.delete(connectorId);
  }

  activate(connectorId: string): void {
    if (!this.connectors.has(connectorId)) {
      throw new Error(`Connector "${connectorId}" is not registered`);
    }
    this.activeId = connectorId;
  }

  get active(): MusicConnector | null {
    if (!this.activeId) return null;
    return this.connectors.get(this.activeId) ?? null;
  }

  get(connectorId: string): MusicConnector | null {
    return this.connectors.get(connectorId) ?? null;
  }

  list(): MusicConnector[] {
    return Array.from(this.connectors.values());
  }

  dispose(): void {
    for (const connector of this.connectors.values()) {
      connector.dispose?.();
    }
    this.connectors.clear();
    this.activeId = null;
  }
}
