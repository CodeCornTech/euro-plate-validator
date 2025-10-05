"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  COUNTRIES: () => COUNTRIES,
  COUNTRY_CODES: () => COUNTRY_CODES,
  COUNTRY_NAMES: () => COUNTRY_NAMES,
  DISPLAY_FORMATS: () => DISPLAY_FORMATS,
  FLAG_MAP: () => FLAG_MAP,
  FLAG_TO_CODE: () => FLAG_TO_CODE,
  INPUTMASK_LAYOUTS: () => INPUTMASK_LAYOUTS,
  NAME_TO_CODE: () => NAME_TO_CODE,
  RX: () => RX,
  getCountryName: () => getCountryName,
  getDisplayFormat: () => getDisplayFormat,
  getFlagSlug: () => getFlagSlug,
  getInputMask: () => getInputMask,
  normalize: () => normalize,
  normalizeCode: () => normalizeCode,
  supportedCountries: () => supportedCountries,
  validatePlate: () => validatePlate
});
module.exports = __toCommonJS(index_exports);

// src/countries.ts
var supportedCountries = [
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
  "UA"
];
var FLAG_MAP = {
  IT: "it",
  UK: "gb",
  DE: "de",
  FR: "fr",
  ES: "es",
  PT: "pt",
  NL: "nl",
  BE: "be",
  CH: "ch",
  AT: "at",
  IE: "ie",
  LU: "lu",
  DK: "dk",
  SE: "se",
  NO: "no",
  FI: "fi",
  PL: "pl",
  CZ: "cz",
  SK: "sk",
  HU: "hu",
  RO: "ro",
  BG: "bg",
  SI: "si",
  HR: "hr",
  GR: "gr",
  LT: "lt",
  LV: "lv",
  EE: "ee",
  UA: "ua"
};
var COUNTRY_NAMES = {
  IT: "Italy",
  UK: "United Kingdom",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  PT: "Portugal",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  IE: "Ireland",
  LU: "Luxembourg",
  DK: "Denmark",
  SE: "Sweden",
  NO: "Norway",
  FI: "Finland",
  PL: "Poland",
  CZ: "Czechia",
  SK: "Slovakia",
  HU: "Hungary",
  RO: "Romania",
  BG: "Bulgaria",
  SI: "Slovenia",
  HR: "Croatia",
  GR: "Greece",
  LT: "Lithuania",
  LV: "Latvia",
  EE: "Estonia",
  UA: "Ukraine"
};
function normalizeCode(code) {
  const up = code.trim().toUpperCase();
  const alias = up === "GB" ? "UK" : up;
  return alias in FLAG_MAP ? alias : void 0;
}
function getFlagSlug(code) {
  const cc = normalizeCode(code);
  return cc ? FLAG_MAP[cc] : void 0;
}
function getCountryName(code) {
  const cc = normalizeCode(code);
  return cc ? COUNTRY_NAMES[cc] : void 0;
}
var COUNTRY_CODES = Object.keys(FLAG_MAP);
var COUNTRIES = COUNTRY_CODES.map((c) => ({
  code: c,
  flag: FLAG_MAP[c],
  name: COUNTRY_NAMES[c]
}));
var FLAG_TO_CODE = Object.fromEntries(
  COUNTRY_CODES.map((c) => [FLAG_MAP[c], c])
);
var NAME_TO_CODE = Object.fromEntries(
  COUNTRY_CODES.map((c) => [COUNTRY_NAMES[c], c])
);
var DISPLAY_FORMATS = {
  IT: "AA 999 AA",
  // (senza I O Q U)
  FR: "AA-999-AA",
  ES: "9999 AAA",
  NL: "AA-999-AA | 99-AAA-9 | A-999-AA | AA-999-A | 9-AA-999"
  // DE variabile → niente formato singolo
};
var INPUTMASK_LAYOUTS = {
  IT: {
    mask: "AA 999 AA",
    // H = [A-HJ-NP-RTV-Z] (niente I, O, Q, U)
    definitions: { H: { validator: "[A-HJ-NP-RTV-Z]", casing: "upper" } },
    placeholder: "__ ___ __",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true
  },
  FR: {
    mask: "AA-999-AA",
    definitions: { A: { validator: "[A-Z]", casing: "upper" } },
    placeholder: "__-___-__",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true
  },
  ES: {
    mask: "9999 AAA",
    definitions: { A: { validator: "[A-Z]", casing: "upper" } },
    placeholder: "____ ___",
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: true
  },
  // DE: volutamente senza mask (prefissi variabili: "B A 1", "M AA 1234", ecc.)
  NL: {
    mask: [
      "LL-999-LL",
      "99-LLL-9",
      "L-999-LL",
      "LL-999-L",
      "9-LL-999",
      "LL-LL-99",
      "99-LL-LL",
      "LLL-99-L"
    ],
    definitions: {
      L: { validator: "[BDFGHJKLNPRSTVXYZ]", casing: "upper" }
    },
    placeholder: "",
    // no underscore
    keepStatic: true,
    showMaskOnHover: false,
    showMaskOnFocus: false
  }
};
function getInputMask(country) {
  return INPUTMASK_LAYOUTS[country] ?? null;
}
function getDisplayFormat(country) {
  return DISPLAY_FORMATS[country] ?? null;
}
var RX = {
  IT: {
    name: "Italy",
    patterns: {
      // Car 1994–today: AA 999 AA (no I O Q U), skip "EE" series
      car: [{ rx: /^(?!EE)[A-HJ-NPR-TV-Z]{2}\s?\d{3}\s?[A-HJ-NPR-TV-Z]{2}$/ }],
      //BK 05-10 car: [{ rx: /^(?!EE)[A-HJ-NP-RTZ]{2}\s?\d{3}\s?[A-HJ-NP-RTZ]{2}$/ }],
      // Motorcycle 1999–oggi: AA 00000 (no I O Q U)
      motorcycle: [{ rx: /^[A-HJ-NPR-TV-Z]{2}\s?\d{5}$/ }]
      //motorcycle: [{ rx: /^[A-HJ-NP-RTZ]{2}\s?\d{5}$/ }],
      // BK 05-10 motorcycle: [{ rx: /^[A-HJ-NP-RTZ]{2}\s?\d{5}$/ }],
    }
  },
  UK: {
    name: "United Kingdom",
    patterns: {
      car: [
        // Current (2001–today): AB12 CDE
        { rx: /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/ },
        // Broad legacy: A1, AB1, ABC1234, etc.
        { rx: /^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,3}$/ }
      ]
      // (moto non dettagliata qui; si può aggiungere in futuro)
    }
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
        { rx: /^Y-\d{1,3}\s?\d{1,3}$/ }
      ]
    }
  },
  // FR: SOLO trattini, niente spazi
  FR: {
    name: "France",
    patterns: {
      // AA-000-AA (nessuno spazio)
      car: [{ rx: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/ }]
      //    car: [{ rx: /^[A-Z]{2}[-]\d{3}[-][A-Z]{2}$/ }],
      //car: [{ rx: /^[A-Z]{2}\-\d{3}\-[A-Z]{2}$/ }],
    }
  },
  // ES: lascia così (già corretta)
  ES: {
    name: "Spain",
    patterns: {
      // 0000 BBB, lettere da consonanti senza A,E,I,Ñ,O,Q,U
      car: [{ rx: /^\d{4}\s?[BCDFGHJKLMNPRSTVWXYZ]{3}$/ }]
    }
  },
  PT: {
    name: "Portugal",
    patterns: {
      car: [
        { rx: /^\d{2}-[A-Z]{2}-\d{2}$/ },
        { rx: /^[A-Z]{2}-\d{2}-\d{2}$/ },
        { rx: /^\d{2}-\d{2}-[A-Z]{2}$/ }
      ]
    }
  },
  // NL: { 05-10-2025
  //   name: "Netherlands",
  //   patterns: {
  //     car: [
  //       { rx: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/ },
  //       { rx: /^\d{2}-[A-Z]{3}-\d$/ },
  //       { rx: /^\d-[A-Z]{3}-\d{2}$/ },
  //       { rx: /^[A-Z]{2}-[A-Z]{2}-\d{2}$/ },
  //       { rx: /^\d{2}-[A-Z]{2}-[A-Z]{2}$/ },
  //       { rx: /^[A-Z]{3}-\d{2}-[A-Z]$/ },
  //     ],
  //   },
  // },
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
        { rx: /^[BDFGHJKLNPRSTVXYZ]-\d{3}-[BDFGHJKLNPRSTVXYZ]{2}$/ },
        // A-001-AA
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}-\d{3}-[BDFGHJKLNPRSTVXYZ]$/ },
        // AA-001-A
        { rx: /^\d-[BDFGHJKLNPRSTVXYZ]{2}-\d{3}$/ },
        // 0-AA-001
        // Tollera eventuali spazi al posto dei trattini (import/export/trascrizioni)
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}\s\d{3}\s[BDFGHJKLNPRSTVXYZ]{2}$/ },
        { rx: /^\d{2}\s[BDFGHJKLNPRSTVXYZ]{3}\s\d$/ },
        { rx: /^\d\s[BDFGHJKLNPRSTVXYZ]{3}\s\d{2}$/ },
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}\s[BDFGHJKLNPRSTVXYZ]{2}\s\d{2}$/ },
        { rx: /^\d{2}\s[BDFGHJKLNPRSTVXYZ]{2}\s[BDFGHJKLNPRSTVXYZ]{2}$/ },
        { rx: /^[BDFGHJKLNPRSTVXYZ]{3}\s\d{2}\s[BDFGHJKLNPRSTVXYZ]$/ },
        { rx: /^[BDFGHJKLNPRSTVXYZ]\s\d{3}\s[BDFGHJKLNPRSTVXYZ]{2}$/ },
        { rx: /^[BDFGHJKLNPRSTVXYZ]{2}\s\d{3}\s[BDFGHJKLNPRSTVXYZ]$/ },
        { rx: /^\d\s[BDFGHJKLNPRSTVXYZ]{2}\s\d{3}$/ }
      ]
    }
  },
  BE: {
    name: "Belgium",
    patterns: { car: [{ rx: /^[1-9]-[A-Z]{3}-\d{3}$/ }, { rx: /^[A-Z]{3}-\d{3}$/ }] }
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
        { rx: /^[A-Z]{3}-\d{3}$/ },
        // storico: ABC-123
        { rx: /^[A-Z]{4}-\d{3}$/ },
        // nuovo: 2022→, AAAA-123
        { rx: /^[A-Z]{2}\d{2}-[A-Z]{2}$/ }
        // ampia (legacy/transitorio)
      ]
    }
  },
  RO: { name: "Romania", patterns: { car: [{ rx: /^[A-Z]{1,2}\s?\d{2,3}\s?[A-Z]{3}$/ }] } },
  BG: { name: "Bulgaria", patterns: { car: [{ rx: /^[A-Z]{1,2}\s?\d{4}\s?[A-Z]{1,2}$/ }] } },
  SI: { name: "Slovenia", patterns: { car: [{ rx: /^[A-Z]{2}-\d{3,4}-[A-Z]{1,2}$/ }] } },
  HR: { name: "Croatia", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{3,4}-[A-Z]{2}$/ }] } },
  GR: { name: "Greece", patterns: { car: [{ rx: /^[A-Z]{3}-\d{4}$/ }] } },
  LT: { name: "Lithuania", patterns: { car: [{ rx: /^[A-Z]{3}\s?\d{3}$/ }] } },
  LV: { name: "Latvia", patterns: { car: [{ rx: /^[A-Z]{2}-\d{4}$/ }] } },
  EE: { name: "Estonia", patterns: { car: [{ rx: /^\d{3}\s?[A-Z]{3}$/ }] } },
  UA: { name: "Ukraine", patterns: { car: [{ rx: /^[A-Z]{2}\s?\d{4}\s?[A-Z]{2}$/ }] } }
};

