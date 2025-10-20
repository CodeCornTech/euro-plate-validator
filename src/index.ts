// src/index.ts
// @ts-check  // (se vuoi anche nei sorgenti)

/** @typedef {import("./countries.js").CountryKey} CountryKey */
/** @typedef {import("./countries.js").CountryDef} CountryDef */
/** @typedef {"car"|"motorcycle"|"any"} VehicleType */
/** @typedef {{ country: CountryKey; name: string }} ValidateMatch */
/** @typedef {{ vehicleType?: VehicleType }} ValidateOptions */
/** @typedef {{ isValid: boolean; matches: ValidateMatch[]; checked: CountryKey[]; errors?: string[] }} ValidateResult */

import { getInputMask } from "./countries.js"; // (non è obbligatorio, serve solo a evitare che bundler estremi eliminino exports non usati)

import { RX, supportedCountries } from "./countries.js";
import type { CountryKey, VehicleType, CountryDef } from "./countries.js";
export type { CountryKey, VehicleType, CountryDef } from "./countries.js";
export * from "./countries.js";

// export { createEuroPlate } from "./client/europlate.client.js";

/** Risultato di un match paese/targa */
export interface Match {
  country: CountryKey;
  name: string;
}

export interface ValidateOptions {
  vehicleType?: VehicleType;
}

export interface ValidateMatch {
  country: CountryKey;
  name: string;
}

export interface ValidateResult {
  isValid: boolean;
  matches: ValidateMatch[];
  checked: CountryKey[];
  errors?: string[];
}

/** Normalizza l'input targa: maiuscolo, spazi consolidati, trim.
 *  @param {string} input
 *  @returns {string}
 */
export function normalize(input: string): string {
  return String(input ?? "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Genera i pattern (RegExp) per un dato paese e tipo veicolo.
 *  @param {CountryKey} country
 *  @param {VehicleType} vehicleType
 *  @returns {Generator<RegExp>}
 */
function* pickPatternsFor(country: CountryKey, vehicleType: VehicleType): Generator<RegExp> {
  const set: CountryDef["patterns"] = RX[country].patterns;
  if (vehicleType === "car" || vehicleType === "any") {
    for (const p of set.car ?? []) yield p.rx;
  }
  if (vehicleType === "motorcycle" || vehicleType === "any") {
    for (const p of set.motorcycle ?? []) yield p.rx;
  }
}

/** Valida una targa contro uno o più paesi.
 *  @param {string} plate
 *  @param {readonly CountryKey[]=} countries  Elenco di paesi da controllare (default: tutti)
 *  @param {ValidateOptions=} options          { vehicleType?: "car"|"motorcycle"|"any" } (default "any")
 *  @returns {ValidateResult}
 */
export function validatePlate(plate: string, countries?: readonly CountryKey[], options: ValidateOptions = {}): ValidateResult {
  const vehicleType: VehicleType = options.vehicleType ?? "any";
  const norm = normalize(plate);

  // Normalizza l’elenco dei paesi in un array mutabile locale, tipizzato
  const picks: CountryKey[] = countries && countries.length ? (countries.filter((c): c is CountryKey => c in RX) as CountryKey[]) : [...supportedCountries];

  if (!norm) {
    return { isValid: false, matches: [], checked: picks, errors: ["empty"] };
  }
  if (!picks.length) {
    return { isValid: false, matches: [], checked: [], errors: ["no_countries_selected"] };
  }

  const matches: ValidateMatch[] = [];
  for (const c of picks) {
    for (const rx of pickPatternsFor(c, vehicleType)) {
      if (rx.test(norm)) {
        matches.push({ country: c, name: RX[c].name });
        break;
      }
    }
  }

  return {
    isValid: matches.length > 0,
    matches,
    checked: picks,
    errors: matches.length ? undefined : ["no_match"],
  };
}
