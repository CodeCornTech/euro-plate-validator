// src/countries.ts
import { finalizeInputMaskLayouts } from "./utils/placeholders.js";

// prettier-ignore
/** Tutti i country code supportati (Russia esclusa) */
export type CountryKey = "IT" | "UK" | "DE" | "FR" | "ES" | "PT" | "NL" | "BE" | "CH" | "AT" | "IE" | "LU" | "DK" | "SE" | "NO" | "FI" | "PL" | "CZ" | "SK" | "HU" | "RO" | "BG" | "SI" | "HR" | "GR" | "LT" | "LV" | "EE" | "UA";

/** Tipo veicolo */
export type VehicleType = "car" | "motorcycle" | "any";

// prettier-ignore
/** Lista di paesi supportati (const + tipizzato) */
export const supportedCountries = [
  "IT", "UK", "DE", "FR", "ES", "PT", "NL", "BE", "CH", "AT", "IE", "LU", "DK", "SE", "NO", "FI", "PL", "CZ", "SK", "HU", "RO", "BG", "SI", "HR", "GR", "LT", "LV", "EE", "UA",
] as const satisfies ReadonlyArray<CountryKey>;

// prettier-ignore
export const FLAG_MAP = {
  IT:"it", UK:"gb", DE:"de", FR:"fr", ES:"es", PT:"pt", NL:"nl", BE:"be", CH:"ch", AT:"at", IE:"ie", LU:"lu",
  DK:"dk", SE:"se", NO:"no", FI:"fi", PL:"pl", CZ:"cz", SK:"sk", HU:"hu", RO:"ro", BG:"bg", SI:"si", HR:"hr",
  GR:"gr", LT:"lt", LV:"lv", EE:"ee", UA:"ua"
} as const;

// prettier-ignore
export const COUNTRY_NAMES = {
  IT:"Italy", UK:"United Kingdom", DE:"Germany", FR:"France", ES:"Spain", PT:"Portugal", NL:"Netherlands",
  BE:"Belgium", CH:"Switzerland", AT:"Austria", IE:"Ireland", LU:"Luxembourg", DK:"Denmark", SE:"Sweden",
  NO:"Norway", FI:"Finland", PL:"Poland", CZ:"Czechia", SK:"Slovakia", HU:"Hungary", RO:"Romania", BG:"Bulgaria",
  SI:"Slovenia", HR:"Croatia", GR:"Greece", LT:"Lithuania", LV:"Latvia", EE:"Estonia", UA:"Ukraine"
} as const;

export type CountryCode = keyof typeof FLAG_MAP;

/**
 * Normalizes some real-world quirks:
 * - GB ⇢ UK (ISO alpha-2 is GB; plates often use UK). Your map uses "UK", so we normalize to that.
 */
export function normalizeCode(code: string): CountryCode | undefined {
  const up = code.trim().toUpperCase();
  const alias = up === "GB" ? "UK" : up;
  return alias in FLAG_MAP ? (alias as CountryCode) : undefined;
}

export function getFlagSlug(code: string): string | undefined {
  const cc = normalizeCode(code);
  return cc ? FLAG_MAP[cc] : undefined;
}

export function getCountryName(code: string): string | undefined {
  const cc = normalizeCode(code);
  return cc ? COUNTRY_NAMES[cc] : undefined;
}

export const COUNTRY_CODES = Object.keys(FLAG_MAP) as CountryCode[];

export type CountryInfo = {
  code: CountryCode;
  flag: (typeof FLAG_MAP)[CountryCode];
  name: (typeof COUNTRY_NAMES)[CountryCode];
};

export const COUNTRIES: CountryInfo[] = COUNTRY_CODES.map((c) => ({
  code: c as CountryCode,
  flag: FLAG_MAP[c as CountryCode],
  name: COUNTRY_NAMES[c as CountryCode],
}));

// Reverse lookups (by flag slug or name)
export const FLAG_TO_CODE = Object.fromEntries(COUNTRY_CODES.map((c) => [FLAG_MAP[c], c])) as Record<(typeof FLAG_MAP)[CountryCode], CountryCode>;

export const NAME_TO_CODE = Object.fromEntries(COUNTRY_CODES.map((c) => [COUNTRY_NAMES[c], c])) as Record<(typeof COUNTRY_NAMES)[CountryCode], CountryCode>;

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

