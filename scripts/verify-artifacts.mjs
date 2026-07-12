import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const MAX_ARTIFACT_BYTES = 5_000_000;
const registryPath = new URL("../dist/registry/index.json", import.meta.url);

async function downloadBounded(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
    redirect: "error",
    headers: { Accept: "text/javascript,application/javascript,application/ecmascript,text/plain;q=0.8" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const declared = Number(response.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > MAX_ARTIFACT_BYTES) throw new Error("artifact exceeds 5 MB");
  if (!response.body) return Buffer.alloc(0);

  const chunks = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.byteLength;
    if (total > MAX_ARTIFACT_BYTES) throw new Error("artifact exceeds 5 MB");
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks, total);
}

const registry = JSON.parse(await readFile(registryPath, "utf8"));
if (!Array.isArray(registry.connectors)) throw new Error("generated registry has no connectors array");

for (const connector of registry.connectors) {
  const expected = connector.artifact?.integrity;
  if (typeof expected !== "string" || !/^sha256-[A-Za-z0-9+/]{43}=$/.test(expected)) {
    throw new Error(`${connector.id}: invalid or missing SHA-256 SRI`);
  }
  const urls = [connector.artifact.url, ...(connector.artifact.mirrors ?? []).map(mirror => mirror.url)];
  for (const url of urls) {
    const bytes = await downloadBounded(url);
    const actual = `sha256-${createHash("sha256").update(bytes).digest("base64")}`;
    if (actual !== expected) throw new Error(`${connector.id}: integrity mismatch for ${url}`);
    process.stdout.write(`verified ${connector.id} ${url}\n`);
  }
}
