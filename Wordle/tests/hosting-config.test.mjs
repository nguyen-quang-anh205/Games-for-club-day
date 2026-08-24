import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const configModule = await import("../build/hosting-config.mjs").catch(() => null);

test("local startup uses empty bindings when Sites metadata is absent", async () => {
  assert.ok(configModule, "the optional hosting configuration loader must exist");
  const sandbox = await mkdtemp(path.join(tmpdir(), "cyber-wordle-config-"));

  assert.deepEqual(
    await configModule.loadHostingBindings(path.join(sandbox, "missing.json")),
    { d1: null, r2: null },
  );
});

test("hosted startup preserves configured bindings", async () => {
  assert.ok(configModule, "the optional hosting configuration loader must exist");
  const sandbox = await mkdtemp(path.join(tmpdir(), "cyber-wordle-config-"));
  const configPath = path.join(sandbox, "hosting.json");
  await writeFile(configPath, JSON.stringify({ d1: "GAME_DB", r2: "GAME_FILES" }));

  assert.deepEqual(
    await configModule.loadHostingBindings(configPath),
    { d1: "GAME_DB", r2: "GAME_FILES" },
  );
});
