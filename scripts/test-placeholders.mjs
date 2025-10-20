// scripts/test-placeholders.mjs
// @ts-nocheck
import {
  placeholderFromDisplayFormat,
  placeholderFromMasks,
  finalizeInputMaskLayouts,
} from "../src/utils/placeholders.ts";

let fails = 0;
const eq = (name, got, exp) => {
  if (got === exp) {
    console.log(`✅ ${name}: ${got}`);
  } else {
    console.error(`❌ ${name}: got "${got}", expected "${exp}"`);
    fails++;
  }
};

// ---- placeholderFromDisplayFormat
eq('AA 999 AA', placeholderFromDisplayFormat("AA 999 AA"), "__ ___ __");
eq('AA-999-AA', placeholderFromDisplayFormat("AA-999-AA"), "__-___-__");
eq('9999 BBB',  placeholderFromDisplayFormat("9999 BBB"),  "____ ___");
eq('multi pick', placeholderFromDisplayFormat("AA-999-AA | 99-AAA-9"), "__-___-__");

// ---- placeholderFromMasks
eq('mask single', placeholderFromMasks(["LL-999-LL"]), "__-___-__");
eq('mask multi',  placeholderFromMasks(["LL-999-LL","9-LL-999"]), "__-___-__");

// ---- finalizeInputMaskLayouts (inietta se manca)
const layouts = {
  IT: { mask: "HH 999 HH", placeholder: "" },
  FR: { mask: "LL-999-LL" }, // no placeholder
  ES: { mask: "9999 CCC", placeholder: "____ ___" }, // già presente → non toccare
};
const display = { IT: "AA 999 AA", FR: "AA-999-AA", ES: "9999 BBB" };
const out = finalizeInputMaskLayouts(layouts, display);

eq('finalize IT', out.IT.placeholder, "__ ___ __");
eq('finalize FR', out.FR.placeholder, "__-___-__");
eq('finalize ES unchanged', out.ES.placeholder, "____ ___");

if (fails) {
  console.error(`\n❌ ${fails} test(s) failed`);
  process.exit(1);
} else {
  console.log("\n🎉 All tests passed");
}
