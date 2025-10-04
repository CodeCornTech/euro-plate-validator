import { readFileSync, writeFileSync } from "fs";
const js = readFileSync("./dist/index.js","utf8")
  .replace(/^export /gm, "")
  .replace(/export\{[^\}]+\};?\s*$/m, "");
writeFileSync("./dist/index.cjs", 
`"use strict";
${js}
module.exports = { validatePlate, RX, normalize };
`);
