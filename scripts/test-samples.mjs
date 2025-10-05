// @ts-nocheck
// scripts/test-samples.mjs
// Esegue test di convalida su 3 esempi per ogni nazione (più qualche negativa).
// Richiede che la build sia già stata eseguita (import dalla dist).

import { validatePlate } from "../dist/index.js";

/** Mini helper */
function t(plate, countries, opts = { vehicleType: "any" }) {
  const res = validatePlate(plate, countries, opts);
  return { plate, countries, res };
}

const POS = {
  IT: ["AB 123 CD", "CN 456 XY", "DL789GH", "FR030ST", "FR 030 ST"], // car
  UK: ["AB12 CDE", "A1", "ABC 1234"], // car (current + legacy)
  DE: ["B-MA 1234", "RA-KL 8136", "M-A 1"], // car (standard)
  FR: ["AB-123-CD", "CR-001-ZZ", "ZZ-999-AA"],
  ES: ["1234 BBB", "0001 HNP", "4321 ZZZ"],
  PT: ["12-AB-34", "AB-12-34", "12-34-AB"],
  NL: [
    "XT-347-SJ", // AA-999-AA
    "27-JKL-8", // 99-AAA-9
    "Z-045-LN", // A-999-AA
    "7-JS-502",
  ], // 9-AA-999
  // NL: ["AB-123-CD", "12-ABC-3", "A-ABC-12"],
  BE: ["1-ABC-123", "ABC-123", "9-ZZZ-999"],
  CH: ["ZH 123456", "TI 9", "GE 1234"],
  AT: ["W 1234", "L 12 AB", "G 1"],
  IE: ["24-D-12345", "152-D-1", "99-W-123456"],
  LU: ["1234", "12-345", "123456"],
  DK: ["AB 12 345", "CD12345", "EF 12 345"],
  SE: ["ABC 12A", "XYZ12B", "AAA 123"],
  NO: ["AB 12345", "CD12345", "EF 00001"],
  FI: ["ABC-123", "XYZ-001", "AAA-999"],
  PL: ["WA12345", "KR 1A23B", "PO ABC12"],
  CZ: ["1AB 2345", "2BC2345", "5AZ 0001"],
  SK: ["BA 123 AB", "TT1234", "NR 1234"],
  HU: ["ABC-123", "AB12-CD", "XYZ-001"],
  RO: ["B 123 ABC", "CJ23 ABC", "TM 9 ABC"],
  BG: ["CB 1234 PC", "TX1234AB", "PB 0001 AH"],
  SI: ["LJ-1234-A", "MB-123-BB", "KP-1234-A"],
  HR: ["ZG 1234-AB", "RI123-AB", "ST 1234-AA"],
  GR: ["AAA-1234", "XYZ-0001", "ABC-9999"],
  LT: ["ABC 123", "ZZZ123", "AAA 001"],
  LV: ["AB-1234", "ZZ-0001", "AA-9999"],
  EE: ["123 ABC", "001 ABC", "999 ZZZ"],
  UA: ["AA 1234 BB", "BC1234DE", "AK 0001 AA"],
};

// Alcune negative per rumore
const NEG = [
  // IT vieta I O Q U e "EE..."
  { plate: "EE 123 AA", countries: ["IT"] },
  { plate: "AI 123 AU", countries: ["IT"] },
  // UK formati impossibili
  { plate: "ABCD 12", countries: ["UK"] },
  // DE invertito
  { plate: "B 1234-MA", countries: ["DE"] },
  // FR separatori sbagliati
  { plate: "AB_123_CD", countries: ["FR"] },
];

let pass = 0,
  fail = 0;

function logOk(msg) {
  console.log("\x1b[32m%s\x1b[0m", "✔ " + msg);
}
function logErr(msg) {
  console.error("\x1b[31m%s\x1b[0m", "✘ " + msg);
}

for (const [cc, samples] of Object.entries(POS)) {
  const countries = [cc];
  for (const s of samples) {
    const { res } = t(s, countries);
    if (res.isValid) {
      pass++;
      logOk(`${cc} OK: "${s}" → ${JSON.stringify(res.matches)}`);
    } else {
      fail++;
      logErr(`${cc} FAIL(valid): "${s}" → ${JSON.stringify(res)}`);
    }
  }
}

for (const n of NEG) {
  const { res } = t(n.plate, n.countries);
  if (!res.isValid) {
    pass++;
    logOk(`NEG OK(rejected): "${n.plate}" in ${n.countries.join(",")}`);
  } else {
    fail++;
    logErr(`NEG FAIL(should reject): "${n.plate}" matched ${JSON.stringify(res.matches)}`);
  }
}

console.log(`\nResult: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