/** Mappe leggibili per UI / placeholder / doc */
export const DISPLAY_FORMATS: Partial<Record<CountryKey, string>> = {
  // ──────────────────────────────── EUROZONA BASE ────────────────────────────────
  IT: "AA 999 AA", // (senza I O Q U)
  FR: "AA-999-AA",
  ES: "9999 BBB", // (solo consonanti)
  DE: "B-AA 1234", // variabile (prefisso+serie)
  NL: "AA-999-AA | 99-AAA-9 | A-999-AA | AA-999-A | 9-AA-999 | LL-LL-99 | 99-LL-LL | LLL-99-L",
  PT: "99-AA-99 | AA-99-99 | 99-99-AA",
  BE: "1-ABC-123 | ABC-123",
  CH: "GE 123456",
  AT: "W 1234 AB",
  IE: "23-D-12345",
  LU: "123456 | 12-3456",
  DK: "AB 12 345",
  SE: "ABC 12A",
  NO: "AB 12345",
  FI: "ABC-123",
  PL: "WW 12345", // formato generico
  CZ: "1AB 2345",
  SK: "AA-999 AA",
  HU: "ABC-123 | AAAA-123 | AA99-AA",
  RO: "BB 99 AAA / B 999 AAA",
  BG: "AA 9999 AA",
  SI: "LJ-123-AB",
  HR: "ST 1234-AA",
  GR: "ABC-1234",
  LT: "ABC 123",
  LV: "AB-1234",
  EE: "123 ABC",
  UA: "AA 1234 AA",
  UK: "AB12 CDE",
};

