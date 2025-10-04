import type { CountryKey } from "./countries";
import { RX } from "./countries";

export interface Match { country: CountryKey; name: string; }
export interface ValidationResult {
  isValid: boolean;
  matches: Match[];
  checked: CountryKey[];
  errors?: string[];
}

export function normalize(input: string): string {
  return String(input || "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function validatePlate(plate: string, countries?: CountryKey[]): ValidationResult {
  const norm = normalize(plate);
  const picks = (countries && countries.length
    ? countries.filter((c): c is CountryKey => c in RX)
    : (Object.keys(RX) as CountryKey[])
  );

  if (!norm) return { isValid: false, matches: [], checked: picks, errors: ["empty"] };
  if (!picks.length) return { isValid: false, matches: [], checked: [], errors: ["no_countries_selected"] };

  const matches: Match[] = [];
  for (const c of picks) {
    const { name, patterns } = RX[c];
    for (const { rx } of patterns) {
      if (rx.test(norm)) { matches.push({ country: c, name }); break; }
    }
  }
  return { isValid: matches.length > 0, matches, checked: picks, errors: matches.length ? undefined : ["no_match"] };
}

export { RX };
