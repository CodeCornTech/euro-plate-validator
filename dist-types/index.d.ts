import type { CountryKey, VehicleType } from "./countries.js";
export type { CountryKey, VehicleType, CountryDef } from "./countries.js";
export * from "./countries.js";
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
export declare function normalize(input: string): string;
/** Valida una targa contro uno o più paesi.
 *  @param {string} plate
 *  @param {readonly CountryKey[]=} countries  Elenco di paesi da controllare (default: tutti)
 *  @param {ValidateOptions=} options          { vehicleType?: "car"|"motorcycle"|"any" } (default "any")
 *  @returns {ValidateResult}
 */
export declare function validatePlate(plate: string, countries?: readonly CountryKey[], options?: ValidateOptions): ValidateResult;
//# sourceMappingURL=index.d.ts.map