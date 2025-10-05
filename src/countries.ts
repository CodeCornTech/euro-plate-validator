// src/countries.ts
/** Tutti i country code supportati (Russia esclusa) */
// prettier-ignore
export type CountryKey = "IT" | "UK" | "DE" | "FR" | "ES" | "PT" | "NL" | "BE" | "CH" | "AT" | "IE" | "LU" | "DK" | "SE" | "NO" | "FI" | "PL" | "CZ" | "SK" | "HU" | "RO" | "BG" | "SI" | "HR" | "GR" | "LT" | "LV" | "EE" | "UA";
/* prettier-ignore-end */

/** Tipo veicolo */
export type VehicleType = "car" | "motorcycle" | "any";

/** Entry di pattern per tipo veicolo */
export interface PatternSet {
  car?: ReadonlyArray<{ rx: RegExp }>;
  motorcycle?: ReadonlyArray<{ rx: RegExp }>;
}

/** Definizione Paese */
export interface CountryDef {
  name: string;
  patterns: PatternSet;
}

/** Lista di paesi supportati (const + tipizzato) */
export const supportedCountries = [
  "IT",
  "UK",
  "DE",
  "FR",
  "ES",
  "PT",
  "NL",
  "BE",
  "CH",
  "AT",
  "IE",
  "LU",
  "DK",
  "SE",
  "NO",
  "FI",
  "PL",
  "CZ",
  "SK",
  "HU",
  "RO",
  "BG",
  "SI",
  "HR",
  "GR",
  "LT",
  "LV",
  "EE",
  "UA",
] as const satisfies ReadonlyArray<CountryKey>;

// Tipi: solo type, nessuna dipendenza runtime
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
export const DISPLAY_FORMATS: Partial<Record<CountryKey, string>> = {
  IT: "AA 999 AA", // (senza I O Q U)
  FR: "AA-999-AA",
  ES: "9999 AAA",
  // DE variabile → niente formato singolo
};

/** Layout Inputmask per digitazione assistita (coerenti con le regex) */
export const INPUTMASK_LAYOUTS: Partial<Record<CountryKey, InputMaskLayout>> = {
  IT: {
    mask: "HH 999 HH",
    // H = [A-HJ-NP-RTV-Z] (niente I, O, Q, U)
    definitions: { H: { validator: "[A-HJ-NP-RTV-Z]", casing: "upper" } },
    placeholder: "__ ___ __",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true,
  },
  FR: {
    mask: "AA-999-AA",
    definitions: { A: { validator: "[A-Z]", casing: "upper" } },
    placeholder: "__-___-__",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true,
  },
  ES: {
    mask: "9999 AAA",
    definitions: { A: { validator: "[A-Z]", casing: "upper" } },
    placeholder: "____ ___",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true,
  },
  // DE: volutamente senza mask (prefissi variabili: "B A 1", "M AA 1234", ecc.)
};

/** Helper ergonomici */
export function getInputMask(country: CountryKey): InputMaskLayout | null {
  return (INPUTMASK_LAYOUTS as Record<CountryKey, InputMaskLayout | undefined>)[country] ?? null;
}
export function getDisplayFormat(country: CountryKey): string | null {
  return (DISPLAY_FORMATS as Record<CountryKey, string | undefined>)[country] ?? null;
}

/**
 * Mappa paesi → definizioni con regex.
 * Usa `satisfies` per garantire che ogni chiave rispetti CountryDef.
 */
