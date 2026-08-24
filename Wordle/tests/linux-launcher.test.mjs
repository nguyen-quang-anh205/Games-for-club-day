import assert from "node:assert/strict";
import { access, chmod, copyFile, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("Linux launcher exposes the game to other devices on the local network", async () => {
  const launcher = path.join(projectRoot, "start.sh");
  const launcherExists = await access(launcher).then(() => true, () => false);
  assert.equal(launcherExists, true, "start.sh must exist at the project root");

  const sandbox = await mkdtemp(path.join(tmpdir(), "cyber-wordle-linux-"));
  const fakeBin = path.join(sandbox, "bin");
  const traceFile = path.join(sandbox, "npm.trace");
  await mkdir(fakeBin);
  await mkdir(path.join(sandbox, "node_modules"));
  await copyFile(launcher, path.join(sandbox, "start.sh"));

  const fakeNode = path.join(fakeBin, "node");
  const fakeNpm = path.join(fakeBin, "npm");
  const fakeHostname = path.join(fakeBin, "hostname");
  await writeFile(fakeNode, "#!/usr/bin/env bash\necho 22\n");
  await writeFile(fakeNpm, "#!/usr/bin/env bash\nprintf '%s\\n' \"$*\" >> \"$TRACE_FILE\"\n");
  await writeFile(fakeHostname, "#!/usr/bin/env bash\necho 192.168.50.12\n");
  await Promise.all([fakeNode, fakeNpm, fakeHostname].map((file) => chmod(file, 0o755)));

  const result = await run("bash", ["start.sh"], {
    cwd: sandbox,
    env: {
      ...process.env,
      PATH: `${fakeBin}:${process.env.PATH}`,
      PORT: "4999",
      TRACE_FILE: traceFile,
    },
  });

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /http:\/\/127\.0\.0\.1:4999/);
  assert.match(result.stdout, /http:\/\/192\.168\.50\.12:4999/);
  assert.equal((await readFile(traceFile, "utf8")).trim(), "run dev -- --host 0.0.0.0 --port 4999");
});

test("Linux launcher still starts when the machine does not expose a LAN address", async () => {
  const launcher = path.join(projectRoot, "start.sh");
  const sandbox = await mkdtemp(path.join(tmpdir(), "cyber-wordle-no-lan-"));
  const fakeBin = path.join(sandbox, "bin");
  const traceFile = path.join(sandbox, "npm.trace");
  await mkdir(fakeBin);
  await mkdir(path.join(sandbox, "node_modules"));
  await copyFile(launcher, path.join(sandbox, "start.sh"));

  const fakeNode = path.join(fakeBin, "node");
  const fakeNpm = path.join(fakeBin, "npm");
  const fakeHostname = path.join(fakeBin, "hostname");
  await writeFile(fakeNode, "#!/usr/bin/env bash\necho 22\n");
  await writeFile(fakeNpm, "#!/usr/bin/env bash\nprintf '%s\\n' \"$*\" >> \"$TRACE_FILE\"\n");
  await writeFile(fakeHostname, "#!/usr/bin/env bash\nexit 1\n");
  await Promise.all([fakeNode, fakeNpm, fakeHostname].map((file) => chmod(file, 0o755)));

  const result = await run("bash", ["start.sh"], {
    cwd: sandbox,
    env: {
      ...process.env,
      PATH: `${fakeBin}:${process.env.PATH}`,
      PORT: "4999",
      TRACE_FILE: traceFile,
    },
  });

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /http:\/\/127\.0\.0\.1:4999/);
  assert.equal((await readFile(traceFile, "utf8")).trim(), "run dev -- --host 0.0.0.0 --port 4999");
});
