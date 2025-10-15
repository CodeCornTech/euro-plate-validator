# 🌍 @codecorn/euro-plate-validator

> 🚗 European license plate validator (Russia excluded).
> Multi-country, regex-based validation for EU/EEA license plates.
> Works in **Node.js**, **TypeScript**, and the **browser** (with a lightweight UI client).

[![Lang: IT](https://img.shields.io/badge/docs-Italiano-green?style=for-the-badge)](./README_IT.md)

---

[![@codecorn/euro-plate-validator](https://img.shields.io/badge/CODECORN-EURO--PLATE--VALIDATOR-green?style=for-the-badge&logo=vercel)](https://www.npmjs.com/package/@codecorn/euro-plate-validator)
[![npm](https://img.shields.io/npm/v/@codecorn/euro-plate-validator?logo=npm&label=version&style=for-the-badge)](https://www.npmjs.com/package/@codecorn/euro-plate-validator)
[![downloads](https://img.shields.io/npm/dm/@codecorn/euro-plate-validator?logo=npm&label=downloads&style=for-the-badge)](https://www.npmjs.com/package/@codecorn/euro-plate-validator)
[![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@codecorn/euro-plate-validator?label=jsDelivr%20hits&style=for-the-badge)](https://www.jsdelivr.com/package/npm/@codecorn/euro-plate-validator)
[![GitHub stars](https://img.shields.io/github/stars/CodeCornTech/euro-plate-validator?style=for-the-badge&logo=github)](https://github.com/CodeCornTech/euro-plate-validator)

[![CI Tests](https://github.com/CodeCornTech/euro-plate-validator/actions/workflows/test.yml/badge.svg)](https://github.com/CodeCornTech/euro-plate-validator/actions/workflows/test.yml)
[![issues](https://img.shields.io/github/issues/CodeCornTech/euro-plate-validator?label=issues)](https://github.com/CodeCornTech/euro-plate-validator/issues)
[![min](https://img.shields.io/bundlephobia/min/@codecorn/euro-plate-validator?label=min)](https://bundlephobia.com/package/@codecorn/euro-plate-validator)
[![minzip](https://img.shields.io/bundlephobia/minzip/@codecorn/euro-plate-validator?label=minzip)](https://bundlephobia.com/package/@codecorn/euro-plate-validator)
[![Types](https://img.shields.io/badge/TypeScript-types-blue?logo=typescript)](./dist/index.d.ts)
![module](https://img.shields.io/badge/module-ESM-brightgreen)
![cdn](https://img.shields.io/badge/cdn-IIFE-brightgreen)
[![License](https://img.shields.io/badge/license-MIT-informational)](LICENSE)

---

## ✨ Features

- ✅ **Multi-country** support (25+ EU/EEA)
- 🚫 **Russia excluded** by design
- 🔠 Normalizes input (spaces, hyphens, case)
- 🧠 Smart regex engine per-country (car/motorcycle aware)
- 🧩 Lightweight **client SDK** with UI, flags, dropdown, and `Inputmask` integration
- 🌐 Built-in i18n: **IT** and **EN**
- 🧯 Safe dependency autoload via CDN with configurable overrides

---

## 📦 Installation

```bash
npm install @codecorn/euro-plate-validator
```

---

## 🔗 CDN (v1.0.12)

> Use **versioned URLs** to avoid stale CDN caches.

### Core module

- **ESM (browser)**
  `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.12/dist/browser/index.esm.js`

- **IIFE (global `window.EuroPlateValidator`)**
  `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.12/dist/browser/index.iife.min.js`

### Client SDK (UI)

- **ESM**
  `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.12/dist/client/europlate.client.mjs`

- **CJS (Node)**
  `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.12/dist/client/europlate.client.cjs`

### Assets (CSS)

- `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.12/dist/assets/css/styles.css`
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

The browser client auto-generates a full UI (`flag + input + dropdown + status`) or attaches to an existing `<input>`.

### Core Options

```ts
type EuroPlateOptions = {
  // DOM
  input?: HTMLInputElement;
  wrapper?: string | HTMLElement | false;
  inputId?: string;
  inputName?: string;
  preserveInputAttrs?: boolean; // ✅ NEW (default false)
  autoFocusOnInit?: boolean; // ✅ NEW (default false)

  // UX / localization
  mode?: "AUTO" | string;
  i18n?: "AUTO" | "IT" | "EN";
  allowedCountries?: string[];
  vehicleType?: "any" | "car" | "bike";
  placeholders?: { auto?: string };

  // Formatting
  normalize?: (code: string) => string;
  formatters?: Record<string, (s: string) => string>;

  // Timings
  timings?: { debounce?: number; clear?: number };

  // Dependencies / debugging
  deps?: { inputmask?: any };
  autoLoadDeps?: { inputmask?: boolean }; // default true
  cdn?: { inputmask?: string };
  logger?: Logger;
  debug?: boolean;
};
```

### Instance methods

```ts
type EuroPlateInstance = {
  setCountry(code: "AUTO" | string): void;
  setMode(m: "AUTO" | string): void;
  setAllowed(codes: string[]): void;
  setVehicleType(t: "any" | "car" | "bike"): void;
  setI18n(code: "AUTO" | "IT" | "EN"): void;
  setDebug(on: boolean): void;
  validate(): { ok: boolean; country?: string; value: string };
  destroy(): void;
  getI18n(): "it" | "en";
};
```

---

## 💡 Usage Examples

### A) Manual dependency injection (`window.Inputmask`)

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.12/dist/assets/css/styles.css"
/>
<script src="https://cdn.jsdelivr.net/npm/inputmask@5.0.9/dist/inputmask.min.js"></script>

<script type="module">
  import * as EuroMod from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.12/dist/browser/index.esm.js";
  import { createEuroPlate } from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.12/dist/client/europlate.client.mjs";

  createEuroPlate(EuroMod, {
    wrapper: "#plateBox",
    mode: "AUTO",
    i18n: "IT",
    debug: true,
    autoFocusOnInit: false,
    deps: { inputmask: window.Inputmask },
  });
</script>
```

### B) Autoload dependencies from CDN (default)

```js
createEuroPlate(EuroMod, {
  wrapper: "#plateBox",
  i18n: "AUTO",
  debug: true,
  // Inputmask is auto-loaded from jsDelivr UMD
});
```

### C) Custom CDN override

```js
createEuroPlate(EuroMod, {
  wrapper: "#plateBox",
  cdn: {
    inputmask: "https://unpkg.com/inputmask@5.0.9/dist/inputmask.min.js",
  },
});
```

### D) Disable autoload completely (no-mask mode)

```js
createEuroPlate(EuroMod, {
  wrapper: "#plateBox",
  autoLoadDeps: { inputmask: false },
});
```

### E) Existing input (no auto-build)

```js
createEuroPlate(EuroMod, {
  input: document.getElementById("myPlate"),
  inputName: "plate_number",
  preserveInputAttrs: true,
  i18n: "EN",
  mode: "AUTO",
  autoFocusOnInit: false,
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

🇮🇹 IT | 🇬🇧 UK | 🇩🇪 DE | 🇫🇷 FR | 🇪🇸 ES | 🇵🇹 PT | 🇳🇱 NL | 🇧🇪 BE | 🇨🇭 CH | 🇦🇹 AT | 🇮🇪 IE | 🇱🇺 LU
🇩🇰 DK | 🇸🇪 SE | 🇳🇴 NO | 🇫🇮 FI | 🇵🇱 PL | 🇨🇿 CZ | 🇸🇰 SK | 🇭🇺 HU | 🇷🇴 RO | 🇧🇬 BG | 🇸🇮 SI | 🇭🇷 HR | 🇬🇷 GR
🇱🇹 LT | 🇱🇻 LV | 🇪🇪 EE | 🇺🇦 UA

---

## 🧾 Changelog (highlights)

### 1.0.12

- NEW → `autoFocusOnInit` (default: `false`) — prevents autofocus on init.
- NEW → `preserveInputAttrs` — keeps external input `id`/`name` intact.
- UX → renamed CSS classes from `.iti__*` → `.epv__*`.
- Dependencies → auto-loads `Inputmask` UMD via CDN; supports manual injection and CDN override.
- I18n → IT / EN / AUTO (auto-detect from browser locale).
- UX stability → dynamic placeholder, country-based formatter, debounce system.

### 1.0.10–11

- CSS/Assets consolidation.
- Added Client SDK + autoload fallback.
- Updated README, docs, and npm package.

---

## 📝 License

MIT © [CodeCorn™](https://codecorn.it) — see [LICENSE](LICENSE)

---

## 👤 Maintainer

**Federico Girolami**
Full-Stack Developer • System Integrator • Digital Solution Architect 🚀
🌐 [codecorn.it](https://codecorn.it)
📧 [f.girolami@codecorn.it](mailto:f.girolami@codecorn.it)
🐙 [github.com/fgirolami29](https://github.com/fgirolami29)

---

## 🤝 Contributing

Pull requests are welcome.
For major changes, please open an issue first.

> Powered by **CodeCorn™** 🚀

---
