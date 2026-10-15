// Issue #2 - Moldova syntax regression tests (run after npm run build).
import assert from "node:assert/strict";
import { supportedCountries, COUNTRY_CODES, COUNTRIES, RX, FLAG_MAP, normalizeCode, getFlagSlug, getCountryName, getInputMask, getDisplayFormat, validatePlate } from "../dist/index.js";

assert.ok(supportedCountries.includes("MD"));
assert.ok(COUNTRY_CODES.includes("MD"));
assert.ok(COUNTRIES.some((country) => country.code === "MD"));
assert.equal(normalizeCode("md"), "MD");
assert.equal(getFlagSlug("MD"), "md");
assert.equal(FLAG_MAP.MD, "md");
assert.equal(getCountryName("MD"), "Moldova");
assert.equal(RX.MD.name, "Moldova");
assert.match(getDisplayFormat("MD"), /MAI 9999/);
const mask = getInputMask("MD");
assert.ok(mask && Array.isArray(mask.mask));
assert.equal(mask.mask.length, 7);
assert.ok(mask.mask.includes("CD 999 LL"));

const positive = [
  ["standard", "ABC 123"], ["standard compact", "ABC123"],
  ["legacy", "AB CD 123"], ["legacy compact", "ABCD123"], ["legacy partially spaced", "ABCD 123"],
  ["Chișinău C", "C AB 123"], ["Chișinău K", "K AB 123"],
  ["diplomatic", "CD 123 AB"], ["diplomatic compact", "CD123AB"],
  ["MAI", "MAI 1234"], ["MAI lowercase", "mai1234"],
  ["Transnistria", "T 123 AB"], ["Transnistria compact", "T123AB"],
];
for (const [label, plate] of positive) {
  const result = validatePlate(plate, ["MD"], { vehicleType: "car" });
  assert.equal(result.isValid, true, `${label}: ${plate}`);
  assert.deepEqual(result.matches, [{ country: "MD", name: "Moldova" }]);
  assert.ok(validatePlate(plate).matches.some((match) => match.country === "MD"));
  assert.equal(validatePlate(plate, ["MD"], { vehicleType: "motorcycle" }).isValid, false);
}
const negative = ["", "AB 12", "ABC-123", "AB_CD_123", "AB CDE 123", "ABCDE123", "CD 12 AB", "CD 123 ABC", "MAI 12", "MAI 12345", "T 12 AB", "T 123 ABC", "C AB 12", "AAA 12A", "123 ABC"];
for (const plate of negative) {
  assert.equal(validatePlate(plate, ["MD"]).isValid, false, `Invalid MD plate: ${plate}`);
}
assert.deepEqual(validatePlate("ABC 123", ["ZZ"]).checked, []);
assert.deepEqual(validatePlate("ABC 123", ["ZZ"]).errors, ["no_countries_selected"]);
console.log(`Moldova regression: ${positive.length} valid + ${negative.length} invalid cases passed`);
