Perfetto: aggiorniamo **NL**, **RO (Romania)** e **SK (Slovacchia)** sia come **regex** (RX) sia come **Inputmask**/display.

Di seguito solo i blocchi da incollare in `src/countries.ts` nelle rispettive sezioni (puoi sostituire integralmente i tre paesi). Ho mantenuto l’approccio “syntax-only” ma con formati moderni corretti e (per NL) il set lettere senza vocali/C/Q/M/W come richiesto.

---

# 1) Netherlands — NL

### Regex (RX)

```ts
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
      { rx: /^[BDFGHJKLNPRSTVXYZ]-\d{3}-[BDFGHJKLNPRSTVXYZ]{2}$/ },     // A-001-AA
      { rx: /^[BDFGHJKLNPRSTVXYZ]{2}-\d{3}-[BDFGHJKLNPRSTVXYZ]$/ },     // AA-001-A
      { rx: /^\d-[BDFGHJKLNPRSTVXYZ]{2}-\d{3}$/ },                       // 0-AA-001

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
```

> Nota lettere NL: `[BDFGHJKLNPRSTVXYZ]` = niente vocali **AEIOU**, niente **C/Q** e niente **M/W** (come da regole recenti). Manteniamo comunque varianti con spazi per evitare falsi negativi in input non formattati.

### DISPLAY_FORMATS

```ts
// aggiungi/aggiorna
NL: "AA-999-AA | 99-AAA-9 | A-999-AA | AA-999-A | 9-AA-999",
```

### INPUTMASK_LAYOUTS (multi-mask con alfabeto NL)

```ts
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
  placeholder: "",       // no underscore
  keepStatic: true,
  showMaskOnHover: false,
  showMaskOnFocus: false,
},
```

---

# 2) Romania — RO

### Regex (RX)

```ts
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
```

*(Opzionale: potresti restringere le 2 lettere alle contee valide, ma così eviti falsi negativi.)*

### DISPLAY_FORMATS

```ts
RO: "BB 99 AAA / B 999 AAA",
```

### INPUTMASK_LAYOUTS

```ts
RO: {
  mask: [
    "AA 99 AAA",
    "AA 999 AAA",
    "A 99 AAA",     // B 99 AAA
    "A 999 AAA"     // B 999 AAA
  ],
  definitions: {
    A: { validator: "[A-Z]", casing: "upper" }
  },
  placeholder: "",
  keepStatic: true,
  showMaskOnHover: false,
  showMaskOnFocus: false,
},
```

---

# 3) Slovakia — SK

### Regex (RX)

```ts
SK: {
  name: "Slovakia",
  patterns: {
    car: [
      // Formato tipico: DD-999LL (con o senza trattino/spazio)
      { rx: /^[A-Z]{2}[-\s]?\d{3}[A-Z]{2}$/ },
    ],
  },
},
```

### DISPLAY_FORMATS

```ts
SK: "AA-999 AA",
```

### INPUTMASK_LAYOUTS

```ts
SK: {
  mask: [
    "AA-999 AA",
    "AA999AA",
    "AA 999 AA"
  ],
  definitions: {
    A: { validator: "[A-Z]", casing: "upper" }
  },
  placeholder: "",
  keepStatic: true,
  showMaskOnHover: false,
  showMaskOnFocus: false,
},
```

---

## Consigli rapidi

* Ricorda di **non** imporre la maschera NL in **AUTO**: applicala solo quando hai match NL o quando l’utente seleziona NL dal picker.
* Se temi falsi negativi su NL per le esclusioni lettere troppo rigide, puoi allentare l’alfabeto a `[A-Z]` **solo nei regex**, ma lasciare l’alfabeto ristretto **nella mask** (UX pulita in digitazione, tollerante in validazione).

Se vuoi, ti preparo una PR testabile con questi blocchi + unit test rapidi (snapshot) per:
`"AA-123-AA"`, `"1-AAA-12"`, `"0-AA-001"`, `"GJ 12 ABC"`, `"B 999 XYZ"`, `"BA-123CD"`.
