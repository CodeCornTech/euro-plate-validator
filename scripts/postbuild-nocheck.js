// scripts/postbuild-nocheck.js
// Aggiunge // @ts-nocheck in testa a tutti i .js in dist/
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const distDir = resolve(__dirname, "..", "dist");

const banner = `// @ts-nocheck
/* This file is generated. Types are available in index.d.ts. */\n`;

/**
 * Walks through a directory recursively and yields file paths.
 * @param {string} dir
 * @returns {AsyncGenerator<string>}
 */
async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(p);
    } else if (e.isFile()) {
      yield p;
    }
  }
}

async function run() {
  try {
    const d = await stat(distDir);
    if (!d.isDirectory()) {
      console.error("dist/ is not a directory");
      process.exit(1);
    }
  } catch {
    console.error("dist/ not found. Did you run tsc?");
    process.exit(1);
  }

  for await (const file of walk(distDir)) {
    if (!file.endsWith(".js")) continue;
    const src = await readFile(file, "utf8");
    if (src.startsWith("// @ts-nocheck")) continue;
    await writeFile(file, banner + src, "utf8");
    console.log(`prepended ts-nocheck: ${file}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
