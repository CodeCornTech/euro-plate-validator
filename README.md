# 🌍 @codecorn/euro-plate-validator

> 🚗 European license plate validator (Russia excluded).  
> Multi-country regex-based syntax validation for EU/EEA license plates.  
> Supports Node.js (TypeScript/JavaScript) and PHP implementations.

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

- ✅ **Multi-country support** (25+ EU/EEA countries)
- 🚫 **Russia excluded** by design
- 🔠 Normalizes input (spaces, hyphens)
- 🖥 Available for **Node.js/TypeScript** and **PHP**
- 📦 Ready to publish on **npm**

---

## CDN quick links

> Usa URL **versionati** per evitare cache vecchie del CDN. Sostituisci `1.0.5` con l’ultima.

- **ESM (browser)**

  - jsDelivr: `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.5/dist/browser/index.esm.min.js`
  - UNPKG: `https://unpkg.com/@codecorn/euro-plate-validator@1.0.5/dist/browser/index.esm.min.js`

- **IIFE (global `window.EuroPlate`)**
  - jsDelivr: `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.5/dist/browser/index.iife.min.js`
  - UNPKG: `https://unpkg.com/@codecorn/euro-plate-validator@1.0.5/dist/browser/index.iife.min.js`

<sub>Se vedi file non aggiornati, forza il purge:  
`https://purge.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.5/dist/browser/index.iife.min.js`</sub>

---

## 📦 Installation

### Node.js / TypeScript

```bash
npm install @codecorn/euro-plate-validator
```

### PHP

Scarica `EuroPlateValidator.php` nella tua codebase.

---

## 🚀 Usage

### Node.js / TypeScript

```ts
import { validatePlate } from "@codecorn/euro-plate-validator";

// Italy
console.log(validatePlate("AB 123 CD", ["IT"]));
// -> { isValid: true, matches: [{country:"IT", name:"Italy"}], checked:["IT"] }

// UK
console.log(validatePlate("AB12 CDE", ["UK", "IE"]));
```

**Esempi veloci:**

```ts
import { validatePlate } from "./dist/index.js";

validatePlate("AB 123 CD", ["IT"], { vehicleType: "car" }); // ✅ IT Car
validatePlate("AA 12345", ["IT"], { vehicleType: "motorcycle" }); // ✅ IT Moto
validatePlate("AA 12345", ["IT"], { vehicleType: "car" }); // ❌ (no_match)
```

### Come si usa il toggle senza toccare il file

* **Abilita da HTML:**

  ```html
  <script type="module" src="demo.js" data-europlate-debug="1"></script>
  ```
* **Oppure runtime:**

  ```js
  enableEuroPlateDebug(true);   // ON
  enableEuroPlateDebug(false);  // OFF
  ```

### Per un logger esterno (opzionale)

```js
window.EuroPlateLogger = {
  debug: (...a) => console.debug('[MYLOG]', ...a),
  info:  (...a) => console.info('[MYLOG]', ...a),
  warn:  (...a) => console.warn('[MYLOG]', ...a),
  error: (...a) => console.error('[MYLOG]', ...a),
  notify: (msg, type='info') => {
    // integra con Sentry/Toast/Datadog/etc
  }
};
```

Così tieni il codice **pulito**, i log “di sviluppo” sono **a scomparsa** e puoi innestare qualsiasi pipeline di logging quando vuoi, senza toccare il core.

### PHP

```php
require '_php_variant/EuroPlateValidator.php';

print_r(validate_plate("AB 123 CD", ["IT"], "car"));
print_r(validate_plate("AA 12345", ["IT"], "motorcycle"));
```

### 🔧 CLI

```bash
npx @codecorn/euro-plate-validator "AB 123 CD" --countries IT,FR,DE --type car --pretty
```

Opzioni:

- `--countries` / `-c`: lista di country code (comma-sep)
- `--type` / `-t`: `car` | `motorcycle` | `any` (default: `any`)
- `--pretty` / `-p`: output leggibile

Exit code: `0` se valido, `1` se non valido, `2` argomenti errati.

**Esempi CLI:**

```bash
# Car IT
npx euro-plate-validator "AB 123 CD" --countries IT --type car --pretty

# Moto IT
npx euro-plate-validator "AA 12345" --countries IT --type motorcycle --pretty

# UK / IE
npx euro-plate-validator "AB12 CDE" --countries UK,IE --type any
```

---

## 🌍 Supported Countries

🇮🇹 IT | 🇬🇧 UK | 🇩🇪 DE | 🇫🇷 FR | 🇪🇸 ES | 🇵🇹 PT | 🇳🇱 NL | 🇧🇪 BE | 🇨🇭 CH | 🇦🇹 AT | 🇮🇪 IE | 🇱🇺 LU
🇩🇰 DK | 🇸🇪 SE | 🇳🇴 NO | 🇫🇮 FI | 🇵🇱 PL | 🇨🇿 CZ | 🇸🇰 SK | 🇭🇺 HU | 🇷🇴 RO | 🇧🇬 BG | 🇸🇮 SI | 🇭🇷 HR | 🇬🇷 GR
🇱🇹 LT | 🇱🇻 LV | 🇪🇪 EE | 🇺🇦 UA

---

## 📝 License

MIT © [CodeCorn™](https://codecorn.it)

Distribuito sotto licenza [MIT](LICENSE).

---

## 👤 Maintainer

<div style="display: flex; justify-content: space-between; align-items: center;"> 
  <div> 
    <p><strong>👨‍💻 Federico Girolami</strong></p> 
    <p><strong>Full Stack Developer</strong> | <strong>System Integrator</strong> | <strong>Digital Solution Architect</strong> 🚀</p> 
    <p>📫 <strong>Get in Touch</strong></p> 
    <p>🌐 <strong>Website</strong>: <a href="https://codecorn.it">codecorn.it</a> *(Under Construction)*</p> 
    <p>📧 <strong>Email</strong>: <a href="mailto:f.girolami@codecorn.it">f.girolami@codecorn.it</a></p> 
    <p>🐙 <strong>GitHub</strong>: <a href="https://github.com/fgirolami29">github.com/fgirolami29</a></p> 
  </div> 
  <div style="text-align: center;">
    <a href="https://www.codecorn.it"> 
      <img src="https://codecorn.it/wp-content/uploads/2025/05/CODECORN-trasp-qhite.png" alt="Code Corn Logo"  width="250px" height="90px" style="margin-top:30px;margin-bottom:20px;"/>
    </a> 
    <a href="https://github.com/fgirolami29"> 
      <img src="https://avatars.githubusercontent.com/u/68548715?s=200&v=4" alt="Federico Girolami Avatar" style="border-radius: 50%; width: 125px; height: 125px;border: 5px solid gold" /> 
    </a> 
  </div> 
</div>

---

### 🤝 Contribute

Pull request benvenute. Per grosse modifiche apri una issue prima di iniziare.

> Powered by CodeCorn™ 🚀
