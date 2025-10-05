// @ts-nocheck

// scripts/test-random.mjs
// Genera 3 targhe valide random per ognuno dei paesi supportati e le valida.
// Include anche un piccolo set di negative "fissi" per sanity.
// Richiede: build già eseguito (import dalla dist).

import { validatePlate, RX, supportedCountries } from "../dist/index.js";

// Helpers
const R = {
  L: () => String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  D: () => String(Math.floor(Math.random() * 10)),
  N: (n) => Array.from({ length: n }, () => R.D()).join(""),
  A: (n) => Array.from({ length: n }, () => R.L()).join(""),
};

function sampleIT() {
  // AA 999 AA evitando I O Q U e "EE"
  const letters = "ABCD EFGH J K LMN P RSTV WXYZ".replace(/\s/g, "").split("");
  const pick = () => letters[Math.floor(Math.random() * letters.length)];
  let a = pick() + pick();
  if (a === "EE") a = "AB";
  return `${a} ${R.N(3)} ${pick()}${pick()}`;
}

function sampleUK() {
  // Current AB12 CDE
  return `${R.A(2)}${R.N(2)} ${R.A(3)}`;
}

function sampleDE() {
  // 1–3 letters - 1–2 letters 1–4 digits
  const left = Math.random() < 0.33 ? R.A(1) : Math.random() < 0.5 ? R.A(2) : R.A(3);
  const mid = Math.random() < 0.5 ? R.A(1) : R.A(2);
  const right = R.N(1 + Math.floor(Math.random() * 4));
  return `${left}-${mid} ${right}`;
}

function sampleFR() {
  return `${R.A(2)}-${R.N(3)}-${R.A(2)}`;
}
function sampleES() {
  const consonants = "BCDFGHJKLMNPRSTVWXYZ";
  return `${R.N(4)} ${consonants[Math.floor(Math.random() * consonants.length)]}${
    consonants[Math.floor(Math.random() * consonants.length)]
  }${consonants[Math.floor(Math.random() * consonants.length)]}`;
}
function samplePT() {
  const variants = [
    () => `${R.N(2)}-${R.A(2)}-${R.N(2)}`,
    () => `${R.A(2)}-${R.N(2)}-${R.N(2)}`,
    () => `${R.N(2)}-${R.N(2)}-${R.A(2)}`,
  ];
  return variants[Math.floor(Math.random() * variants.length)]();
}
function sampleNL() {
  const v = [
    () => `${R.A(2)}-${R.N(3)}-${R.A(2)}`,
    () => `${R.N(2)}-${R.A(3)}-${R.N(1)}`,
    () => `${R.N(1)}-${R.A(3)}-${R.N(2)}`,
    () => `${R.A(2)}-${R.A(2)}-${R.N(2)}`,
    () => `${R.N(2)}-${R.A(2)}-${R.A(2)}`,
    () => `${R.A(3)}-${R.N(2)}-${R.A(1)}`,
  ];
  return v[Math.floor(Math.random() * v.length)]();
}
function sampleBE() {
  const v = [
    () => `${Math.floor(1 + Math.random() * 9)}-${R.A(3)}-${R.N(3)}`,
    () => `${R.A(3)}-${R.N(3)}`,
  ];
  return v[Math.floor(Math.random() * v.length)]();
}
function sampleCH() {
  return `${R.A(2)} ${R.N(1 + Math.floor(Math.random() * 6))}`;
}
function sampleAT() {
  // Ampio: 1–3 letters, digits 1–4, optional 0–2 letters with spaces
  const left = Math.random() < 0.33 ? R.A(1) : Math.random() < 0.5 ? R.A(2) : R.A(3);
  const rightL = Math.random() < 0.5 ? "" : " " + R.A(Math.random() < 0.5 ? 1 : 2);
  return `${left} ${R.N(1 + Math.floor(Math.random() * 4))}${rightL}`;
}
function sampleIE() {
  // 2–3 digits year - 1–2 letters county - 1–6 numbers
  const year = Math.random() < 0.5 ? R.N(2) : R.N(3);
  const county = Math.random() < 0.5 ? R.A(1) : R.A(2);
  const num = R.N(1 + Math.floor(Math.random() * 6));
  return `${year}-${county}-${num}`;
}
function sampleLU() {
  const v = [() => `${R.N(4)}`, () => `${R.N(2)}-${R.N(3)}`, () => `${R.N(6)}`];
  return v[Math.floor(Math.random() * v.length)]();
}
function sampleDK() {
  return `${R.A(2)} ${R.N(2)} ${R.N(3)}`;
}
function sampleSE() {
  return `${R.A(3)} ${R.N(2)}${Math.random() < 0.5 ? R.A(1) : R.N(1)}`;
}
function sampleNO() {
  return `${R.A(2)} ${R.N(5)}`;
}
function sampleFI() {
  return `${R.A(3)}-${R.N(3)}`;
}
function samplePL() {
  // Ampio ma sensato: 1–3 letters + space? + 4–5 mix alfanum con almeno un numero
  let prefix = Math.random() < 0.33 ? R.A(1) : Math.random() < 0.5 ? R.A(2) : R.A(3);
  let rest = "";
  while (rest.length < 4) {
    rest += Math.random() < 0.5 ? R.D() : R.L();
  }
  if (!/\d/.test(rest)) rest = "1" + rest.slice(1);
  return `${prefix} ${rest}`;
}
function sampleCZ() {
  return `${R.D()}${R.A(2)} ${R.N(4)}`;
}
function sampleSK() {
  const v = [() => `${R.A(2)} ${R.N(3)}${R.A(2)}`, () => `${R.A(2)}${R.N(4)}`];
  return v[Math.floor(Math.random() * v.length)]();
}
function sampleHU() {
  // Ungheria:
  // 1️⃣ Storico: ABC-123
  // 2️⃣ Nuovo (2022→): AAAA-123
  // 3️⃣ Legacy raro: AB12-CD
  const rnd = Math.random();
  if (rnd < 0.4) return `${R.A(3)}-${R.N(3)}`;
  if (rnd < 0.8) return `${R.A(4)}-${R.N(3)}`;
  return `${R.A(2)}${R.N(2)}-${R.A(2)}`;
}

