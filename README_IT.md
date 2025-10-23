# 🌍 @codecorn/euro-plate-validator

> 🚗 Validatore di targhe europee (Russia esclusa). Validazione della sintassi basata su espressioni regex multi-paese per targhe UE/SEE. Funziona in **Node.js/TypeScript** e nel **browser** (UI client leggera).

[![Lang: EN](https://img.shields.io/badge/docs-English-red?style=for-the-badge)](./README.md) [![Demo](https://img.shields.io/badge/demo-GitHub%20Pages-0b6efd?style=for-the-badge)](https://codecorntech.github.io/euro-plate-validator/)

---

[![@codecorn/euro-plate-validator](https://img.shields.io/badge/CODECORN-EURO--PLATE--VALIDATOR-green?style=for-the-badge&logo=vercel)](https://www.npmjs.com/package/@codecorn/euro-plate-validator) [![npm](https://img.shields.io/npm/v/@codecorn/euro-plate-validator?logo=npm&label=version&style=for-the-badge)](https://www.npmjs.com/package/@codecorn/euro-plate-validator) [![downloads](https://img.shields.io/npm/dm/@codecorn/euro-plate-validator?logo=npm&label=downloads&style=for-the-badge)](https://www.npmjs.com/package/@codecorn/euro-plate-validator) [![jsDelivr](https://img.shields.io/jsdelivr/npm/hm/@codecorn/euro-plate-validator?label=jsDelivr%20hits&style=for-the-badge)](https://www.jsdelivr.com/package/npm/@codecorn/euro-plate-validator) [![GitHub stars](https://img.shields.io/github/stars/CodeCornTech/euro-plate-validator?style=for-the-badge&logo=github)](https://github.com/CodeCornTech/euro-plate-validator)

[![CI Tests](https://github.com/CodeCornTech/euro-plate-validator/actions/workflows/test.yml/badge.svg)](https://github.com/CodeCornTech/euro-plate-validator/actions/workflows/test.yml) [![issues](https://img.shields.io/github/issues/CodeCornTech/euro-plate-validator?label=issues)](https://github.com/CodeCornTech/euro-plate-validator/issues) [![min](https://img.shields.io/bundlephobia/min/@codecorn/euro-plate-validator?label=min)](https://bundlephobia.com/package/@codecorn/euro-plate-validator) [![minzip](https://img.shields.io/bundlephobia/minzip/@codecorn/euro-plate-validator?label=minzip)](https://bundlephobia.com/package/@codecorn/euro-plate-validator) [![Types](https://img.shields.io/badge/TypeScript-types-blue?logo=typescript)](./dist/index.d.ts) ![module](https://img.shields.io/badge/module-ESM-brightgreen) ![cdn](https://img.shields.io/badge/cdn-IIFE-brightgreen) [![License](https://img.shields.io/badge/license-MIT-informational)](LICENSE)

---

## ✨ Caratteristiche

- ✅ **Multi-country** (25+ EU/EEA) — auto o paese fisso
- 🏍️ Tipi veicolo: `car`, `bike`, `any`
- 🔠 Normalizzazione (spazi/trattini) + formattatori per paese
- ↕️ **Minuscole accettate** in input e forzate a **MAIUSCOLO** in mask (token `L` custom)
- 🖥 **Node/TypeScript** + **Browser** (ESM/IIFE)
- 🧩 **Client SDK** leggero: input + dropdown nazioni + status + integrazione **Inputmask** opzionale
- 🌐 **i18n IT/EN** built-in
- 🧯 **Autoload deps** da CDN con **override** URL e fallback safe

---

## 📦 Install

```bash
npm install @codecorn/euro-plate-validator
```

---

## 🔗 CDN (v1.0.13)

> Usa URL **versionati** per evitare cache stantia.

### Core (browser)

- **ESM (browser)** `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/browser/index.esm.js`

- **IIFE (global `window.EuroPlateValidator`)** `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/browser/index.iife.min.js`

### Client SDK (UI)

- **ESM** `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/client/index.mjs`

- **CJS (Node)** `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/client/europlate.client.cjs`

### Assets CSS

- `https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/assets/css/styles.css`
- (compat shim) `…/assets/css/styles.css` → include/forward a `styles.css`

> Se vedi file non aggiornati, puoi forzare un purge su jsDelivr.

---

## 🧠 Core API (Node/TS)

```ts
import { validatePlate } from "@codecorn/euro-plate-validator";

// IT (car)
validatePlate("AB 123 CD", ["IT"], { vehicleType: "car" });
// → { isValid: true, matches:[{country:"IT", name:"Italy"}], checked:["IT"] }

// UK vs IE
validatePlate("AB12 CDE", ["UK", "IE"]);
```

---

## 🧩 Client SDK (UI) — `createEuroPlate`

Il client genera il markup (flag + input + dropdown + status) **oppure** si aggancia a un input esistente.

### Opzioni principali (nuove incluse)

```ts
type EuroPlateOptions = {
  // DOM
  input?: HTMLInputElement; // input esterno
  wrapper?: string | HTMLElement | false; // se passato → auto-build UI
  inputId?: string; // default: derivato (es. "epv-xxxx-plate")
  inputName?: string; // default: idem
  preserveInputAttrs?: boolean; // NEW: se true, NON sovrascrive id/name esistenti
  autoFocusOnInit?: boolean; // NEW: default false (no focus su init)

  // ⚙️ Configurazione UI (nuovo: TUTTO sotto "ui")
  ui?: {
    /**
     * Dove mostrare lo status:
     * - "block"  → usa <div class="status"> sotto l’input (retro-compat, default)
     * - "inline" → overlay dentro l’input, non altera l’altezza
     * - "off"    → non mostra testo/icona di stato
     */
    statusMode?: "block" | "inline" | "off"; // default: "block"

    /** Tipo di icona per lo status inline (ignorata in "block" e "off") */
    statusIcon?: "none" | "icon" | "pill"; // default: "none"

    /** Se mostrare il testo di stato */
    showStatusText?: boolean; // default: block→true, inline→false

    /** Posizione dell’icona inline */
    iconPosition?: "right" | "left"; // default: "right"

    // Riferimenti opzionali a nodi già esistenti (se NON usi wrapper)
    flagIcon?: HTMLElement;
    flagLabel?: HTMLElement;
    dropdown?: HTMLElement;
    button?: HTMLElement;
    status?: HTMLElement;
  };

  // UX/i18n
  mode?: "AUTO" | string; // paese fisso o AUTO (default)
  i18n?: "AUTO" | "IT" | "EN"; // default AUTO → navigator it/en
  allowedCountries?: string[]; // whitelist; default: tutte
  vehicleType?: "any" | "car" | "bike"; // default: any
  placeholders?: { auto?: string }; // placeholder per AUTO

  // Normalizzazioni/format
  normalize?: (code: string) => string; // default GB→UK
  formatters?: Record<string, (s: string) => string>; // per-CC

  // Timings
  timings?: { debounce?: number; clear?: number }; // default: 80/60

  // Dipendenze / logging
  deps?: { inputmask?: any }; // iniezione manuale (es. window.Inputmask)
  autoLoadDeps?: { inputmask?: boolean; jquery?: boolean; toastr?: boolean }; // autoload UMD
  cdn?: { inputmask?: string }; // override URL CDN
  logger?: (level: string, ...args: any[]) => void;
  debug?: boolean; // abilita log BADGE/LOG
  useToastrLogger?: boolean; // route log su Toastr se presente
};
```

#### Valori e default (UI)

| Chiave                                        | Tipo                           | Valori               | Default                      | Note                                                                                      |
| --------------------------------------------- | ------------------------------ | -------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| `ui.statusMode`                               | `"block" \| "inline" \| "off"` | block / inline / off | `"block"`                    | _block_ usa `<div class="status">`, _inline_ overlay nell’input, _off_ niente testo/icona |
| `ui.statusIcon`                               | `"none" \| "icon" \| "pill"`   | none / icon / pill   | `"none"`                     | usata **solo** in `inline`                                                                |
| `ui.showStatusText`                           | `boolean`                      | true / false         | `block→true`, `inline→false` | testo breve in inline; completo in block                                                  |
| `ui.iconPosition`                             | `"right" \| "left"`            | right / left         | `"right"`                    | posizione icona in inline                                                                 |
| `ui.status`                                   | `HTMLElement` (opz.)           | —                    | auto-creato/derivato         | host esistente per lo status (se non usi `wrapper`)                                       |
| `ui.button`/`dropdown`/`flagIcon`/`flagLabel` | `HTMLElement` (opz.)           | —                    | auto-creati se `wrapper`     | per re-use di DOM esterno                                                                 |

---

### Metodi istanza

```ts
type EuroPlateInstance = {
  setCountry(code: "AUTO" | string): void; // alias setMode
  setMode(m: "AUTO" | string): void; // imposta paese o AUTO
  setAllowed(codes: string[]): void; // whitelist dinamica
  setVehicleType(t: "any" | "car" | "bike"): void;
  setI18n(code: "AUTO" | "IT" | "EN"): void;
  setDebug(on: boolean): void;

  validate(): { ok: boolean; country?: string; value: string };
  destroy(): void;
  getI18n(): "it" | "en";
};
```

---

## 🖼️ Esempi d’uso

### A ) Avvio rapido con configurazione `common` condivisa + autoload dipendenze ( Inputmask , jQuery , Toastr )

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/assets/css/styles.css" />

<div id="plateBox"></div>

<script type="module">
  import * as EuroMod from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/browser/index.esm.js";
  import { createEuroPlate } from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/client/index.mjs";

  // Opzioni comuni usate in tutti gli esempi
  const common = {
    mode: "AUTO",
    i18n: "IT",
    allowedCountries: ["IT", "FR", "DE", "ES"],
    vehicleType: "any",
    autoFocusOnInit: false,
    ui: {
      statusMode: "inline",
      statusIcon: "icon",
      showStatusText: false,
      iconPosition: "right",
    },
    // Autoload dipendenze (UMD) dal CDN
    autoLoadDeps: { inputmask: true, jquery: true, toastr: true },

    // Opzionale : invia i log a Toastr se disponibile
    useToastrLogger: true,

    debug: true,
  };

  createEuroPlate(EuroMod, {
    wrapper: "#plateBox", // opzionale
    ...common,
  });
</script>
```

> Note :
>
> - Con `autoLoadDeps.jquery: true` e `autoLoadDeps.toastr: true` il client scarica automaticamente le build UMD dal CDN se mancanti .
> - `useToastrLogger: true` invia i log dell’SDK e i messaggi di validazione a Toastr , se presente ( sia auto-caricato che iniettato manualmente ) .
> - jQuery **non è richiesta** dal validatore core ; viene caricata solo se la tua pagina o i tuoi widget la usano .

---

### B ) Fornisci tu `Inputmask` manualmente ( UMD → `window.Inputmask` )

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/assets/css/styles.css" />
<script src="https://cdn.jsdelivr.net/npm/inputmask@5.0.9/dist/inputmask.min.js"></script>

<script type="module">
  import * as EuroMod from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/browser/index.esm.js";
  import { createEuroPlate } from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/client/index.mjs";

  createEuroPlate(EuroMod, {
    wrapper: "#plateBox",
    i18n: "AUTO",
    autoFocusOnInit: false,
    deps: { inputmask: window.Inputmask }, // iniezione manuale
  });
</script>
```

---

### C ) Autoload dipendenze dal CDN ( default , solo Inputmask )

```html
<script type="module">
  import * as EuroMod from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/browser/index.esm.js";
  import { createEuroPlate } from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/client/index.mjs";

  createEuroPlate(EuroMod, {
    wrapper: "#plateBox",
    i18n: "AUTO",
    autoFocusOnInit: false,
    // Nessun oggetto deps → carica automaticamente Inputmask UMD da jsDelivr
  });
</script>
```

---

### D ) Autoload attivo ma con URL CDN personalizzato

```js
createEuroPlate(EuroMod, {
  wrapper: "#plateBox",
  cdn: { inputmask: "https://unpkg.com/inputmask@5.0.9/dist/inputmask.min.js" },
});
```

---

### E ) Disattiva autoload ( fallback “no mask” , nessun errore )

```js
createEuroPlate(EuroMod, {
  wrapper: "#plateBox",
  autoLoadDeps: { inputmask: false },
});
```

---

### F ) Aggancia a un input esistente ( nessun auto-build )

```html
<input id="myPlate" />
<script type="module">
  import * as EuroMod from ".../index.esm.js";
  import { createEuroPlate } from ".../index.mjs";

  createEuroPlate(EuroMod, {
    input: document.getElementById("myPlate"),
    inputName: "plate_number",
    preserveInputAttrs: true, // 👈 non sovrascrivere id/name se già presenti
    i18n: "EN",
    mode: "AUTO",
    autoFocusOnInit: false,
  });
</script>
```

---

## 🧩 WordPress (WP) / Elementor

### 1) Enqueue CSS + init helper (type="module")

```php
add_action('wp_enqueue_scripts', function () {
  wp_register_script('epv-init', '', [], null, true);

  wp_enqueue_style(
    'epv-styles',
    'https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/assets/css/styles.css',
    [],
    '1.0.15'
  );

  add_filter('script_loader_tag', function ($tag, $handle) {
    if ($handle === 'epv-init') {
      return '<script type="module">' .
        'import * as EuroMod from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/browser/index.esm.js";' .
        'import { createEuroPlate } from "https://cdn.jsdelivr.net/npm/@codecorn/euro-plate-validator@1.0.15/dist/client/index.mjs";' .
        'window.__epvInit=(id,opts)=>createEuroPlate(EuroMod,Object.assign({wrapper:"#"+id,mode:"AUTO",i18n:"IT",debug:true,autoFocusOnInit:false},opts||{}));' .
      '</script>';
    }
    return $tag;
  }, 10, 2);

  wp_enqueue_script('epv-init');
});
```

### 2) Shortcode per instanziare (anche in Elementor HTML)

```php
add_shortcode('europlate_init', function ($atts) {
  $id   = isset($atts['id']) ? sanitize_html_class($atts['id']) : ('plateBox-' . wp_generate_password(6, false, false));
  $opts = isset($atts['opts']) ? wp_kses_post($atts['opts']) : '{}';
  ob_start(); ?>
    <div id="<?php echo esc_attr($id); ?>"></div>
    <script>
      (function boot(){
        if (window.__epvInit && document.getElementById('<?php echo esc_js($id); ?>')) {
          try {
            window.__epvInit('<?php echo esc_js($id); ?>', JSON.parse('<?php echo wp_slash($opts); ?>'));
          } catch (e) {
            // fallback: senza opts
            window.__epvInit('<?php echo esc_js($id); ?>');
          }
        } else {
          setTimeout(boot, 60);
        }
      })();
    </script>
  <?php
  return ob_get_clean();
});
```

**Esempio shortcode in Elementor:**

```text
[europlate_init id="epv_box" opts='{
  "wrapper":"#epv_box",
  "inputId":"epv_field",
  "inputName":"epv_field",
  "mode":"AUTO",
  "i18n":"IT",
  "debug":true,
  "autoFocusOnInit": false
}']
```

> Suggerimento: se stai nell’**editor Elementor**, puoi evitare l’init automatico con un check su `elementor.isEditMode()` (se esiste) prima della `__epvInit`.

---

## 🧪 CLI (quick test)

```bash
npx @codecorn/euro-plate-validator "AB 123 CD" --countries IT,FR,DE --type car --pretty
```

- `--countries` / `-c`: lista CC (comma sep)
- `--type` / `-t`: `car` | `motorcycle` | `any`
- `--pretty` / `-p`: output leggibile

Exit code: `0` valido, `1` non valido, `2` errori input.

---

## 🌍 Supported Countries

🇮🇹 IT | 🇬🇧 UK | 🇩🇪 DE | 🇫🇷 FR | 🇪🇸 ES | 🇵🇹 PT | 🇳🇱 NL | 🇧🇪 BE | 🇨🇭 CH | 🇦🇹 AT | 🇮🇪 IE | 🇱🇺 LU 🇩🇰 DK | 🇸🇪 SE | 🇳🇴 NO | 🇫🇮 FI | 🇵🇱 PL | 🇨🇿 CZ | 🇸🇰 SK | 🇭🇺 HU | 🇷🇴 RO | 🇧🇬 BG | 🇸🇮 SI | 🇭🇷 HR | 🇬🇷 GR 🇱🇹 LT | 🇱🇻 LV | 🇪🇪 EE | 🇺🇦 UA

---

## 🧾 Changelog (highlights)

### 1.0.15

- **Inputmask**
  - Merge sicuro delle `definitions` (niente override secco dei default).
  - Nuovo token **`L`** (lettera) che accetta minuscole e le forza a **MAIUSCOLO** (`casing: "upper"`).
  - Evitato override di `A`/`9`; usare `H` (IT) e `C` (ES) solo dove serve.
  - `applyMaskNow` immediata al cambio paese (niente race col debounce).
  - Placeholder finalizzati via `finalizeInputMaskLayouts` + test `scripts/test-placeholders.mjs`.

- **Client SDK**
  - Logging centralizzato (`imLog`, `imPreLog`, `imMounted`, `imError`) su `BADGE/LOG` quando `debug: true`.
  - Supporto minuscole in input su tutti i layout via token `L`.
  - Esempi aggiornati con `autoLoadDeps: { inputmask: true, jquery: true, toastr: true }` e `useToastrLogger: true`.

- **Docs**
  - CDN aggiornato a **1.0.15**.
  - Nota su minuscole accettate + uppercase automatico.
  - ## Linee guida: **non** ridefinire `A`/`9`; definire solo token custom per alfabeti ristretti.

---

### 1.0.13

- `autoFocusOnInit` (default `false`), `preserveInputAttrs`
- Classi CSS `iti__*` → `epv__*`
- Autoload Inputmask UMD + override URL
- i18n IT/EN/AUTO; placeholder dinamici; debounce

---

### 1.0.12

- **NUOVO →** `autoFocusOnInit` (default: `false`) — impedisce il focus automatico all’inizializzazione.
- **NUOVO →** `preserveInputAttrs` — mantiene invariati gli attributi `id` e `name` di input esterni.
- **UX →** rinominate le classi CSS da `.iti__*` a `.epv__*`.
- **Dipendenze →** caricamento automatico di `Inputmask` (UMD) via CDN, con supporto a iniezione manuale e override URL personalizzato.
- **I18n →** supporto `IT / EN / AUTO` (rilevamento automatico dalla lingua del browser).
- **Stabilità UX →** placeholder dinamici, formattatori per paese, e sistema di debounce migliorato.

---

### 1.0.10

- Build e assets CSS/IMG consolidati.
- Bundle browser: `index.esm.js` e `index.iife.min.js`.

> Per changelog completo, vedi i commit/tag del repo.

---

## 📝 License

MIT © [CodeCorn™](https://codecorn.it) — vedi [LICENSE](LICENSE).

---

## 👤 Maintainer

**Federico Girolami** — Full-Stack / System Integrator / Solution Architect 🌐 [https://codecorn.it](https://codecorn.it) — 📧 [f.girolami@codecorn.it](mailto:f.girolami@codecorn.it) — 🐙 [https://github.com/fgirolami29](https://github.com/fgirolami29)

---

## 🤝 Contribute

PR benvenute! Per modifiche importanti, apri una issue prima.

> Powered by CodeCorn™ 🚀

---
