// @ts-nocheck
import { promises as fs } from "node:fs";
import { join, basename, extname } from "node:path";
import * as esbuild from "esbuild";

const cssDir = "dist/assets/css";

async function minifyOne(file) {
  const src = await fs.readFile(file, "utf8");
  const { code, warnings } = await esbuild.transform(src, {
    loader: "css",
    minify: true,
    sourcemap: true,
    sourcefile: basename(file),
  });
  if (warnings?.length) {
    console.warn("[css:minify] warnings for", file, warnings);
  }
  const out = file.replace(/\.css$/, ".min.css");
  const map = out + ".map";
  await fs.writeFile(out, code, "utf8");
  // esbuild.transform in-line sourcemap: estrailo se serve esterno
  // Per semplicità lasciamo inline; se vuoi esterno, usa esbuild.build con outfile.
  console.log("✔ css minified:", out);
}

(async () => {
  const files = await fs.readdir(cssDir);
  const cssFiles = files.filter((f) => f.endsWith(".css") && !f.endsWith(".min.css"));
  await Promise.all(cssFiles.map((f) => minifyOne(join(cssDir, f))));
})();
