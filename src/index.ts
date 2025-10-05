// src/index.ts
import { RX, supportedCountries } from "./countries.js";
import type { CountryKey, VehicleType, CountryDef } from "./countries.js";
export type { CountryKey, VehicleType, CountryDef } from "./countries.js";
export * from "./countries.js";

/** Risultato di un match paese/targa */
export interface Match {
  country: CountryKey;
  name: string;
}

/** Esito della validazione */
export interface ValidationResult {
  isValid: boolean;
  matches: Match[];
  checked: CountryKey[];
  errors?: string[];
}

/** Opzioni runtime */
export interface ValidateOptions {
  /** "car" | "motorcycle" | "any" (default: "any") */
  vehicleType?: VehicleType;
}

/** Normalizza l'input targa: maiuscolo, spazi consolidati, trim. */
export function normalize(input: string): string {
  return String(input ?? "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Genera i pattern (RegExp) per un dato paese e tipo veicolo. */
function* pickPatternsFor(
  country: CountryKey,
  vehicleType: VehicleType
): Generator<RegExp, void, unknown> {
  const set: CountryDef["patterns"] = RX[country].patterns;

  if (vehicleType === "car" || vehicleType === "any") {
    for (const p of set.car ?? []) yield p.rx;
  }
  if (vehicleType === "motorcycle" || vehicleType === "any") {
    for (const p of set.motorcycle ?? []) yield p.rx;
  }
}

/**
 * Valida una targa contro uno o più paesi.
 * @param plate   Stringa targa (verrà normalizzata).
 * @param countries Lista di country code (se assente, controlla tutti i paesi supportati).
 * @param options vehicleType: "car" | "motorcycle" | "any" (default "any").
 */
export function validatePlate(
  plate: string,
  countries?: readonly CountryKey[],
  options: ValidateOptions = {}
): ValidationResult {
  const vehicleType: VehicleType = options.vehicleType ?? "any";
  const norm = normalize(plate);

  const picks: CountryKey[] =
    countries && countries.length
      ? countries.filter((c): c is CountryKey => c in RX)
      : [...supportedCountries];

  if (!norm) {
    return { isValid: false, matches: [], checked: picks, errors: ["empty"] };
  }
  if (!picks.length) {
    return {
      isValid: false,
      matches: [],
      checked: [],
      errors: ["no_countries_selected"],
    };
  }

  const matches: Match[] = [];
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