// src/index.ts
function normalize(input) {
  return String(input ?? "").toUpperCase().replace(/\s+/g, " ").trim();
}
function* pickPatternsFor(country, vehicleType) {
  const set = RX[country].patterns;
  if (vehicleType === "car" || vehicleType === "any") {
    for (const p of set.car ?? []) yield p.rx;
  }
  if (vehicleType === "motorcycle" || vehicleType === "any") {
    for (const p of set.motorcycle ?? []) yield p.rx;
  }
}
function validatePlate(plate, countries, options = {}) {
  const vehicleType = options.vehicleType ?? "any";
  const norm = normalize(plate);
  const picks = countries && countries.length ? countries.filter((c) => c in RX) : [...supportedCountries];
  if (!norm) {
    return { isValid: false, matches: [], checked: picks, errors: ["empty"] };
  }
  if (!picks.length) {
    return { isValid: false, matches: [], checked: [], errors: ["no_countries_selected"] };
  }
  const matches = [];
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
    errors: matches.length ? void 0 : ["no_match"]
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  COUNTRIES,
  COUNTRY_CODES,
  COUNTRY_NAMES,
  DISPLAY_FORMATS,
  FLAG_MAP,
  FLAG_TO_CODE,
  INPUTMASK_LAYOUTS,
  NAME_TO_CODE,
  RX,
  getCountryName,
  getDisplayFormat,
  getFlagSlug,
  getInputMask,
  normalize,
  normalizeCode,
  supportedCountries,
  validatePlate
});
//# sourceMappingURL=index.cjs.map
