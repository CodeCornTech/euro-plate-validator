#!/usr/bin/env node
// @ts-check

import { fileURLToPath, pathToFileURL } from "url";
import { dirname, resolve } from "path";

/**
 * @typedef {"car"|"motorcycle"|"any"} VehicleType
 * @typedef {{ plate: string; countries: string[]; type: VehicleType; pretty: boolean }} CLIArgs
 */

/**
 * Type guard per VehicleType.
 * @param {string} v
 * @returns {v is VehicleType}
 */
function isVehicleType(v) {
  return v === "car" || v === "motorcycle" || v === "any";
}

// Carica la build transpiled se pubblicato, altrimenti prova a caricare src (dev)
/**
 * @returns {Promise<any>}
 */
async function loadLib() {
  const here = dirname(fileURLToPath(import.meta.url));
  const dist = resolve(here, "..", "dist", "index.js");
  try {
    return await import(pathToFileURL(dist).href);
  } catch {
    const src = resolve(here, "..", "src", "index.ts"); // per dev con tsx/ts-node eventuale
    try {
      return await import(pathToFileURL(src).href);
    } catch {
      console.error("Unable to load library. Build with `npm run build`.");
      process.exit(1);
    }
  }
}

/**
 * Parser argomenti CLI.
 * Esempio: euro-plate-validator "AB 123 CD" --countries IT,FR,DE --type motorcycle --pretty
 * @param {string[]} argv
 * @returns {CLIArgs}
 */
function parseArgs(argv) {
  /** @type {CLIArgs} */
  const args = { plate: "", countries: [], type: "any", pretty: false };
  /** @type {string[]} */
  const arr = argv.slice(2);

  // prima positional = plate
  if (arr.length && !arr[0].startsWith("-")) {
    const first = arr.shift();
    if (first) args.plate = first;
  }

  while (arr.length) {
    const k = arr.shift();
    if (!k) break;

    if (k === "--countries" || k === "-c") {
      const v = arr.shift() || "";
      args.countries = v
        .split(",")
        .map(/** @param {string} s */ (s) => s.trim())
        .filter(Boolean);
    } else if (k === "--type" || k === "-t") {
      const v = (arr.shift() || "").toLowerCase();
      if (isVehicleType(v)) {
        args.type = v;
      } else {
        console.error(`Invalid --type value: ${v}. Use car|motorcycle|any`);
        process.exit(2);
      }
    } else if (k === "--pretty" || k === "-p") {
      args.pretty = true;
    } else if (k === "--help" || k === "-h") {
      printHelp();
      process.exit(0);
    } else {
      // potrebbe essere la plate se non indicata prima
      if (!args.plate && !k.startsWith("-")) {
        args.plate = k;
      } else {
        console.error(`Unknown argument: ${k}`);
        process.exit(2);
      }
    }
  }

  if (!args.plate) {
    console.error(
      'Missing plate. Example:\n  euro-plate-validator "AB 123 CD" --countries IT,FR,DE --type car'
    );
    process.exit(2);
  }
  return args;
}

function printHelp() {
  console.log(`European Plate Validator (CLI)

Usage:
  euro-plate-validator "<plate>" [--countries IT,FR,DE] [--type car|motorcycle|any] [--pretty]

Examples:
  euro-plate-validator "AB 123 CD" --countries IT --type car
  euro-plate-validator "AA 12345"  --countries IT --type motorcycle
  euro-plate-validator "AB12 CDE"  --countries UK,IE --type any --pretty
`);
}

const { validatePlate } = await loadLib();
/** @type {CLIArgs} */
const args = parseArgs(process.argv);

const result = validatePlate(args.plate, args.countries, { vehicleType: args.type });
if (args.pretty) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(JSON.stringify(result));
}

process.exit(result.isValid ? 0 : 1);
