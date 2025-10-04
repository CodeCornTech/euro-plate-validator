import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { glob } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.substring(0, __filename.lastIndexOf("/"));

const distDir = join(__dirname, "..", "dist");

const banner = `// @ts-nocheck
/* This file is generated. Types are available in index.d.ts. */\n`;

const filesIterable = await glob(distDir + "/**/*.js", { withFileTypes: false });
const files = [];
for await (const f of filesIterable) {
  files.push(f);
}
for (const f of files) {
  const src = readFileSync(f, "utf8");
  if (!src.startsWith("// @ts-nocheck")) {
    writeFileSync(f, banner + src, "utf8");
  }
}
console.log("Added // @ts-nocheck to dist/*.js");
