// 👉 Definizione regex per ogni paese (estratto ridotto, poi puoi copiare la versione completa)
export type CountryKey = "IT" | "UK" | "DE" | "FR" | "ES";
export interface CountryDef { name: string; patterns: { rx: RegExp }[]; }

export const RX: Record<CountryKey, CountryDef> = {
  IT: { name: "Italy", patterns: [
    { rx: /^(?!EE)[A-HJ-NP-RTV-Z]{2}\s?\d{3}\s?[A-HJ-NP-RTV-Z]{2}$/ }
  ]},
  UK: { name: "United Kingdom", patterns: [
    { rx: /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/ },
    { rx: /^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,3}$/ }
  ]},
  DE: { name: "Germany", patterns: [
    { rx: /^[A-Z]{1,3}-[A-Z]{1,2}\s?\d{1,4}$/ }
  ]},
  FR: { name: "France", patterns: [
    { rx: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/ }
  ]},
  ES: { name: "Spain", patterns: [
    { rx: /^\d{4}\s?[BCDFGHJKLMNPRSTVWXYZ]{3}$/ }
  ]}
};