/** Layout Inputmask per digitazione assistita (coerenti con le regex) */
export const INPUTMASK_LAYOUTS: Partial<Record<CountryKey, InputMaskLayout>> = {
  // ───────────────────────────────── ITALIA ─────────────────────────────────
  IT: {
    // AA 999 AA  ma con alfabeto ristretto (niente I O Q U)
    mask: "HH 999 HH",
    definitions: {
      // accetta minuscole+maiuscole, poi upper via casing
      H: { validator: "[A-HJ-NPR-TV-Za-hj-npr-tv-z]", casing: "upper" },
    },
    placeholder: "__ ___ __",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true,
  },

  // ──────────────────────────────── FRANCIA ─────────────────────────────────
  FR: {
    // AA-999-AA (solo trattini) — nessuna defs: usa L base dal client
    mask: "LL-999-LL",
    placeholder: "__-___-__",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true,
  },

  // ──────────────────────────────── SPAGNA ──────────────────────────────────
  ES: {
    // 9999 BBB  → consonanti senza A E I O U Q Ñ
    mask: "9999 CCC",
    definitions: {
      // consonanti in entrambe le casse, poi upper
      C: { validator: "[BCDFGHJKLMNPRSTVWXYZbcdfghjklmnprstvwxyz]", casing: "upper" },
    },
    placeholder: "____ ___",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true,
  },

  // ──────────────────────────────── REGNO UNITO ─────────────────────────────
  UK: {
    // AB12 CDE (formato corrente) — nessuna defs: L base
    mask: "LL99 LLL",
    placeholder: "__ __ ___",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true,
  },
  // ──────────────────────────────── PAESI BASSI ─────────────────────────────
  NL: {
    // Sidecode multipli
    mask: ["LL-999-LL", "99-LLL-9", "L-999-LL", "LL-999-L", "9-LL-999", "LL-LL-99", "99-LL-LL", "LLL-99-L"],
    // Alfabeto NL senza A E I O U Q
    definitions: { L: { validator: "[BDFGHJKLNPRSTVXYZbdfghjklnprstvxyz]", casing: "upper" } },
    placeholder: "",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: false,
  },

  // ──────────────────────────────── ROMANIA ─────────────────────────────────
  RO: {
    // BB 99 AAA / B 999 AAA — nessuna defs: L base
    mask: ["LL 99 LLL", "LL 999 LLL", "L 99 LLL", "L 999 LLL"],
    placeholder: "",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: false,
  },

  // ──────────────────────────────── SLOVACCHIA ──────────────────────────────
  SK: {
    // DD-999LL  (accetta varianti con / senza spazi / trattino) — L base
    mask: ["LL-999 LL", "LL999LL", "LL 999 LL"],
    placeholder: "",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: false,
  },

  // ──────────────────────────────── PORTOGALLO ──────────────────────────────
  PT: {
    // L base
    mask: ["99-LL-99", "LL-99-99", "99-99-LL"],
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: false,
  },

  // ──────────────────────────────── BELGIO ──────────────────────────────────
  BE: {
    // L base
    mask: ["9-LLL-999", "LLL-999"],
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: false,
  },

  // ──────────────────────────────── DANIMARCA ───────────────────────────────
  DK: {
    // AA 12 345 — L base
    mask: "LL 99 999",
    keepStatic: true,
  },

  // ──────────────────────────────── SVEZIA ──────────────────────────────────
  SE: {
    // ABC 12X  (X alfanumerico) — L base; X con minuscole
    mask: "LLL 99 X",
    definitions: {
      X: { validator: "[A-Za-z0-9]", casing: "upper" },
    },
    keepStatic: true,
  },

  // ──────────────────────────────── NORVEGIA ────────────────────────────────
  NO: {
    // AA 12345 — L base
    mask: "LL 99999",
    keepStatic: true,
  },

  // ──────────────────────────────── FINLANDIA ───────────────────────────────
  FI: {
    // ABC-123 — L base
    mask: "LLL-999",
    keepStatic: true,
  },

  // ──────────────────────────────── REP. CECA ───────────────────────────────
  CZ: {
    // 1AB 2345 — L base
    mask: "9 LL 9999",
    keepStatic: true,
  },

  // ──────────────────────────────── UNGHERIA ────────────────────────────────
  HU: {
    // ABC-123  /  AAAA-123  /  AA99-AA — L base
    mask: ["LLL-999", "LLLL-999", "LL99-LL"],
    keepStatic: true,
  },

  // ──────────────────────────────── BULGARIA ────────────────────────────────
  BG: {
    // L base
    mask: ["L 9999 L", "LL 9999 LL", "L9999L", "LL9999LL"],
    keepStatic: true,
  },

  // ──────────────────────────────── SLOVENIA ────────────────────────────────
  SI: {
    // L base
    mask: ["LL-999- L", "LL-999- LL", "LL-9999- L", "LL-9999- LL"],
    keepStatic: true,
  },

  // ──────────────────────────────── CROAZIA ─────────────────────────────────
  HR: {
    // L base
    mask: ["LL 999- LL", "LL 9999- LL"],
    keepStatic: true,
  },

  // ──────────────────────────────── GRECIA ──────────────────────────────────
  GR: {
    // L base
    mask: "LLL-9999",
    keepStatic: true,
  },

  // ──────────────────────────────── LITUANIA ────────────────────────────────
  LT: {
    // L base
    mask: "LLL 999",
    keepStatic: true,
  },

  // ──────────────────────────────── LETTONIA ────────────────────────────────
  LV: {
    // L base
    mask: "LL-9999",
    keepStatic: true,
  },

  // ──────────────────────────────── ESTONIA ─────────────────────────────────
  EE: {
    // L base
    mask: "999 LLL",
    keepStatic: true,
  },

  // ──────────────────────────────── UCRAINA ─────────────────────────────────
  UA: {
    // L base
    mask: "LL 9994 LL".replace("9994", "9999"),
    keepStatic: true,
  },

  // ──────────────────────────────── LUSSEMBURGO ─────────────────────────────
  LU: {
    // 4–6 cifre  oppure  1–2 cifre - 3–4 cifre
    mask: ["9999", "99999", "999999", "9-999", "99-999", "9-9999", "99-9999"],
    keepStatic: true,
  },

  // ──────────────────────────────── GERMANIA / AUSTRIA / SVIZZERA ──────────
  // Prefissi/lunghezze variabili, caratteri speciali (ÄÖÜ) → niente mask rigida.
  // DE: —  AT: —  CH: —
};

// /** Helper ergonomici */
// 🔚 Esporta una versione finale che garantisce i placeholder dove mancano
export const INPUTMASK_LAYOUTS_FINAL = finalizeInputMaskLayouts(
  INPUTMASK_LAYOUTS, // <- T = Partial<Record<CountryKey, InputMaskLayout>>
  DISPLAY_FORMATS
);