function sampleRO() {
  const v = [
    () => `${R.A(1)} ${R.N(2)} ${R.A(3)}`,
    () => `${R.A(2)} ${R.N(2)} ${R.A(3)}`,
    () => `${R.A(2)} ${R.N(3)} ${R.A(3)}`,
  ];
  return v[Math.floor(Math.random() * v.length)]();
}
function sampleBG() {
  return `${Math.random() < 0.5 ? R.A(1) : R.A(2)} ${R.N(4)} ${
    Math.random() < 0.5 ? R.A(1) : R.A(2)
  }`;
}
function sampleSI() {
  return `${R.A(2)}-${R.N(3 + Math.floor(Math.random() * 2))}-${
    Math.random() < 0.5 ? R.A(1) : R.A(2)
  }`;
}
function sampleHR() {
  return `${R.A(2)} ${R.N(3 + Math.floor(Math.random() * 2))}-${R.A(2)}`;
}
function sampleGR() {
  return `${R.A(3)}-${R.N(4)}`;
}
function sampleLT() {
  return `${R.A(3)} ${R.N(3)}`;
}
function sampleLV() {
  return `${R.A(2)}-${R.N(4)}`;
}
function sampleEE() {
  return `${R.N(3)} ${R.A(3)}`;
}
function sampleUA() {
  return `${R.A(2)} ${R.N(4)} ${R.A(2)}`;
}

// Generatori per paese
const GEN = {
  IT: sampleIT,
  UK: sampleUK,
  DE: sampleDE,
  FR: sampleFR,
  ES: sampleES,
  PT: samplePT,
  NL: sampleNL,
  BE: sampleBE,
  CH: sampleCH,
  AT: sampleAT,
  IE: sampleIE,
  LU: sampleLU,
  DK: sampleDK,
  SE: sampleSE,
  NO: sampleNO,
  FI: sampleFI,
  PL: samplePL,
  CZ: sampleCZ,
  SK: sampleSK,
  HU: sampleHU,
  RO: sampleRO,
  BG: sampleBG,
  SI: sampleSI,
  HR: sampleHR,
  GR: sampleGR,
  LT: sampleLT,
  LV: sampleLV,
  EE: sampleEE,
  UA: sampleUA,
};

// Negative fisse
const NEG = [
  { plate: "EE 123 AA", countries: ["IT"] }, // IT: vietato
  { plate: "B 1234-MA", countries: ["DE"] }, // DE ordine invertito
  { plate: "AB_123_CD", countries: ["FR"] }, // FR separatore errato
];

let pass = 0,
  fail = 0;

function ok(m) {
  console.log("\x1b[32m%s\x1b[0m", "✔ " + m);
}
function ko(m) {
  console.error("\x1b[31m%s\x1b[0m", "✘ " + m);
}

for (const cc of supportedCountries) {
  const gen = GEN[cc];
  if (!gen) {
    console.warn(`No generator for ${cc}`);
    continue;
  }
  for (let i = 0; i < 3; i++) {
    const p = gen();
    const r = validatePlate(p, [cc], { vehicleType: "any" });
    if (r.isValid) {
      pass++;
      ok(`${cc} "${p}"`);
    } else {
      fail++;
      ko(`${cc} "${p}" → ${JSON.stringify(r)}`);
    }
  }
}

for (const n of NEG) {
  const r = validatePlate(n.plate, n.countries, { vehicleType: "any" });
  if (!r.isValid) {
    pass++;
    ok(`NEG rejected "${n.plate}" in ${n.countries.join(",")}`);
  } else {
    fail++;
    ko(`NEG accepted "${n.plate}" → ${JSON.stringify(r.matches)}`);
  }
}

console.log(`\nResult: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
