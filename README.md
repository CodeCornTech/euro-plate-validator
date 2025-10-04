# 🌍 @codecorn/euro-plate-validator

> 🚗 European license plate validator (Russia excluded).  
> Multi-country regex-based syntax validation for EU/EEA license plates.  
> Supports Node.js (TypeScript/JavaScript) and PHP implementations.

[![@codecorn/euro-plate-validator](https://img.shields.io/badge/CODECORN-EURO--PLATE--VALIDATOR-green?style=for-the-badge&logo=vercel)](https://www.npmjs.com/package/@codecorn/euro-plate-validator)

[![Downloads](https://img.shields.io/npm/dt/@codecorn/euro-plate-validator?color=blue&label=npm%20downloads)](https://www.npmjs.com/package/@codecorn/euro-plate-validator)
[![npm version](https://img.shields.io/npm/v/@codecorn/euro-plate-validator?color=brightgreen&logo=npm)](https://www.npmjs.com/package/@codecorn/euro-plate-validator)
[![GitHub stars](https://img.shields.io/github/stars/CodeCornTech/euro-plate-validator?style=social)](https://github.com/CodeCornTech/euro-plate-validator)
[![GitHub issues](https://img.shields.io/github/issues/CodeCornTech/euro-plate-validator?color=blue)](https://github.com/CodeCornTech/euro-plate-validator/issues)
[![Tests](https://github.com/CodeCornTech/euro-plate-validator/actions/workflows/test.yml/badge.svg)](https://github.com/CodeCornTech/euro-plate-validator/actions/workflows/test.yml)
[![MIT License](https://img.shields.io/github/license/CodeCornTech/euro-plate-validator)](LICENSE)

---

## ✨ Features

- ✅ **Multi-country support** (25+ EU/EEA countries)
- 🚫 **Russia excluded** by design
- 🔠 Normalizes input (spaces, hyphens)
- 🖥 Available for **Node.js/TypeScript** and **PHP**
- 📦 Ready to publish on **npm**

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
