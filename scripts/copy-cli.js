import { cpSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "..", "bin", "cli.mjs");
const dst = resolve(__dirname, "..", "dist", "cli.mjs");

cpSync(src, dst, { recursive: false });
console.log("Copied bin/cli.mjs -> dist/cli.mjs");
