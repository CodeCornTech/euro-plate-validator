/** Tutti i country code supportati (Russia esclusa) */
export type CountryKey =
  | "IT"
  | "UK"
  | "DE"
  | "FR"
  | "ES"
  | "PT"
  | "NL"
  | "BE"
  | "CH"
  | "AT"
  | "IE"
  | "LU"
  | "DK"
  | "SE"
  | "NO"
  | "FI"
  | "PL"
  | "CZ"
  | "SK"
  | "HU"
  | "RO"
  | "BG"
  | "SI"
  | "HR"
  | "GR"
  | "LT"
  | "LV"
  | "EE"
  | "UA";

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

/**
 * Mappa paesi → definizioni con regex.
 * Usa `satisfies` per garantire che ogni chiave rispetti CountryDef.
 */
export const RX: Record<CountryKey, CountryDef> = {
  IT: {
    name: "Italy",
    patterns: {
      // Car 1994–today: AA 999 AA (no I O Q U), skip "EE" series
      car: [{ rx: /^(?!EE)[A-HJ-NP-RTV-Z]{2}\s?\d{3}\s?[A-HJ-NP-RTV-Z]{2}$/ }],
      // Motorcycle 1999–today: AA 00000
      motorcycle: [{ rx: /^[A-HJ-NP-RTV-Z]{2}\s?\d{5}$/ }],
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
      car: [{ rx: /^[A-Z]{1,3}-[A-Z]{1,2}\s?\d{1,4}$/ }],
    },
  },

  FR: {
    name: "France",
    patterns: {
      car: [{ rx: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/ }],
    },
  },

  ES: {
    name: "Spain",
    patterns: {
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
    patterns: { car: [{ rx: /^[A-Z]{3}-\d{3}$/ }, { rx: /^[A-Z]{2}\d{2}-[A-Z]{2}$/ }] },
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
