# 🌍 @codecorn/euro-plate-validator

> 🚗 European license plate validator (Russia excluded). Multi-country, regex-based validation for EU/EEA license plates. Works in **Node.js**, **TypeScript**, and the **browser** (with a lightweight UI client).

[![Lang: IT](https://img.shields.io/badge/docs-Italiano-green?style=for-the-badge)](./README_IT.md)

---

[![@codecorn/euro-plate-validator](https://img.shields.io/badge/CODECORN-EURO--PLATE--VALIDATOR-green?style=for-the-badge&logo=vercel)](https://www.npmjs.com/package/@codecorn/euro-plate-validator) [![npm](https://img.shields.io/npm/v/@codecorn/euro-plate-validator?logo=npm&label=version&style=for-the-badge)](https://www.npmjs.com/package/@codecorn/euro-plate-validator) [![downloads](https://img.shields.io/npm/dm/@codecorn/euro-plate-validator?logo=npm&label=downloads&style=for-the-badge)](https://www.npmjs.com/package/@codecorn/euro-plate-validator) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@codecorn/euro-plate-validator?label=jsDelivr%20hits&style=for-the-badge)](https://www.jsdelivr.com/package/npm/@codecorn/euro-plate-validator) [![GitHub stars](https://img.shields.io/github/stars/CodeCornTech/euro-plate-validator?style=for-the-badge&logo=github)](https://github.com/CodeCornTech/euro-plate-validator)

[![CI Tests](https://github.com/CodeCornTech/euro-plate-validator/actions/workflows/test.yml/badge.svg)](https://github.com/CodeCornTech/euro-plate-validator/actions/workflows/test.yml) [![issues](https://img.shields.io/github/issues/CodeCornTech/euro-plate-validator?label=issues)](https://github.com/CodeCornTech/euro-plate-validator/issues) [![min](https://img.shields.io/bundlephobia/min/@codecorn/euro-plate-validator?label=min)](https://bundlephobia.com/package/@codecorn/euro-plate-validator) [![minzip](https://img.shields.io/bundlephobia/minzip/@codecorn/euro-plate-validator?label=minzip)](https://bundlephobia.com/package/@codecorn/euro-plate-validator) [![Types](https://img.shields.io/badge/TypeScript-types-blue?logo=typescript)](./dist/index.d.ts) ![module](https://img.shields.io/badge/module-ESM-brightgreen) ![cdn](https://img.shields.io/badge/cdn-IIFE-brightgreen) [![License](https://img.shields.io/badge/license-MIT-informational)](LICENSE)

---

## ✨ Features

- ✅ **Multi-country** support (25+ EU/EEA)
- 🚫 **Russia excluded** by design
- 🔠 Normalizes input (spaces, hyphens, case)
- 🧠 Smart regex engine per-country (car/motorcycle aware)
- 🧩 Lightweight **client SDK** with UI, flags, dropdown, and `Inputmask` integration
- ↕️ Accepts **lowercase** input, auto-coerced to **UPPERCASE** by mask token `L`
- 🌐 Built-in i18n: **IT** and **EN**
- 🧯 Safe dependency autoload via CDN with configurable overrides

---

## 📦 Installation

```bash
npm install @codecorn/euro-plate-validator
```

---

## 🔗 CDN (v1.0.14)

> Use **versioned URLs** to avoid stale CDN caches.

### Core module

- **ESM (browser)** `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/browser/index.esm.js`

- **IIFE (global `window.EuroPlateValidator`)** `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/browser/index.iife.min.js`

### Client SDK (UI)

- **ESM** `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/client/index.mjs`

- **CJS (Node)** `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/client/europlate.client.cjs`

### Assets (CSS)

- `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/assets/css/styles.css`
- (compat alias) `…/assets/css/styles.css`

---

## 🧠 Core API

### Node.js / TypeScript

```ts
import { validatePlate } from "@codecorn/euro-plate-validator";

// Italy (car)
validatePlate("AB 123 CD", ["IT"], { vehicleType: "car" });
// → { isValid: true, matches: [{country:"IT", name:"Italy"}], checked:["IT"] }

// UK vs IE
validatePlate("AB12 CDE", ["UK", "IE"]);
```

---

## 🧩 Browser Client SDK — `createEuroPlate()`

The browser client auto-generates a full UI (`flag + input + dropdown + status`) or attaches to an existing `<input>`. ecco la versione **EN** tradotta 1 : 1 . Ho lasciato **il codice invariato** , e ho applicato lo spazio prima / dopo la punteggiatura solo al testo in prosa .

---

## 🧠 Core API ( Node / TS )

```ts
import { validatePlate } from "@codecorn/euro-plate-validator";

// IT (car)
validatePlate("AB 123 CD", ["IT"], { vehicleType: "car" });
// → { isValid: true, matches:[{country:"IT", name:"Italy"}], checked:["IT"] }

// UK vs IE
validatePlate("AB12 CDE", ["UK", "IE"]);
```

---

## 🧩 Client SDK ( UI ) — `createEuroPlate`

The client either generates the markup ( flag + input + country dropdown + status ) **or** attaches to an existing input .

### Main options ( including new ones )

```ts
type EuroPlateOptions = {
  // DOM
  input?: HTMLInputElement; // external input
  wrapper?: string | HTMLElement | false; // if provided → auto-build UI
  inputId?: string; // default: derived ( e.g., "epv-xxxx-plate" )
  inputName?: string; // default: same
  preserveInputAttrs?: boolean; // NEW: if true, does NOT overwrite existing id/name
  autoFocusOnInit?: boolean; // NEW: default false ( no focus on init )

  // ⚙️ UI configuration ( new: EVERYTHING under "ui" )
  ui?: {
    /**
     * Where to show the status :
     * - "block"  → uses <div class="status"> under the input ( back-compat , default )
     * - "inline" → overlays inside the input , does not change height
     * - "off"    → hides status text / icon
     */
    statusMode?: "block" | "inline" | "off"; // default: "block"

    /** Icon type for inline status ( ignored in "block" and "off" ) */
    statusIcon?: "none" | "icon" | "pill"; // default: "none"

    /** Whether to show status text */
    showStatusText?: boolean; // default: block→true , inline→false

    /** Inline icon position */
    iconPosition?: "right" | "left"; // default: "right"

    // Optional references to existing nodes ( when NOT using wrapper )
    flagIcon?: HTMLElement;
    flagLabel?: HTMLElement;
    dropdown?: HTMLElement;
    button?: HTMLElement;
    status?: HTMLElement;
  };

  // UX / i18n
  mode?: "AUTO" | string; // fixed country or AUTO ( default )
  i18n?: "AUTO" | "IT" | "EN"; // default AUTO → navigator it / en
  allowedCountries?: string[]; // whitelist ; default : all
  vehicleType?: "any" | "car" | "bike"; // default : any
  placeholders?: { auto?: string }; // placeholder for AUTO

  // Normalization / formatting
  normalize?: (code: string) => string; // default GB→UK
  formatters?: Record<string, (s: string) => string>; // per country code

  // Timings
  timings?: { debounce?: number; clear?: number };

  // Dependencies / logging
  deps?: { inputmask?: any }; // manual inject ( e.g., window.Inputmask )
  autoLoadDeps?: { inputmask?: boolean }; // default : true ( autoload UMD )
  cdn?: { inputmask?: string }; // override Inputmask CDN URL
  logger?: Logger;
  debug?: boolean;
};
```

#### Values and defaults ( UI )

| Key                                                 | Type                           | Values               | Default                       | Notes                                                                                     |
| --------------------------------------------------- | ------------------------------ | -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `ui.statusMode`                                     | `"block" \| "inline" \| "off"` | block / inline / off | `"block"`                     | _block_ uses `<div class="status">` , _inline_ overlays inside the input , _off_ hides UI |
| `ui.statusIcon`                                     | `"none" \| "icon" \| "pill"`   | none / icon / pill   | `"none"`                      | used **only** when `statusMode` is `inline`                                               |
| `ui.showStatusText`                                 | `boolean`                      | true / false         | `block→true` , `inline→false` | short text in inline ; full text in block                                                 |
| `ui.iconPosition`                                   | `"right" \| "left"`            | right / left         | `"right"`                     | icon position for inline                                                                  |
| `ui.status`                                         | `HTMLElement` ( optional )     | —                    | auto created / derived        | existing host for status when you do not use `wrapper`                                    |
| `ui.button` / `dropdown` / `flagIcon` / `flagLabel` | `HTMLElement` ( optional )     | —                    | auto created if `wrapper`     | for re-using external DOM                                                                 |

---

### Instance methods

```ts
type EuroPlateInstance = {
  setCountry(code: "AUTO" | string): void; // alias of setMode
  setMode(m: "AUTO" | string): void; // set fixed country or AUTO
  setAllowed(codes: string[]): void; // dynamic whitelist
  setVehicleType(t: "any" | "car" | "bike"): void;
  setI18n(code: "AUTO" | "IT" | "EN"): void;
  setDebug(on: boolean): void;

  validate(): { ok: boolean; country?: string; value: string };
  destroy(): void;
  getI18n(): "it" | "en";
};
```

---

## 🖼️ Usage examples

### A ) Quick start with a shared `common` config + autoload deps ( Inputmask , jQuery , Toastr )

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/assets/css/styles.css" />

<div id="plateBox"></div>

<script type="module">
  import * as EuroMod from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/browser/index.esm.js";
  import { createEuroPlate } from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/client/index.mjs";

  // Common options used across examples
  const common = {
    mode: "AUTO",
    i18n: "IT",
    allowedCountries: ["IT", "FR", "DE", "ES"],
    vehicleType: "any",
    autoFocusOnInit: false,
    ui: {
      statusMode: "inline",
      statusIcon: "icon",
      showStatusText: true, // | false
      iconPosition: "right",
    },
    // Autoload deps (UMD) from CDN
    autoLoadDeps: { inputmask: true, jquery: true, toastr: true },

    // Optional : route logs to Toastr if available
    useToastrLogger: true,

    debug: true,
  };

  createEuroPlate(EuroMod, {
    wrapper: "#plateBox", // optional
    ...common,
  });
</script>
```

> Notes :
>
> - With `autoLoadDeps.jquery: true` and `autoLoadDeps.toastr: true` the client will fetch UMD builds from CDN when missing .
> - `useToastrLogger: true` sends SDK logs and validation notices to Toastr if it is present ( either auto-loaded or injected ) .
> - jQuery is **not** required by the core validator ; it is only pulled if your page / widgets rely on it .

---

### B ) You provide `Inputmask` manually ( UMD → `window.Inputmask` )

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/assets/css/styles.css" />
<script src="https://cdn.jsdelivr.net/npm/inputmask@5.0.9/dist/inputmask.min.js"></script>

<script type="module">
  import * as EuroMod from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/browser/index.esm.js";
  import { createEuroPlate } from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/client/index.mjs";

  createEuroPlate(EuroMod, {
    wrapper: "#plateBox",
    i18n: "AUTO",
    autoFocusOnInit: false,
    deps: { inputmask: window.Inputmask }, // manual inject
  });
</script>
```

---

### C ) Autoload deps from CDN ( default , Inputmask only )

```html
<script type="module">
  import * as EuroMod from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/browser/index.esm.js";
  import { createEuroPlate } from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/client/index.mjs";

  createEuroPlate(EuroMod, {
    wrapper: "#plateBox",
    i18n: "AUTO",
    autoFocusOnInit: false,
    // No deps object → will autoload Inputmask UMD from jsDelivr
  });
</script>
```

---

### D ) Autoload ON with a custom CDN URL

```js
createEuroPlate(EuroMod, {
  wrapper: "#plateBox",
  cdn: { inputmask: "https://unpkg.com/inputmask@5.0.9/dist/inputmask.min.js" },
});
```

---

### E ) Disable autoload ( “no mask” fallback , no error )

```js
createEuroPlate(EuroMod, {
  wrapper: "#plateBox",
  autoLoadDeps: { inputmask: false },
});
```

---

### F ) Attach to an existing input ( no auto-build )

```html
<input id="myPlate" />
<script type="module">
  import * as EuroMod from ".../index.esm.js";
  import { createEuroPlate } from ".../index.mjs";

  createEuroPlate(EuroMod, {
    input: document.getElementById("myPlate"),
    inputName: "plate_number",
    preserveInputAttrs: true, // do NOT overwrite existing id/name
    i18n: "EN",
    mode: "AUTO",
    autoFocusOnInit: false,
  });
</script>
```

---

## 🧩 WordPress ( WP ) / Elementor

### 1 ) Enqueue CSS + init helper ( type = "module" )

```php
add_action('wp_enqueue_scripts', function () {
  wp_register_script('epv-init', '', [], null, true);

  wp_enqueue_style(
    'epv-styles',
    'https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/assets/css/styles.css',
    [],
    '1.0.14'
  );

  add_filter('script_loader_tag', function ($tag, $handle) {
    if ($handle === 'epv-init') {
      return '<script type="module">' .
        'import * as EuroMod from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/browser/index.esm.js";' .
        'import { createEuroPlate } from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.14/dist/client/index.mjs";' .
        'window.__epvInit=(id,opts)=>createEuroPlate(EuroMod,Object.assign({wrapper:"#"+id,mode:"AUTO",i18n:"IT",debug:true,autoFocusOnInit:false},opts||{}));' .
      '</script>';
    }
    return $tag;
  }, 10, 2);

  wp_enqueue_script('epv-init');
});
```

---

## ⚙️ WordPress / Elementor integration

You can enqueue the CSS and auto-inject a `window.__epvInit` bootstrapper.

Then, create a shortcode to instantiate it dynamically inside Elementor.

Full example available in the [Italian README](./README_IT.md) → _“WordPress (WP) / Elementor”_ section.

---

## 🧪 CLI Tool

```bash
npx @codecorn/euro-plate-validator "AB 123 CD" --countries IT,FR,DE --type car --pretty
```

**Options:**

- `--countries` / `-c` → comma-separated list of country codes
- `--type` / `-t` → `car`, `motorcycle`, or `any`
- `--pretty` / `-p` → human-readable output

Exit codes:

- `0` → valid
- `1` → invalid
- `2` → bad arguments

---

## 🌍 Supported Countries

🇮🇹 IT | 🇬🇧 UK | 🇩🇪 DE | 🇫🇷 FR | 🇪🇸 ES | 🇵🇹 PT | 🇳🇱 NL | 🇧🇪 BE | 🇨🇭 CH | 🇦🇹 AT | 🇮🇪 IE | 🇱🇺 LU 🇩🇰 DK | 🇸🇪 SE | 🇳🇴 NO | 🇫🇮 FI | 🇵🇱 PL | 🇨🇿 CZ | 🇸🇰 SK | 🇭🇺 HU | 🇷🇴 RO | 🇧🇬 BG | 🇸🇮 SI | 🇭🇷 HR | 🇬🇷 GR 🇱🇹 LT | 🇱🇻 LV | 🇪🇪 EE | 🇺🇦 UA

---

## 🧾 Changelog (highlights)

### 1.0.14

- **Inputmask**
  - Safe merge of `definitions` (no hard override of defaults).
  - New **`L`** token (letter) accepts lowercase and forces **UPPERCASE** (`casing: "upper"`).
  - Avoid redefining `A`/`9`; use `H` (IT) / `C` (ES) only when needed.
  - `applyMaskNow` applied immediately on country change (no debounce race).
  - Finalized placeholders via `finalizeInputMaskLayouts` + `scripts/test-placeholders.mjs`.

- **Client SDK**
  - Centralized logging (`imLog`, `imPreLog`, `imMounted`, `imError`) using `BADGE/LOG` when `debug: true`.
  - Lowercase input supported across layouts with `L` token.
  - Examples updated with `autoLoadDeps: { inputmask: true, jquery: true, toastr: true }` and `useToastrLogger: true`.

- **Docs**
  - CDN bumped to **1.0.14**.
  - Notes about lowercase acceptance and uppercase coercion.
  - Guidance to **not** override `A`/`9` and define only custom tokens for restricted alphabets.

---

### 1.0.13

- **Status inline configurabile**
  - `statusMode: "inline" | "block" | "off"`
  - `statusIcon: "none" | "icon" | "pill"`
  - `showStatusText: boolean`
  - `iconPosition: "left" | "right"`

- Riserva spazio automatica via `:has([data-state])`
- Nessuno stato su campo vuoto / parziale
- Fix cambio paese (IT↔FR) e Inputmask merge (`A/H/9`)
- Refactor UI status (`setValidityUI` unico writer)
- Add `clearStatusUI()` per idle neutro

---

### 1.0.12

- NEW → `autoFocusOnInit` (default: `false`) — prevents autofocus on init.
- NEW → `preserveInputAttrs` — keeps external input `id`/`name` intact.
- UX → renamed CSS classes from `.iti__*` → `.epv__*`.
- Dependencies → auto-loads `Inputmask` UMD via CDN; supports manual injection and CDN override.
- I18n → IT / EN / AUTO (auto-detect from browser locale).
- UX stability → dynamic placeholder, country-based formatter, debounce system.

---

### 1.0.10–11

- CSS/Assets consolidation.
- Added Client SDK + autoload fallback.
- Updated README, docs, and npm package.

---

## 📝 License

MIT © [CodeCorn™](https://codecorn.it) — see [LICENSE](LICENSE)

---

## 👤 Maintainer

**Federico Girolami** Full-Stack Developer • System Integrator • Digital Solution Architect 🚀 🌐 [codecorn.it](https://codecorn.it) 📧 [f.girolami@codecorn.it](mailto:f.girolami@codecorn.it) 🐙 [github.com/fgirolami29](https://github.com/fgirolami29)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

> Powered by **CodeCorn™** 🚀

---
