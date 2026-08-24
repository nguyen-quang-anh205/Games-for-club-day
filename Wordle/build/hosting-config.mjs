import { readFile } from "node:fs/promises";

export async function loadHostingBindings(configPath) {
  try {
    const config = JSON.parse(await readFile(configPath, "utf8"));
    return {
      d1: config.d1 ?? null,
      r2: config.r2 ?? null,
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { d1: null, r2: null };
    }
    throw error;
  }
}