// opzionale: punta i consumer alla mappa "final"
export function getInputMask(country: CountryKey) {
  return (INPUTMASK_LAYOUTS_FINAL as Record<CountryKey, InputMaskLayout | undefined>)[country] ?? null;
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
      // TESBVUG 1.0.13
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
      car: [{ rx: /^\d{2}-[A-Z]{2}-\d{2}$/ }, { rx: /^[A-Z]{2}-\d{2}-\d{2}$/ }, { rx: /^\d{2}-\d{2}-[A-Z]{2}$/ }],
    },
  },

  NL: {
    name: "Netherlands",
    patterns: {
      car: [
        // Sidecodes “storici/moderni” con trattini
        // AA-123-AA
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}-\d{3}-[BDFGHJKLNPRSTVXYZ]{2}$/ },
        // 12-AAA-1
        { rx: /^\d{2}-[BDFGHJKLNPRSTVXYZ]{3}-\d$/ },
        // 1-AAA-12
        { rx: /^\d-[BDFGHJKLNPRSTVXYZ]{3}-\d{2}$/ },
        // AA-AA-12
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}-[BDFGHJKLNPRSTVXYZ]{2}-\d{2}$/ },
        // 12-AA-AA
        { rx: /^\d{2}-[BDFGHJKLNPRSTVXYZ]{2}-[BDFGHJKLNPRSTVXYZ]{2}$/ },
        // AAA-12-A
        { rx: /^[BDFGHJKLNPRSTVXYZ]{3}-\d{2}-[BDFGHJKLNPRSTVXYZ]$/ },

        // Nuovi sidecode (dal 2021): A-001-AA, AA-001-A, 0-AA-001
        { rx: /^[BDFGHJKLNPRSTVXYZ]-\d{3}-[BDFGHJKLNPRSTVXYZ]{2}$/ }, // A-001-AA
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}-\d{3}-[BDFGHJKLNPRSTVXYZ]$/ }, // AA-001-A
        { rx: /^\d-[BDFGHJKLNPRSTVXYZ]{2}-\d{3}$/ }, // 0-AA-001

        // Tollera eventuali spazi al posto dei trattini (import/export/trascrizioni)
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}\s\d{3}\s[BDFGHJKLNPRSTVXYZ]{2}$/ },
        { rx: /^\d{2}\s[BDFGHJKLNPRSTVXYZ]{3}\s\d$/ },
        { rx: /^\d\s[BDFGHJKLNPRSTVXYZ]{3}\s\d{2}$/ },
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}\s[BDFGHJKLNPRSTVXYZ]{2}\s\d{2}$/ },
        { rx: /^\d{2}\s[BDFGHJKLNPRSTVXYZ]{2}\s[BDFGHJKLNPRSTVXYZ]{2}$/ },
        { rx: /^[BDFGHJKLNPRSTVXYZ]{3}\s\d{2}\s[BDFGHJKLNPRSTVXYZ]$/ },
        { rx: /^[BDFGHJKLNPRSTVXYZ]\s\d{3}\s[BDFGHJKLNPRSTVXYZ]{2}$/ },
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}\s\d{3}\s[BDFGHJKLNPRSTVXYZ]$/ },
        { rx: /^\d\s[BDFGHJKLNPRSTVXYZ]{2}\s\d{3}$/ },
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

  // 7-10 RO: { name: "Romania", patterns: { car: [{ rx: /^[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{3}$/ }] } },
  RO: {
    name: "Romania",
    patterns: {
      car: [
        // Regola generale: 2 lettere di contea + 2/3 cifre + 3 lettere
        { rx: /^[A-Z]{2}\s?\d{2,3}\s?[A-Z]{3}$/ },
        // Eccezione capitale: 1 lettera (solo B) + 2/3 cifre + 3 lettere
        { rx: /^B\s?\d{2,3}\s?[A-Z]{3}$/ },
      ],
    },
  },

  //SK: { name: "Slovakia", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{3,4}[A-Z]{0,2}$/ }] } },
  SK: {
    name: "Slovakia",
    patterns: {
      car: [
        // Formato tipico: DD-999LL (con o senza trattino/spazio)
        { rx: /^[A-Z]{2}[-\s]?\d{3}[A-Z]{2}$/ },
      ],
    },
  },
  BG: { name: "Bulgaria", patterns: { car: [{ rx: /^[A-Z]{1,2}\s?\d{4}\s?[A-Z]{1,2}$/ }] } },
  SI: { name: "Slovenia", patterns: { car: [{ rx: /^[A-Z]{2}-\d{3,4}-[A-Z]{1,2}$/ }] } },
  HR: { name: "Croatia", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{3,4}-[A-Z]{2}$/ }] } },
  GR: { name: "Greece", patterns: { car: [{ rx: /^[A-Z]{3}-\d{4}$/ }] } },
  LT: { name: "Lithuania", patterns: { car: [{ rx: /^[A-Z]{3}\s?\d{3}$/ }] } },
  LV: { name: "Latvia", patterns: { car: [{ rx: /^[A-Z]{2}-\d{4}$/ }] } },
  EE: { name: "Estonia", patterns: { car: [{ rx: /^\d{3}\s?[A-Z]{3}$/ }] } },
  UA: { name: "Ukraine", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{4}\s?[A-Z]{2}$/ }] } },
} satisfies Record<CountryKey, CountryDef>;
