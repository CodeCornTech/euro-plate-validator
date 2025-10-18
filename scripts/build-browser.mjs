// scripts/build-browser.mjs
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 🔍 Legge package.json
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8"));

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description || ""}
 * © ${new Date().getFullYear()} ${String(pkg.author || "CodeCorn™").split("<")[0].trim()}
 * License: ${pkg.license || "MIT"}
 * Build: ${new Date().toISOString()}
 */
`;

const entry = "src/index.ts";
const outdir = "dist/browser";

/** @type {import('esbuild').BuildOptions} */
const common = {
  entryPoints: [entry],
  bundle: true,
  platform: "browser",          // typed via BuildOptions
  target: ["es2018"],
  sourcemap: true,
  banner: { js: banner },
  external: []
};

/** @type {import('esbuild').BuildOptions[]} */
const variants = [
  { format: "esm",  minify: false, outfile: `${outdir}/index.esm.js` },
  { format: "esm",  minify: true,  outfile: `${outdir}/index.esm.min.js` },
  { format: "iife", minify: false, outfile: `${outdir}/index.iife.js`,      globalName: "EuroPlate" },
  { format: "iife", minify: true,  outfile: `${outdir}/index.iife.min.js`,  globalName: "EuroPlate" }
];

for (const cfg of variants) {
  await build({ ...common, ...cfg });
  console.log(`✅ Built ${cfg.outfile}`);
}

console.log("🎉 All browser bundles built with banner + sourcemaps");
