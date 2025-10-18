// scripts/test-nl.mjs
import * as Euro from "../dist/index.js"; // adattare percorso se diverso

const { validatePlate } = Euro;

const NL_valid = [
  "XT-347-S", // formato AAx999xA — reale (auto) \\                 mini cooper      ######## ok
  "T-347-SX", // formato A-999-AA — reale (auto)   KIA STONIC            /// ######## ok
  "27-JKL-8", // 99-AAA-9 — reale (auto)      bwm 3-serie #### ok
  "7-JS-502", // 9-AA-999 — reale (auto) !!!!!
  "GB-001-B", // formato AA-999-A — reale (auto, 2015 series).           Kia Rio

  "K-812-FJ", // A-999-AA — reale (auto, 2020+)                         Fiat 500

  "L-548-RV", // A-999-AA — reale (auto, 2021+)                 Ford Mustang Mach-E

  "N-229-PB", // A-999-AA — reale (auto, 2022+) !!!!!!!
  "R-641-SB", // A-999-AA — reale (auto, 2022)                  Lynk & Co 01  ######## ok
  "Z-821-ZJ", // A-999-AA — reale (auto, 2024)            !!!!!!!!
  "V-01-BBB", // commerciale (V prefix)                     Ford Transit Connect

  "T-01-BBB", // trattore/agricolo (T prefix)                 ford 2000

  "E-01-BBD", // monopattino elettrico (dal 2025)             go tulip b.v. SELANA ALPHA
  "CD-39-85", // diplomatico                                 !!!!!!!!
  "HA-64-52", // targa trade (verde, prova)                  !!!!!!!!
  "DM-405-B", // militare (gialla) !!!               !!!!!!!!
];

const NL_invalid = [
  "XT-347-SJ", // troppi caratteri → invalida
  "AA-123-AA", // formato mai usato (stile francese)
  "1-AAA-111", // triple numeri vietate (nessun 111/000)
  "GB-000-B", // doppio zero non ammesso
  "ZZ-999-ZZ", // riservata a veicoli speciali / vietata all’uso comune
  "PVV-01-B", // bandita (partito politico)
  "KKK-12-B", // bandita (Ku Klux Klan)
  "NSB-82-B", // bandita (nazista)
  "GVD-13-X", // bandita (bestemmia o insulto in NL)
  "SD-345-D", // vietata per riferimento storico (Sicherheitsdienst)
  "SS-666-Z", // vietata per riferimento storico
  "BBB-01-B", // vietata (partito politico BBB)
  "M-123-AA", // formato motociclo applicato ad auto (invalido)
  "00-AA-00", // formato oldtimer, ma troppo generico
  "A-9999-A", // troppe cifre (4 invece di 3)
  "XY-99-99", // formato mai esistito
  "Z-01-ZZZ", // troppe lettere (3 dopo dash)
  "1-ZZZ-1", // non conforme ai sidecode o pattern NL
];

// // NL — validi (20)
// const NL_valid = [
//   // sidecode examples & current series
//   "XT-347-S",   // sidecode 7 / AA-999-A  (esempi simili in gallery)
//   "T-347-SX",   // A-999-AA (recent) — trovato in elenchi sidecodes
//   "27-JKL-8",   // 99-AAA-9 (documentato)
//   "GB-001-B",   // serie 2015 — documentata
//   "K-812-FJ",   // A-999-AA
//   "L-548-RV",   // A-999-AA
//   "R-641-SB",   // A-999-AA
//   "V-01-BBB",   // commerciale (V prefix) — formato esistente
//   "T-01-BBB",   // trattore / T prefix — esistente
//   "E-01-BBD",   // E series (2025) for e-scooters (format valid)
//   "35-GFL-9",   // esempio da gallery
//   "2-KDL-81",   // esempio da gallery
//   "01-DB-BB",   // classic sidecode (01-DB-BB) — presente in docs
//   "01-GB-BB",   // present in current series examples
//   "00-HBB-1",   // truck series in docs
//   "GBB-01-B",   // current tractor/series example
//   "00-ZBB-1",   // current series example
//   "1-KBB-00",   // documented (no KKK combinations)
//   "01-VBB-00",  // trucks / series example
//   "74-WJ-RJ"    // example from gallery (trailer/etc)
// ];

// // NL — invalidi / proibiti (10)
// const NL_invalid = [
//   "XXX-000-0",   // nonsense/invalid lengths
//   "00-000-00",   // double zero sequences (prohibited in many sidecodes)
//   "SS-123-AB",   // 'SS' / 'SD' banned combinations
//   "KGB-123-4",   // banned political/historical combos
//   "A-1234-BCDE", // chunk too long
//   "12-3456-AB",  // chunk too long
//   "ZZZ-9999-9",  // no sidecode for this
//   "CD-XXXX-YY",  // diplomatic with letters in place of numbers
//   "00-GVD-11",   // pattern mixing that doesn't belong to any sidecode
//   "1-00-AAA"     // malformed ordering
// ];

/**
 * @typedef {object} Match
 * @property {string} country
 * @property {any} [props]
 */

/**
 * @typedef {object} ValidateResult
 * @property {boolean} isValid
 * @property {Match[]} matches
 * @property {any} [props]
 */

/**
 * @typedef {object} ResultEntry
 * @property {string} plate
 * @property {boolean} ok
 * @property {ValidateResult} r
 */

/**
 * @typedef {object} RunSetReturn
 * @property {number} total
 * @property {ResultEntry[]} fails
 * @property {ResultEntry[]} results
 */

/**
 * Run a set of plates through the validator.
 * @param {string[]} set
 * @param {boolean} expectValid
 * @returns {RunSetReturn}
 */
function runSet(set, expectValid) {
  /** @type {ResultEntry[]} */
  const results = [];
  for (const plate of set) {
    /** @type {ValidateResult} */
    const r = validatePlate(plate, ["NL"], { vehicleType: "any" });
    const ok = r.isValid && r.matches.some((m) => m.country === "NL");
    results.push({ plate, ok, r });
  }
  const fails = results.filter((x) => x.ok !== expectValid);
  return { total: results.length, fails, results };
}

console.log("Running NL valid set...");
const v = runSet(NL_valid, true);
console.log(`Total: ${v.total}, Failures: ${v.fails.length}`);
v.fails.forEach((f) => console.log("FAIL (should pass):", f.plate, f.r));

console.log("\nRunning NL invalid set...");
const iv = runSet(NL_invalid, false);
console.log(`Total: ${iv.total}, Failures: ${iv.fails.length}`);
iv.fails.forEach((f) => console.log("FAIL (should fail):", f.plate, f.r));

if (v.fails.length === 0 && iv.fails.length === 0) {
  console.log("\nALL TESTS PASSED ✅");
  process.exit(0);
} else {
  console.log("\nSOME TESTS FAILED ❌");
  process.exit(2);
}
