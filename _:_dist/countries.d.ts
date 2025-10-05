/** Tutti i country code supportati (Russia esclusa) */
export type CountryKey = "IT" | "UK" | "DE" | "FR" | "ES" | "PT" | "NL" | "BE" | "CH" | "AT" | "IE" | "LU" | "DK" | "SE" | "NO" | "FI" | "PL" | "CZ" | "SK" | "HU" | "RO" | "BG" | "SI" | "HR" | "GR" | "LT" | "LV" | "EE" | "UA";
/** Tipo veicolo */
export type VehicleType = "car" | "motorcycle" | "any";
/** Lista di paesi supportati (const + tipizzato) */
export declare const supportedCountries: readonly ["IT", "UK", "DE", "FR", "ES", "PT", "NL", "BE", "CH", "AT", "IE", "LU", "DK", "SE", "NO", "FI", "PL", "CZ", "SK", "HU", "RO", "BG", "SI", "HR", "GR", "LT", "LV", "EE", "UA"];
export declare const FLAG_MAP: {
    readonly IT: "it";
    readonly UK: "gb";
    readonly DE: "de";
    readonly FR: "fr";
    readonly ES: "es";
    readonly PT: "pt";
    readonly NL: "nl";
    readonly BE: "be";
    readonly CH: "ch";
    readonly AT: "at";
    readonly IE: "ie";
    readonly LU: "lu";
    readonly DK: "dk";
    readonly SE: "se";
    readonly NO: "no";
    readonly FI: "fi";
    readonly PL: "pl";
    readonly CZ: "cz";
    readonly SK: "sk";
    readonly HU: "hu";
    readonly RO: "ro";
    readonly BG: "bg";
    readonly SI: "si";
    readonly HR: "hr";
    readonly GR: "gr";
    readonly LT: "lt";
    readonly LV: "lv";
    readonly EE: "ee";
    readonly UA: "ua";
};
export declare const COUNTRY_NAMES: {
    readonly IT: "Italy";
    readonly UK: "United Kingdom";
    readonly DE: "Germany";
    readonly FR: "France";
    readonly ES: "Spain";
    readonly PT: "Portugal";
    readonly NL: "Netherlands";
    readonly BE: "Belgium";
    readonly CH: "Switzerland";
    readonly AT: "Austria";
    readonly IE: "Ireland";
    readonly LU: "Luxembourg";
    readonly DK: "Denmark";
    readonly SE: "Sweden";
    readonly NO: "Norway";
    readonly FI: "Finland";
    readonly PL: "Poland";
    readonly CZ: "Czechia";
    readonly SK: "Slovakia";
    readonly HU: "Hungary";
    readonly RO: "Romania";
    readonly BG: "Bulgaria";
    readonly SI: "Slovenia";
    readonly HR: "Croatia";
    readonly GR: "Greece";
    readonly LT: "Lithuania";
    readonly LV: "Latvia";
    readonly EE: "Estonia";
    readonly UA: "Ukraine";
};
export type CountryCode = keyof typeof FLAG_MAP;
/**
 * Normalizes some real-world quirks:
 * - GB ⇢ UK (ISO alpha-2 is GB; plates often use UK). Your map uses "UK", so we normalize to that.
 */
export declare function normalizeCode(code: string): CountryCode | undefined;
export declare function getFlagSlug(code: string): string | undefined;
export declare function getCountryName(code: string): string | undefined;
export declare const COUNTRY_CODES: CountryCode[];
export type CountryInfo = {
    code: CountryCode;
    flag: (typeof FLAG_MAP)[CountryCode];
    name: (typeof COUNTRY_NAMES)[CountryCode];
};
export declare const COUNTRIES: CountryInfo[];
export declare const FLAG_TO_CODE: Record<(typeof FLAG_MAP)[CountryCode], CountryCode>;
export declare const NAME_TO_CODE: Record<(typeof COUNTRY_NAMES)[CountryCode], CountryCode>;
/** Entry di pattern per tipo veicolo */
export interface PatternSet {
    car?: ReadonlyArray<{
        rx: RegExp;
    }>;
    motorcycle?: ReadonlyArray<{
        rx: RegExp;
    }>;
}
/** Definizione Paese */
export interface CountryDef {
    name: string;
    patterns: PatternSet;
}
type IMOpts = Inputmask.Options;
export interface InputMaskLayout {
    mask: string | string[];
    definitions?: IMOpts["definitions"];
    greedy?: IMOpts["greedy"];
    keepStatic?: IMOpts["keepStatic"];
    showMaskOnHover?: IMOpts["showMaskOnHover"];
    showMaskOnFocus?: IMOpts["showMaskOnFocus"];
    placeholder?: string;
}
/** Mappe leggibili per UI/placeholder/doc */
export declare const DISPLAY_FORMATS: Partial<Record<CountryKey, string>>;
/** Layout Inputmask per digitazione assistita (coerenti con le regex) */
export declare const INPUTMASK_LAYOUTS: Partial<Record<CountryKey, InputMaskLayout>>;
/** Helper ergonomici */
export declare function getInputMask(country: CountryKey): InputMaskLayout | null;
export declare function getDisplayFormat(country: CountryKey): string | null;
/**
 * Mappa paesi → definizioni con regex.
 * Usa `satisfies` per garantire che ogni chiave rispetti CountryDef.
 */
export declare const RX: Record<CountryKey, CountryDef>;
export {};
//# sourceMappingURL=countries.d.ts.map