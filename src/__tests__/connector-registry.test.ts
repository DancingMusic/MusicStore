import { describe, it, expect, vi, beforeEach } from "vitest";
import { MusicConnectorRegistry } from "../connector-registry";
import type { MusicConnector } from "../connector";

function createMockConnector(id = "test"): MusicConnector {
  return {
    meta: {
      id,
      name: `${id} connector`,
      version: "1.0.0",
      capabilities: ["search", "stream"],
    },
    init: vi.fn(),
    dispose: vi.fn(),
    search: vi.fn().mockResolvedValue({ tracks: [], total: 0, page: 1, pageSize: 20 }),
    getTrack: vi.fn().mockResolvedValue(null),
    getStreamUrl: vi.fn().mockResolvedValue(null),
  };
}

describe("MusicConnectorRegistry", () => {
  let registry: MusicConnectorRegistry;

  beforeEach(() => {
    registry = new MusicConnectorRegistry();
  });

  it("registers a connector and calls init", async () => {
    const connector = createMockConnector();
    await registry.register(connector);

    expect(connector.init).toHaveBeenCalledOnce();
    expect(registry.list().length).toBe(1);
  });

  it("throws when registering duplicate id", async () => {
    const c1 = createMockConnector("dup");
    const c2 = createMockConnector("dup");

    await registry.register(c1);
    await expect(registry.register(c2)).rejects.toThrow('already registered');
  });

  it("activates a connector", async () => {
    const connector = createMockConnector();
    await registry.register(connector);

    registry.activate("test");

    expect(registry.active).toBe(connector);
  });

  it("throws when activating unregistered connector", () => {
    expect(() => registry.activate("unknown")).toThrow("not registered");
  });

  it("gets connector by id", async () => {
    const connector = createMockConnector("myconn");
    await registry.register(connector);

    expect(registry.get("myconn")).toBe(connector);
    expect(registry.get("nope")).toBeNull();
  });

  it("unregisters a connector and calls dispose", async () => {
    const connector = createMockConnector();
    await registry.register(connector);

    registry.unregister("test");

    expect(connector.dispose).toHaveBeenCalledOnce();
    expect(registry.list().length).toBe(0);
  });

  it("clears active when unregistering active connector", async () => {
    const connector = createMockConnector();
    await registry.register(connector);
    registry.activate("test");

    registry.unregister("test");

    expect(registry.active).toBeNull();
  });

  it("disposes all on dispose()", async () => {
    const c1 = createMockConnector("a");
    const c2 = createMockConnector("b");
    await registry.register(c1);
    await registry.register(c2);
    registry.activate("a");

    registry.dispose();

    expect(c1.dispose).toHaveBeenCalled();
    expect(c2.dispose).toHaveBeenCalled();
    expect(registry.list().length).toBe(0);
    expect(registry.active).toBeNull();
  });

  it("lists all registered connectors", async () => {
    await registry.register(createMockConnector("x"));
    await registry.register(createMockConnector("y"));
    await registry.register(createMockConnector("z"));

    const list = registry.list();
    expect(list.length).toBe(3);
    expect(list.map(c => c.meta.id)).toEqual(["x", "y", "z"]);
  });
});