export const RX: Record<CountryKey, CountryDef> = {
  IT: {
    name: "Italy",
    patterns: {
      // Car 1994–today: AA 999 AA (no I O Q U), skip "EE" series
      car: [{ rx: /^(?!EE)[A-HJ-NPR-TV-Z]{2}\s?\d{3}\s?[A-HJ-NPR-TV-Z]{2}$/ }],
      //BK 05-10 car: [{ rx: /^(?!EE)[A-HJ-NP-RTZ]{2}\s?\d{3}\s?[A-HJ-NP-RTZ]{2}$/ }],
      // Motorcycle 1999–oggi: AA 00000 (no I O Q U)
      motorcycle: [{ rx: /^[A-HJ-NPR-TV-Z]{2}\s?\d{5}$/ }],
      //motorcycle: [{ rx: /^[A-HJ-NP-RTZ]{2}\s?\d{5}$/ }],
      // BK 05-10 motorcycle: [{ rx: /^[A-HJ-NP-RTZ]{2}\s?\d{5}$/ }],
    },
  },

  UK: {
    name: "United Kingdom",
    patterns: {
      car: [
        // Current (2001–today): AB12 CDE
        { rx: /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/ },
        // Broad legacy: A1, AB1, ABC1234, etc.
        { rx: /^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,3}$/ },
      ],
      // (moto non dettagliata qui; si può aggiungere in futuro)
    },
  },

  DE: {
    name: "Germany",
    patterns: {
      car: [
        // Standard: prefisso regionale 1–3 lettere + '-' + 1–2 lettere + 1–4 cifre
        // Nota: sui prefissi compaiono anche umlaut (ÄÖÜ); li ammettiamo.
        { rx: /^[A-ZÄÖÜ]{1,3}-[A-Z]{1,2}\s?\d{1,4}$/ },

        // Ente pubblico / senza serie lettere a destra delle targhette:
        // prefisso 1–3 lettere + '-' + 1–4 cifre
        { rx: /^[A-ZÄÖÜ]{1,3}-\d{1,4}$/ },

        // Targhe “speciali” pratiche e frequenti:
        // 06 = targhe prova/officina; 07 = storiche (Händler/Oldtimer)
        { rx: /^[A-ZÄÖÜ]{1,3}-06\s?\d{1,4}$/ },
        { rx: /^[A-ZÄÖÜ]{1,3}-07\s?\d{1,4}$/ },

        // Bundeswehr (militari): "Y-123 456" (spazio opzionale). Cifre in 2 blocchi (1–3 + 1–3).
        { rx: /^Y-\d{1,3}\s?\d{1,3}$/ },
      ],
    },
  },

  // FR: SOLO trattini, niente spazi
  FR: {
    name: "France",
    patterns: {
      // AA-000-AA (nessuno spazio)
      car: [{ rx: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/ }],
      //    car: [{ rx: /^[A-Z]{2}[-]\d{3}[-][A-Z]{2}$/ }],
      //car: [{ rx: /^[A-Z]{2}\-\d{3}\-[A-Z]{2}$/ }],
    },
  },

  // ES: lascia così (già corretta)
  ES: {
    name: "Spain",
    patterns: {
      // 0000 BBB, lettere da consonanti senza A,E,I,Ñ,O,Q,U
      car: [{ rx: /^\d{4}\s?[BCDFGHJKLMNPRSTVWXYZ]{3}$/ }],
    },
  },
  PT: {
    name: "Portugal",
    patterns: {
      car: [
        { rx: /^\d{2}-[A-Z]{2}-\d{2}$/ },
        { rx: /^[A-Z]{2}-\d{2}-\d{2}$/ },
        { rx: /^\d{2}-\d{2}-[A-Z]{2}$/ },
      ],
    },
  },

  NL: {
    name: "Netherlands",
    patterns: {
      car: [
        { rx: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/ },
        { rx: /^\d{2}-[A-Z]{3}-\d$/ },
        { rx: /^\d-[A-Z]{3}-\d{2}$/ },
        { rx: /^[A-Z]{2}-[A-Z]{2}-\d{2}$/ },
        { rx: /^\d{2}-[A-Z]{2}-[A-Z]{2}$/ },
        { rx: /^[A-Z]{3}-\d{2}-[A-Z]$/ },
      ],
    },
  },

  BE: {
    name: "Belgium",
    patterns: { car: [{ rx: /^[1-9]-[A-Z]{3}-\d{3}$/ }, { rx: /^[A-Z]{3}-\d{3}$/ }] },
  },
  CH: { name: "Switzerland", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{1,6}$/ }] } },
  AT: { name: "Austria", patterns: { car: [{ rx: /^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,2}$/ }] } },
  IE: { name: "Ireland", patterns: { car: [{ rx: /^\d{2,3}-[A-Z]{1,2}-\d{1,6}$/ }] } },
  LU: { name: "Luxembourg", patterns: { car: [{ rx: /^\d{4,6}$/ }, { rx: /^\d{1,2}-\d{3,4}$/ }] } },
  DK: { name: "Denmark", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{2}\s?\d{3}$/ }] } },
  SE: { name: "Sweden", patterns: { car: [{ rx: /^[A-Z]{3}\s?\d{2}[A-Z0-9]$/ }] } },
  NO: { name: "Norway", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{5}$/ }] } },
  FI: { name: "Finland", patterns: { car: [{ rx: /^[A-Z]{3}-\d{3}$/ }] } },
  PL: { name: "Poland", patterns: { car: [{ rx: /^[A-Z]{1,3}\s?[A-Z0-9]{4,5}$/ }] } },
  CZ: { name: "Czechia", patterns: { car: [{ rx: /^\d[A-Z]{2}\s?\d{4}$/ }] } },
  SK: { name: "Slovakia", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{3,4}[A-Z]{0,2}$/ }] } },
  HU: {
    name: "Hungary",
    patterns: {
      car: [
        { rx: /^[A-Z]{3}-\d{3}$/ }, // storico: ABC-123
        { rx: /^[A-Z]{4}-\d{3}$/ }, // nuovo: 2022→, AAAA-123
        { rx: /^[A-Z]{2}\d{2}-[A-Z]{2}$/ }, // ampia (legacy/transitorio)
      ],
    },
  },
  RO: { name: "Romania", patterns: { car: [{ rx: /^[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{3}$/ }] } },
  BG: { name: "Bulgaria", patterns: { car: [{ rx: /^[A-Z]{1,2}\s?\d{4}\s?[A-Z]{1,2}$/ }] } },
  SI: { name: "Slovenia", patterns: { car: [{ rx: /^[A-Z]{2}-\d{3,4}-[A-Z]{1,2}$/ }] } },
  HR: { name: "Croatia", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{3,4}-[A-Z]{2}$/ }] } },
  GR: { name: "Greece", patterns: { car: [{ rx: /^[A-Z]{3}-\d{4}$/ }] } },
  LT: { name: "Lithuania", patterns: { car: [{ rx: /^[A-Z]{3}\s?\d{3}$/ }] } },
  LV: { name: "Latvia", patterns: { car: [{ rx: /^[A-Z]{2}-\d{4}$/ }] } },
  EE: { name: "Estonia", patterns: { car: [{ rx: /^\d{3}\s?[A-Z]{3}$/ }] } },
  UA: { name: "Ukraine", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{4}\s?[A-Z]{2}$/ }] } },
} satisfies Record<CountryKey, CountryDef>;
