/**
 * EuroPlate Client SDK — src/client/europlate.client.ts
 * Copyright (c) 2021-2026 Federico Girolami <f.girolami@codecorn.it>
 * MIT License - https://opensource.org/license/mit/
 * - UI opzionale (wrapper/DOM) + maschera + validazione.
 * - Dipendenze esterne autocaricabili (Inputmask, jQuery, Toastr) via jsDelivr.
 * - Nessun hardcode di paesi/DOM nel core (tutto iniettato via EuroMod).
 *
 * Manutenzione:
 * - Tutti i CDN sono centralizzati in `cdnURLs` (single source of truth).
 * - I getter `getIM/getJQ/getToastr` leggono prima da `opts.deps`, poi da `window`.
 * - Per Inputmask UMD gestiamo sia chiamabile che costruttore (call/new).
 * - Usare SEMPRE `hasIMBound/getIMBound` dentro l’istanza (no variabili globali mutate).
 * - Logger di base (console o esterno) e logger Toastr (se richiesto e disponibile).
 * - I18n minimale (it/en) con possibilità di estensione.
 *
 * Pubblico: types, createEuroPlate()
 * Interno: helpers (cdn, loaders, logger, i18n, dom)
 */
import { ensureBadgeLogger } from "./logger/ensureBadgeLogger.js";
import type { ColorKey, CCColors, SmartLogFn, BadgeFn } from "./logger/ensureBadgeLogger.js";
import type { CountryKey } from "../countries.js";
import {
  //FLAG_MAP, // TODO: ALLINEARE O RIMUOVERE
  COUNTRY_NAMES, // TODO: ALLINEARE O RIMUOVERE VEDI LINEA :393 const { ... COUNTRY_NAMES } = EuroMod;
  supportedCountries,
  normalizeCode,
  getCountryName,
} from "../countries.js";

// 👇 in cima al file (scope di modulo)
let __depsOnce: Promise<void> | null = null;

export async function ensureDepsOnce(opts: EuroPlateOptions, log: Logger, BADGE: BadgeFn = () => {}, LOG: SmartLogFn = () => {}) {
  if (!__depsOnce) {
    __depsOnce = (async () => {
      BADGE("EPV[Deps]", "Ensuring dependencies…", "info");
      try {
        await ensureDeps(opts, log, BADGE, LOG);
        BADGE("EPV[Deps]", "Dependencies ensured successfully", "ok");
      } catch (err) {
        BADGE("EPV[Deps]", `Error during ensureDeps: ${(err as Error)?.message || err}`, "err");
        throw err;
      } finally {
        BADGE("EPV[Deps]", "ensureDeps finished", "debug");
      }
    })();
  } else {
    BADGE("EPV[Deps]", "Deps ensure already in-flight / done", "debug");
  }
  return __depsOnce;
}

/* ============================================================
 * Tipi PUBBLICI (API surface)
 * ============================================================ */

/** Lingue supportate dall’SDK. */
export type I18nCode = "AUTO" | "IT" | "EN";

/** Tipi veicolo supportati dal validatore. */
export type VehicleType = "any" | "car" | "bike";

/** Interfaccia logger esterno compatibile. */
export type Logger = {
  debug?: (...a: any[]) => void;
  info?: (...a: any[]) => void;
  warn?: (...a: any[]) => void;
  error?: (...a: any[]) => void;
  /** Tipo libero lato SDK; verrà normalizzato lato toastr. */
  notify?: (msg: string, type?: string) => void;
};

/** Riferimenti UI opzionali (se non si usa `wrapper`). */
export type EuroPlateUI = {
  flagIcon?: HTMLElement;
  flagLabel?: HTMLElement;
  dropdown?: HTMLElement;
  button?: HTMLElement;
  status?: HTMLElement;
  /** Nuove opzioni di rendering status */

  /**
   * Dove mostrare lo status:
   * - "block"  → usa <div class="status"> sotto l’input (default, retro-compat)
   * - "inline" → overlay dentro l’input, non altera l’altezza
   * - "off"    → non mostra nessuno status testuale
   */
  statusMode?: "block" | "inline" | "off"; // default: "block"
  statusIcon?: "none" | "icon" | "pill"; // default: "none"
  showStatusText?: boolean; // default: block→true, inline→false
  iconPosition?: "right" | "left"; // default: "right"
};
/** Opzioni di configurazione per `createEuroPlate` (client-side SDK). */
export type EuroPlateOptions = {
  /** Lingua/i18n del widget.
   *  - "AUTO": deduce da `navigator.language` (it → "it" altrimenti "en").
   *  - "IT" | "EN": forza la lingua.
   *  @default "AUTO"
   */
  i18n?: I18nCode;
  /** Input esterno già presente nel DOM (alternativa a `wrapper`).
   *  Se passato, l’SDK non genera markup ma usa questo input.
   */
  input?: HTMLInputElement; // era required → ora opzionale (se usi wrapper)

  /** Wrapper in cui generare automaticamente la UI.
   *  - string: CSS selector (es. "#my-wrapper")
   *  - HTMLElement: nodo esistente
   *  - false: disabilita auto-build (usa `input`)
   *  @default false
   */
  wrapper?: string | HTMLElement | false; // 👈 selector, nodo o false (default)

  /** ID forzato da assegnare all’input generato/esterno.
   *  Se `preserveInputAttrs` è true e l’input ha già un id, non lo sovrascrive.
   */
  inputId?: string;

  /** name forzato da assegnare all’input generato/esterno.
   *  Se `preserveInputAttrs` è true e l’input ha già un name, non lo sovrascrive.
   */
  inputName?: string;

  /** Se true, non sovrascrive `id`/`name` su input esterni già valorizzati.
   *  @default false
   */
  preserveInputAttrs?: boolean;

  /** Riferimenti a elementi UI opzionali (se non si usa `wrapper`). */
  ui?: EuroPlateUI;

  /** Lista bianca di paesi consentiti (ISO-like: IT, FR, …).
   *  Se omessa, usa tutti i paesi supportati da EuroMod.
   */
  allowedCountries?: string[];

  /** Modalità iniziale.
   *  - "AUTO": tenta il match e adatta mask/placeholder dinamicamente
   *  - codice paese (es. "IT") per forzare una nazione fissa
   *  @default "AUTO"
   */
  mode?: "AUTO" | string;

  /** Tipo veicolo da passare al validatore (se supportato). @default "any" */
  vehicleType?: VehicleType;

  /** Placeholder personalizzabili. default: "AA 999 AA / AA-999-AA / 9999 AAA" */
  placeholders?: { auto?: string };

  /** Normalizzatore codici paese (es. GB→UK). */
  normalize?: (code: string) => string;

  /** Formatter per country code (applicato a input/paste). */
  formatters?: Record<string, (s: string) => string>;

  /** Timing UI: debounce applicazione mask e clear. @default {debounce:80,clear:60} */
  timings?: { debounce?: number; clear?: number };

  /** Se true, applica focus all’input all’init. @default false */
  autoFocusOnInit?: boolean;

  /** Dipendenze iniettate (per test o per ambienti bundler).
   *  - `inputmask`: factory/constructor UMD di Inputmask
   */
  deps?: { inputmask?: any };

  /** Flag di autoload per dipendenze esterne.
   *  @default {inputmask:true,jquery:false,toastr:false}
   */
  autoLoadDeps?: {
    inputmask?: boolean;
    jquery?: boolean;
    toastr?: boolean;
  };

  /** Override di CDN per ogni dipendenza (se serve self-hosting). */
  cdn?: {
    inputmask?: string;
    jquery?: string;
    toastrJs?: string;
    toastrCss?: string;
  };

  /** Se true abilita messaggi di debug (console/toastr). @default false */
  debug?: boolean;

  /** Se true, tenta di usare Toastr come logger di default:
   *  - forza best-effort jQuery+Toastr se non presenti (rispettando CDN)
   *  - se viene passato `logger`, ha precedenza
   *  @default false
   */
  useToastrLogger?: boolean;

  /** Logger esterno opzionale (interna/console compat). */
  logger?: Logger;
};

/** Istanza runtime del widget EuroPlate. */
export type EuroPlateInstance = {
  /** Imposta una nazione fissa (es. "IT") oppure "AUTO". */
  setCountry: (code: "AUTO" | string) => void;

  /** Limita i paesi selezionabili/validabili. */
  setAllowed: (codes: string[]) => void;

  /** Cambia il tipo di veicolo (pass-through a validazione). */
  setVehicleType: (t: VehicleType) => void;

  /** Attiva/disattiva debug logging. */
  setDebug: (on: boolean) => void;

  /** Cambia la modalità (come `setCountry`, mantenendo il focus). */
  setMode: (m: "AUTO" | string) => void;

  /** Cambia lingua runtime (placeholder, label, dropdown). */
  setI18n: (code: I18nCode) => void;

  /** Valida il contenuto attuale dell’input, aggiornando UI. */
  validate: () => { ok: boolean; country?: string; value: string };

  /** Distrugge listeners e rimuove mask. */
  destroy: () => void;

  /** Ritorna la lingua corrente (“it” | “en”). */
  getI18n: () => Lang;
};
// --- fine tipi pubblici ---

/* ============================================================
 * Interni: CDN + loaders + getters + ensure deps
 * Puoi continuare a passare le opzioni avanzate quando servono (SRI, media, timeout, ecc.). Esempio:
 * @example ts
 *   await loadScriptOnce(urlIM, { integrity: "...", timeoutMs: 20000 });
 *   await loadCssOnce(cssToastr,   { media: "all", timeoutMs: 10000 });
 * Extra opzionali (se servono più avanti)
 * **Preload**: prima di `appendChild` puoi verificare e/o aggiungere un `<link rel="preload" as="script">` / `as="style"`.
 * **AbortSignal**: se vuoi abortire manualmente, estendi le opzioni con `signal?: AbortSignal` e fai `signal.addEventListener("abort", …rej…)`.
 * ============================================================ */

/** @internal */
const cdnURLs = {
  base: "https://cdn.jsdelivr.net/npm/",
  jquery: { v: "jquery@3.7.1", JS: "/dist/jquery.min.js" },
  toastr: { v: "toastr@2.1.4", JS: "/build/toastr.min.js", CSS: "/build/toastr.min.css" },
  inputmask: { v: "inputmask@5.0.9", JS: "/dist/inputmask.min.js" },
};

/** @internal */
type LoadScriptOptions = {
  /** Imposta <script type="module"> */
  module?: boolean;
  /** crossorigin (default: "anonymous") */
  crossOrigin?: "" | "anonymous" | "use-credentials";
  /** integrity SRI */
  integrity?: string;
  /** CSP nonce da applicare al tag */
  nonce?: string;
  /** Attributi extra pass-through (data-*, ecc.) */
  attrs?: Record<string, string>;
  /** Timeout hard-fail (ms). 0 = no timeout. Default: 15000 */
  timeoutMs?: number;
  /** opzionale: id fisso per dedup */
  id?: string;
};

/** @internal */
type LoadCssOptions = {
  /** media attribute (es. "print", "(prefers-color-scheme:dark)") */
  media?: string;
  /** crossorigin (default: "anonymous") */
  crossOrigin?: "" | "anonymous" | "use-credentials";
  /** integrity SRI */
  integrity?: string;
  /** CSP nonce da applicare al tag */
  nonce?: string;
  /** Attributi extra pass-through (data-*, ecc.) */
  attrs?: Record<string, string>;
  /** Timeout hard-fail (ms). 0 = no timeout. Default: 15000 */
  timeoutMs?: number;
  /** opzionale: id fisso per dedup */
  id?: string;
};

/** Cache per prevenire doppi insert e coalescare chiamate concorrenti */
const inFlightScripts = new Map<string, Promise<void>>();
const inFlightCss = new Map<string, Promise<void>>();

// ---------- util comuni ----------

/** Rileva il CSP nonce dall'ambiente (override con opt.nonce). */
function detectCspNonce(explicit?: string): string | undefined {
  if (explicit) return explicit;
  const winNonce = (window as any).__CSP_NONCE__;
  if (typeof winNonce === "string" && winNonce) return winNonce;
  const meta = document.querySelector('meta[name="csp-nonce"]') as HTMLMetaElement | null;
  const metaNonce = meta?.getAttribute("content") || meta?.getAttribute("value");
  return metaNonce || undefined;
}

function applyAttrs<T extends HTMLElement>(el: T, attrs?: Record<string, string>) {
  if (!attrs) return;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

/** Chiave di dedup: preferisci id, altrimenti URL normalizzato. */
function buildKey(kind: "js" | "css", url: string, id?: string): string {
  return id ? `${kind}#${id}` : `${kind}:${new URL(url, document.baseURI).href}`;
}

// ---------- loader script ----------

/** Carica uno <script> esterno una sola volta (idempotente+concurrency-safe).
 *  @internal
 *  @param src URL assoluto/relativo dello script
 *  @returns Promise risolta quando `onload` fires (o noop se già presente)
 */

export function loadScriptOnce(src: string, opt: LoadScriptOptions = {}): Promise<void> {
  if (!src || typeof document === "undefined") return Promise.resolve();

  // dedup 1: elemento già presente in DOM (per src o id)
  if (opt.id && document.getElementById(opt.id)) return Promise.resolve();
  if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();

  // dedup 2: chiamate concorrenti
  const key = buildKey("js", src, opt.id);
  const existing = inFlightScripts.get(key);
  if (existing) return existing;

  const p = new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = src;

    // type="module" opzionale
    if (opt.module) s.type = "module";

    // crossorigin (default "anonymous" se non vuoto)
    if (opt.crossOrigin !== undefined) {
      if (opt.crossOrigin) s.crossOrigin = opt.crossOrigin;
    } else {
      s.crossOrigin = "anonymous";
    }

    if (opt.integrity) s.integrity = opt.integrity;

    const nonce = detectCspNonce(opt.nonce);
    if (nonce) s.setAttribute("nonce", nonce);

    if (opt.id) s.id = opt.id;

    applyAttrs(s, opt.attrs);
    s.async = true;
    s.setAttribute("data-loaded-by", "EuroPlate");

    let to: number | undefined;
    const timeoutMs = opt.timeoutMs ?? 15000;
    if (timeoutMs > 0) {
      to = window.setTimeout(() => {
        s.onerror = null!;
        s.onload = null!;
        rej(new Error(`Timeout loading script: ${src}`));
      }, timeoutMs);
    }

    s.onload = () => {
      if (to) clearTimeout(to);
      res();
    };
    s.onerror = () => {
      if (to) clearTimeout(to);
      rej(new Error(`Failed ${src}`));
    };

    document.head.appendChild(s);
  }).finally(() => {
    inFlightScripts.delete(key);
  });

  inFlightScripts.set(key, p);
  return p;
}

/**
 *  @internal Carica un <link rel="stylesheet"> una sola volta (idempotente+concurrency-safe).
 *  @param href URL del CSS
 *  @returns Promise risolta quando `onload` fires (o noop se già presente)
 */
export function loadCssOnce(href: string, opt: LoadCssOptions = {}): Promise<void> {
  if (!href || typeof document === "undefined") return Promise.resolve();

  // dedup 1: elemento già presente in DOM (per href o id)
  if (opt.id && document.getElementById(opt.id)) return Promise.resolve();
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return Promise.resolve();

  // dedup 2: chiamate concorrenti
  const key = buildKey("css", href, opt.id);
  const existing = inFlightCss.get(key);
  if (existing) return existing;

  const p = new Promise<void>((res, rej) => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;

    if (opt.media) l.media = opt.media;

    if (opt.crossOrigin !== undefined) {
      if (opt.crossOrigin) l.crossOrigin = opt.crossOrigin;
    } else {
      l.crossOrigin = "anonymous";
    }

    if (opt.integrity) l.integrity = opt.integrity;

    const nonce = detectCspNonce(opt.nonce);
    if (nonce) l.setAttribute("nonce", nonce);

    if (opt.id) l.id = opt.id;

    applyAttrs(l, opt.attrs);
    l.setAttribute("data-loaded-by", "EuroPlate");

    let to: number | undefined;
    const timeoutMs = opt.timeoutMs ?? 15000;
    if (timeoutMs > 0) {
      to = window.setTimeout(() => {
        l.onerror = null!;
        l.onload = null!;
        rej(new Error(`Timeout loading css: ${href}`));
      }, timeoutMs);
    }

    l.onload = () => {
      if (to) clearTimeout(to);
      res();
    };
    l.onerror = () => {
      if (to) clearTimeout(to);
      rej(new Error(`Failed ${href}`));
    };

    document.head.appendChild(l);
  }).finally(() => {
    inFlightCss.delete(key);
  });

  inFlightCss.set(key, p);
  return p;
}
/** @internal */
type Lang = "it" | "en";

// --- getters tip-safe su deps/globale --------------------------------

/** @internal */
type Deps = EuroPlateOptions["deps"];

/** @internal */
type IMInstance = { mask(el: HTMLInputElement): void; remove?: () => void };

/** @internal * Signature runtime-accurata per Inputmask UMD: callable e constructable. */
type IMGlobal = { (opts?: any): IMInstance; new (opts?: any): IMInstance };

/** @internal * Restituisce jQuery da window (jQuery|$) se presente. */
const getJQ = (): JQueryStatic | undefined => window.jQuery ?? window.$;

/** @internal * True se jQuery è già disponibile. */
const hasJQ = (): boolean => !!getJQ();

/** @internal * Restituisce toastr da window, se presente. */
const getToastr = (): Toastr | undefined => window.toastr;

/** @internal * True se toastr è già disponibile. */
const hasToastr = (): boolean => !!getToastr();

/** @internal * Restituisce Inputmask UMD da deps o window.Inputmask (callable/new). */
const getIM = (d?: Deps): IMGlobal | undefined => (d?.inputmask as unknown as IMGlobal) ?? ((window as any).Inputmask as IMGlobal | undefined);

/** @internal * True se Inputmask è disponibile (deps o globale). */
const hasIM = (d?: Deps): boolean => !!getIM(d);
// --- fine getters ---

/**
 * ============================================================
 *  🔧 ensureJQuery / ensureToastr / ensureInputmask
 *  Sistema di caricamento dipendenze EuroPlate (client SDK)
 * ------------------------------------------------------------
 *  • Idempotenti → ogni risorsa caricata una sola volta
 *  • Concurrency-safe → coalescano chiamate parallele
 *  • Cleanup controllato → cancellano solo chiavi create localmente
 *  • Logging coerente via BADGE/LOG
 * ============================================================
 */

/**
 * @internal
 * Garantisce jQuery, rispettando `autoLoadDeps.jquery`.
 * Nota: usato come dipendenza di toastr 2.x.
 */
async function ensureJQuery(opts: EuroPlateOptions, log: Logger, BADGE: BadgeFn = () => {}, LOG: SmartLogFn = () => {}) {
  // --- 1️⃣ controllo immediato
  if (hasJQ()) {
    BADGE("EPV[Deps]", "jQuery present", "debug");
    return;
  }

  // --- 2️⃣ flag autoload
  const want = (opts.autoLoadDeps?.jquery ?? true) !== false;
  if (!want) {
    BADGE("EPV[Deps]", "jQuery autoload disabled", "warn");
    return;
  }

  // --- 3️⃣ costruzione URL e key dedup
  const js = opts.cdn?.jquery ?? cdnURLs.base + cdnURLs.jquery.v + cdnURLs.jquery.JS;
  const key = buildKey("js", js);

  // --- 4️⃣ dedup + concurrency-safe
  let created = false;
  let p = inFlightScripts.get(key);
  if (!p) {
    p = loadScriptOnce(js, { module: false });
    inFlightScripts.set(key, p);
    created = true;
  } else {
    BADGE("EPV[Deps]", "jQuery loading (in-flight)", "info");
  }

  try {
    await p;
    BADGE("EPV[Deps]", created ? "jQuery loaded" : "jQuery ready", "debug");
  } catch {
    BADGE("EPV[Deps]", "Failed to load jQuery from CDN", "err");
  } finally {
    if (created) inFlightScripts.delete(key);
  }
}

/**
 * @internal
 *  Garantisce toastr (JS+CSS), rispettando `autoLoadDeps.toastr`.
 *  Dipende da jQuery: lo assicura prima di caricare toastr.
 */
async function ensureToastr(opts: EuroPlateOptions, log: Logger, BADGE: BadgeFn = () => {}, LOG: SmartLogFn = () => {}) {
  // già presente → esci
  if (hasToastr()) {
    BADGE("EPV[Deps]", "Toastr present", "debug");
    return;
  }

  // dipendenza
  await ensureJQuery(opts, log, BADGE, LOG);

  const want = (opts.autoLoadDeps?.toastr ?? true) !== false;
  if (!want) {
    BADGE("EPV[Deps]", "Toastr autoload disabled", "warn");
    return;
  }

  const css = opts.cdn?.toastrCss ?? cdnURLs.base + cdnURLs.toastr.v + cdnURLs.toastr.CSS;
  const js = opts.cdn?.toastrJs ?? cdnURLs.base + cdnURLs.toastr.v + cdnURLs.toastr.JS;

  const keyCss = buildKey("css", css);
  const keyJs = buildKey("js", js);

  // prova a riusare se già in volo; altrimenti crea tu la Promise
  let createdCss = false;
  let createdJs = false;

  let pCss = inFlightCss.get(keyCss);
  if (!pCss) {
    pCss = loadCssOnce(css, { media: "all" });
    inFlightCss.set(keyCss, pCss);
    createdCss = true;
  }

  let pJs = inFlightScripts.get(keyJs);
  if (!pJs) {
    pJs = loadScriptOnce(js, { module: false });
    inFlightScripts.set(keyJs, pJs);
    createdJs = true;
  }

  // logging “in-flight” se non le hai create tu
  if (!createdCss || !createdJs) BADGE("EPV[Deps]", "Toastr loading (in-flight)", "info");

  try {
    await Promise.all([pCss!, pJs!]);

    // ricontrolla dopo l’attesa
    if (hasToastr()) {
      BADGE("EPV[Deps]", createdCss || createdJs ? "Toastr loaded (+CSS)" : "Toastr ready", "debug");
    } else {
      // JS/CSS caricati ma window.toastr non c’è (edge case)
      BADGE("EPV[Deps]", "Toastr not available after load", "warn");
    }
  } catch {
    BADGE("EPV[Deps]", "Failed to load Toastr from CDN", "err");
  } finally {
    // rimuovi SOLO se le hai create tu (evita di oscurare altre attese)
    if (createdCss) inFlightCss.delete(keyCss);
    if (createdJs) inFlightScripts.delete(keyJs);
  }
}

/**
 * @internal
 * Garantisce che Inputmask sia disponibile secondo i flag `autoLoadDeps`.
 *  - Non blocca l’inizializzazione della UI.
 *  - Prima controlla deps/window, poi carica da CDN se consentito.
 */
async function ensureInputmask(opts: EuroPlateOptions, log: Logger, BADGE: BadgeFn = () => {}, LOG: SmartLogFn = () => {}) {
  // --- 1️⃣ già presente (deps o globale)
  if (hasIM(opts.deps)) {
    BADGE("EPV[Deps]", "Inputmask present (deps/global)", "debug");
    return;
  }

  // --- 2️⃣ flag autoload
  const want = (opts.autoLoadDeps?.inputmask ?? true) !== false;
  if (!want) {
    BADGE("EPV[Deps]", "Inputmask autoload disabled", "warn");
    return;
  }

  // --- 3️⃣ URL + dedup
  const js = opts.cdn?.inputmask ?? cdnURLs.base + cdnURLs.inputmask.v + cdnURLs.inputmask.JS;
  const key = buildKey("js", js);

  let created = false;
  let p = inFlightScripts.get(key);
  if (!p) {
    p = loadScriptOnce(js, { module: false });
    inFlightScripts.set(key, p);
    created = true;
  } else {
    BADGE("EPV[Deps]", "Inputmask loading (in-flight)", "info");
  }

  try {
    await p;
    BADGE("EPV[Deps]", created ? "Inputmask loaded" : "Inputmask ready", "debug");
  } catch {
    BADGE("EPV[Deps]", "Failed to load Inputmask from CDN", "err");
  } finally {
    if (created) inFlightScripts.delete(key);
  }
}

/**
 * @internal
 * ============================================================
 *  🔧 ensureDeps (con gestione try/catch/finally)
 *  Orchestratore dipendenze EuroPlate (client SDK)
 * ------------------------------------------------------------
 *  • Se useToastrLogger === true → forza jQuery+Toastr
 *  • Altrimenti rispetta autoLoadDeps
 *  • Inputmask indipendente dal logger
 *  • Idempotente e concurrency-safe (si appoggia ai singoli ensure*)
 *  - Coerente con pattern dei singoli ensure*
 *  - Garantisce sequenza corretta e logging finale
 * ============================================================
 */
async function ensureDeps(opts: EuroPlateOptions, log: Logger, BADGE: BadgeFn = () => {}, LOG: SmartLogFn = () => {}) {
  const startTime = performance.now();
  BADGE("EPV[Deps]", "Ensuring dependencies…", "info");

  try {
    // —————————————————————————————————————
    // 1️⃣ Toastr (eventualmente forzato)
    // —————————————————————————————————————
    const wantToastr = !!opts.useToastrLogger || (opts.autoLoadDeps?.toastr ?? true) !== false;

    if (wantToastr) {
      // Forziamo jQuery + Toastr per compatibilità
      const optsForToastr: EuroPlateOptions = {
        ...opts,
        autoLoadDeps: {
          ...opts.autoLoadDeps,
          jquery: true,
          toastr: true,
        },
      };

      await ensureToastr(optsForToastr, log, BADGE, LOG);
    } else {
      // Se non serve Toastr, valuta comunque jQuery se richiesto
      const wantJQ = (opts.autoLoadDeps?.jquery ?? true) !== false;
      if (wantJQ) {
        await ensureJQuery(opts, log, BADGE, LOG);
      }
    }

    // —————————————————————————————————————
    // 2️⃣ Inputmask (indipendente dal logger)
    // —————————————————————————————————————
    const wantIM = (opts.autoLoadDeps?.inputmask ?? true) !== false;
    if (wantIM) {
      await ensureInputmask(opts, log, BADGE, LOG);
    } else {
      BADGE("EPV[Deps]", "Inputmask autoload disabled", "warn");
    }

    BADGE("EPV[Deps]", "Dependencies ensured successfully", "ok");
  } catch (err) {
    // —————————————————————————————————————
    // Catch generale (es. eccezioni propagate o runtime)
    // —————————————————————————————————————
    const msg = err instanceof Error ? err.message : JSON.stringify(err ?? "unknown");
    BADGE("EPV[Deps]", `Error during ensureDeps: ${msg}`, "err");
    log.error?.("ensureDeps failed:", err);
  } finally {
    // —————————————————————————————————————
    // Log tempo di completamento / debug telemetria
    // —————————————————————————————————————
    const dur = (performance.now() - startTime).toFixed(1);
    BADGE("EPV[Deps]", `ensureDeps finished in ${dur} ms`, "debug");
  }
}

/* ============================================================
 * Interni: i18n
 * ============================================================ */

/** @internal */
const ALL_COUNTRIES = supportedCountries as readonly CountryKey[];

function isCountryKey(x: string): x is CountryKey {
  return (ALL_COUNTRIES as readonly string[]).includes(x);
}

/** @internal * 👇 chiavi scalari (niente 'countries') */
type DictScalarKey = "auto" | "placeholderAuto" | "valid" | "invalid" | "checked";

/** @internal * Nomi paese localizzati (facoltativi per ciascun cc) */
type CountryNameDict = Partial<Record<CountryKey, string>>;

//prettier-ignore
/** @internal */
const DICT: Record<
  Lang,
  {
    auto: string;
    placeholderAuto: string;
    valid: string;
    invalid: string;
    checked: string;
    countries: CountryNameDict;
  }
> = {
  it: {
    auto: "Auto (Tutti)",
    placeholderAuto: "AA 999 AA / AA-999-AA / 9999 AAA",
    valid: "Valida",
    invalid: "Non valida",
    checked: "Controllati",
    countries: {
      IT: "Italia", UK: "Regno Unito", DE: "Germania", FR: "Francia", ES: "Spagna", PT: "Portogallo", NL: "Paesi Bassi", BE: "Belgio", CH: "Svizzera", AT: "Austria", IE: "Irlanda",
      LU: "Lussemburgo", DK: "Danimarca", SE: "Svezia", NO: "Norvegia", FI: "Finlandia", PL: "Polonia", CZ: "Cechia", SK: "Slovacchia", HU: "Ungheria", RO: "Romania", BG: "Bulgaria", 
      SI: "Slovenia", HR: "Croazia", GR: "Grecia", LT: "Lituania", LV: "Lettonia", EE: "Estonia", UA: "Ucraina" 
    },
  },
  en: {
    auto: "Auto (All)",
    placeholderAuto: "AA 999 AA / AA-999-AA / 9999 AAA",
    valid: "Valid",
    invalid: "Invalid",
    checked: "Checked",
    countries:{
      IT: "Italy", UK: "United Kingdom", DE: "Germany", FR: "France", ES: "Spain", PT: "Portugal", NL: "Netherlands", BE: "Belgium", CH: "Switzerland", AT: "Austria", IE: "Ireland", 
      LU: "Luxembourg", DK: "Denmark", SE: "Sweden", NO: "Norway", FI: "Finland", PL: "Poland", CZ: "Czechia", SK: "Slovakia", HU: "Hungary", RO: "Romania", BG: "Bulgaria", SI: "Slovenia", 
      HR: "Croatia", GR: "Greece", LT: "Lithuania", LV: "Latvia", EE: "Estonia", UA: "Ukraine" 
    },
  },
};
/** @internal */
function pickLang(code: I18nCode): Lang {
  if (code === "IT") return "it";
  if (code === "EN") return "en";
  const nav = (navigator?.language || "").toLowerCase();
  return nav.startsWith("it") ? "it" : "en";
}

/** @internal ✅ ora t() restituisce sempre string */
function t(lang: Lang, key: DictScalarKey): string {
  return DICT[lang][key];
}

/** @internal ✅ countryName legge prima i18n, poi fallback EN/core */
function countryName(lang: Lang, cc: string): string {
  const norm = normalizeCode(cc) as CountryKey | undefined;
  if (!norm) return cc.toUpperCase();
  const local = DICT[lang].countries?.[norm];
  if (local) return local;
  return getCountryName(norm) ?? COUNTRY_NAMES[norm] ?? norm;
}

/* ============================================================
 * Interni: logger
 * ============================================================ */

//prettier-ignore
/** Logger di base: inoltra su console o su logger esterno se fornito.
 *  @internal
 *  - On/Off controllato da `DBG`.
 *  - `notify` passa-attraverso (no-op se mancante).
 */
function makeBaseLogger(prefix: string, DBG: boolean, ext?: Logger): Logger {
  const cons = console;
  return {
    debug: (...a) => { if (DBG) (ext?.debug ?? cons.debug)(prefix, ...a); },
    info: (...a) => { if (DBG) (ext?.info ?? cons.info)(prefix, ...a);},
    warn: (...a) => { (ext?.warn ?? cons.warn)(prefix, ...a); },
    error: (...a) => { (ext?.error ?? cons.error)(prefix, ...a); },
    notify: (msg, type = "info") => { if (DBG) (ext?.notify ?? (() => {}))(msg, type); },
  };
}

//prettier-ignore
/** Logger Toastr:
 *  @internal
 *  - Normalizza `type: string` in {info, success, warning, error}.
 *  - Fallback su console se toastr assente o in errore.
 */
function makeToastrLogger(prefix: string, DBG: boolean): Logger {
  const t = getToastr();
  const cons = console;
  const withPrefix = (msg: string) => (prefix ? `${prefix} ${msg}` : msg);

  return {
    debug: (...a) => { if (DBG) (cons.debug)(prefix, ...a); },
    info:  (...a) => { if (DBG) (cons.info )(prefix, ...a); },
    warn:  (...a) => { (cons.warn)(prefix, ...a); },
    error: (...a) => { (cons.error)(prefix, ...a); },

    // 👇 firma allargata a `string`, con mapping interno ai 4 livelli toastr
    notify: (msg: string, type: string = "info") => {
      if (!t) { if (DBG) cons.info(withPrefix(`[${type}] ${msg}`)); return; }

      // normalizza qualunque string in uno dei 4 tipi toastr
      const allowed = new Set(["info","success","warning","error"]);
      const key = allowed.has(type) ? (type as "info"|"success"|"warning"|"error") : "info";

      try {
        t.options = t.options || {};
        t.options.positionClass = t.options.positionClass || "toast-bottom-right";
        (t as any)[key](withPrefix(msg));
      } catch {
        if (DBG) cons.info(withPrefix(`[${type}] ${msg}`));
      }
    },
  };
}

/* ============================================================
 * Interni: DOM helpers
 * ============================================================ */

/** @internal */
function randSuffix(n = 6) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + n);
}

/** @internal */
function deriveDefaultIds(root?: HTMLElement | null, wrapperOpt?: string | HTMLElement | false) {
  // prova a usare l'id del wrapper se c'è
  const wId = (typeof wrapperOpt === "string" && wrapperOpt.startsWith("#") ? wrapperOpt.slice(1) : null) || (root && root.id) || "";

  const base = wId || `epv-${randSuffix()}`;
  const inputId = `${base}-plate`;
  const inputName = base.includes("-plate") ? base : `${base}-plate`;
  return { inputId, inputName };
}

// helper interno
function resolveStatusCfg(ui?: EuroPlateUI) {
  const mode = ui?.statusMode ?? "block";
  return {
    statusMode: mode,
    statusIcon: ui?.statusIcon ?? "none",
    showStatusText: ui?.showStatusText ?? (mode === "inline" ? false : true),
    iconPosition: ui?.iconPosition ?? "right",
  } as Required<Pick<EuroPlateUI, "statusMode" | "statusIcon" | "showStatusText" | "iconPosition">>;
}
/* ============================================================
 * ENTRYPOINT PUBBLICO
 * ============================================================ */

/** Crea e inizializza il widget EuroPlate.
 *  - Se `wrapper` è truthy, genera markup/accessori nel wrapper.
 *  - Se `input` è passato, usa quello e non crea markup.
 *  - Autocarica dipendenze (Inputmask/jQuery/Toastr) secondo flags.
 *  - Applica mask live in base al paese (AUTO o fisso).
 *
 *  @param EuroMod Modulo core con validate/getInputMask/getDisplayFormat/…
 *  @param opts    Opzioni di configurazione (vedi `EuroPlateOptions`)
 *  @returns       Istanza `EuroPlateInstance`
 *  @throws        Error se wrapper/input non trovati o `EuroMod` incompleto
 */
export function createEuroPlate(EuroMod: any, opts: EuroPlateOptions): EuroPlateInstance {
  const {
    i18n = "AUTO",
    wrapper = false, // 👈 AGGIUNTO: selector | HTMLElement | false
    ui = {},
    allowedCountries,
    mode = "AUTO",
    vehicleType = "any",
    placeholders = { auto: "AA 999 AA / AA-999-AA / 9999 AAA" },
    normalize = (c: string) => (String(c || "").toUpperCase() === "GB" ? "UK" : String(c || "").toUpperCase()),
    formatters = {
      FR: (s: string) => s.toUpperCase().replace(/\s+/g, "-"),
      IT: (s: string) => s.toUpperCase().replace(/\s+/g, " "),
      ES: (s: string) => s.toUpperCase().replace(/[-_]+/g, " "),
    },
    timings = { debounce: 80, clear: 60 },
    logger,
    deps,
    autoFocusOnInit = false,
    debug = false,
    useToastrLogger = false,
  } = opts || ({} as EuroPlateOptions);

  // === toggle globale per il badge logger
  (window as any).CC_EPV_DEBUG = !!debug;

  // ----- RIFERIMENTI UI -----
  let lang: Lang = pickLang(i18n); // lingua

  let input_type: string = "text"; // TODO PERMETTERE DI DECIRE IL TYPE DELL INPUT (text/number/altro)?

  // riferimenti UI locali (li riempiremo da wrapper oppure da opts.ui)
  let input!: HTMLInputElement; // ← verrà assegnato
  let button: HTMLElement | undefined = ui.button ?? undefined;
  let dropdown: HTMLElement | undefined = ui.dropdown ?? undefined;
  let flagIcon: HTMLElement | undefined = ui.flagIcon ?? undefined;
  let flagLabel: HTMLElement | undefined = ui.flagLabel ?? undefined;
  let statusEl: HTMLElement | undefined = ui.status ?? undefined;
  // NEW: wrapper element (se presente)
  let wrapperEl: HTMLElement | null = null;

  // merge dei campi top-level legacy nelle ui options
  const uiMerged = {
    ...ui,
    statusMode: (opts as any).statusMode ?? ui.statusMode,
    statusIcon: (opts as any).statusIcon ?? ui.statusIcon,
    showStatusText: (opts as any).showStatusText ?? ui.showStatusText,
    iconPosition: (opts as any).iconPosition ?? ui.iconPosition,
  };
  // 🔄 facoltativo ma utile: aggiorna opts.ui per riflettere il merge
  (opts as any).ui = uiMerged;
  // ✅ risolvi configurazione status UNA SOLA VOLTA
  const statusCfg = resolveStatusCfg(uiMerged);
  const { statusMode, statusIcon, showStatusText, iconPosition } = statusCfg || {};

  // ----- AUTO-BUILD DOM SE wrapper È TRUTHY -----
  if (wrapper) {
    const root: HTMLElement | null = typeof wrapper === "string" ? document.querySelector(wrapper) : wrapper;

    if (!root) throw new Error(`Wrapper non trovato: ${String(wrapper)}`);

    const { inputId: defId, inputName: defName } = deriveDefaultIds(root, wrapper);

    const wantedId = opts.inputId || defId;
    const wantedName = opts.inputName || wantedId || defName || "plate";

    root.classList.add("plate-epv-wrapper");
    root.innerHTML = `
      <div class="plate-epv">
        <button class="flag-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
          <div class="epv__flag-box"><div class="epv__flag epv__auto-eu"></div></div>
          <span class="flag-label">${t(lang, "auto")}</span>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true" style="margin-left:4px">
            <path d="M6 8l4 4 4-4" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div class="epv__input-wrap">
          <input class="plate-input" type="${input_type}" placeholder="${t(lang, "placeholderAuto")}" autocomplete="off" />
          <!-- inline status host (invisibile se mode != inline) -->
          <span class="status-inline-host" aria-live="polite"></span>
        </div>
        <div class="dropdown" role="listbox" aria-label="Select country"></div>
      </div>
      <!-- status block (retro-compat) -->
      <div class="status" aria-live="polite"></div>
   `;

    // bind
    const plateInput = root.querySelector(".plate-input") as HTMLInputElement;
    if (!plateInput) throw new Error("Markup generato non contiene .plate-input");

    // assegna id/name (sempre, per coerenza con l’opts)
    plateInput.id = wantedId;
    plateInput.name = wantedName;
    // bind elementi generati

    button = root.querySelector(".flag-btn") as HTMLElement;
    flagIcon = root.querySelector(".epv__flag") as HTMLElement;
    flagLabel = root.querySelector(".flag-label") as HTMLElement;
    dropdown = root.querySelector(".dropdown") as HTMLElement;
    input = plateInput;
    //   const inputWrap = root.querySelector(".epv__input-wrap") as HTMLElement;

    // const inlineHost = (root as HTMLElement).querySelector(".status-inline-host") as HTMLElement;
    // const blockHost = (root as HTMLElement).querySelector(".status") as HTMLElement;
    const inlineHost = root.querySelector(".status-inline-host") as HTMLElement;
    const blockHost = root.querySelector(".status") as HTMLElement;
    // status element (inline/block/off)

    // scegli contenitore e applica le classi/dataset una sola volta
    if (statusMode === "inline") {
      statusEl = inlineHost;
      blockHost.style.display = "none";
      inlineHost.style.display = "";

      inlineHost.className = "status-inline-host"; // reset
      inlineHost.dataset.pos = iconPosition; // "right" | "left"
      inlineHost.dataset.icon = statusIcon; // "none" | "icon" | "pill"
      inlineHost.dataset.text = String(!!showStatusText);

      // assicurati struttura stabile (icon + text)
      let iconEl = inlineHost.querySelector(".s-icon") as HTMLElement | null;
      let textEl = inlineHost.querySelector(".s-text") as HTMLElement | null;
      if (!iconEl) {
        iconEl = document.createElement("span");
        iconEl.className = "s-icon";
        inlineHost.appendChild(iconEl);
      }
      if (!textEl) {
        textEl = document.createElement("span");
        textEl.className = "s-text";
        inlineHost.appendChild(textEl);
      }
    } else if (statusMode === "block") {
      statusEl = blockHost;
      inlineHost.style.display = "none";
    } else {
      // off
      statusEl = undefined;
      inlineHost.style.display = "none";
      blockHost.style.display = "none";
    }

    // aggiorna anche opts per retro-compat (se altrove li leggi da opts)
    (opts as any).ui = { button, flagIcon, flagLabel, dropdown, status: statusEl };
    (opts as any).input = input;

    // dopo aver ottenuto `root` e creato l’HTML
    wrapperEl = root;
  } else {
    // input esterno — usa ciò che arriva da fuori
    input = (opts as any).input as HTMLInputElement;
    if (!input) throw new Error("Devi passare `input` o `wrapper`.");

    const preserve = !!opts.preserveInputAttrs;

    // id/name secondo policy
    if (opts.inputId) {
      if (preserve) {
        if (!input.id) input.id = opts.inputId;
      } else {
        input.id = opts.inputId;
      }
    }
    if (opts.inputName) {
      if (preserve) {
        if (!input.name) input.name = opts.inputName;
      } else {
        input.name = opts.inputName;
      }
    }
    wrapperEl = (input.closest(".plate-epv-wrapper") as HTMLElement | null) ?? (input.parentElement as HTMLElement | null) ?? null;

    if (statusMode === "inline") {
      // assicurati un container posizionato
      const host = (wrapperEl?.querySelector(".epv__input-wrap") as HTMLElement | null) ?? (input.parentElement as HTMLElement | null) ?? input;

      if (getComputedStyle(host).position === "static") (host as HTMLElement).style.position = "relative";

      // crea un inline-host compatibile con quello del wrapper
      const inlineHost = document.createElement("span");
      inlineHost.className = "status-inline-host";
      inlineHost.dataset.pos = iconPosition;
      inlineHost.dataset.icon = statusIcon;
      inlineHost.dataset.text = String(!!showStatusText);

      const iconEl = document.createElement("span");
      iconEl.className = "s-icon";
      const textEl = document.createElement("span");
      textEl.className = "s-text";
      inlineHost.appendChild(iconEl);
      inlineHost.appendChild(textEl);

      host.appendChild(inlineHost);
      statusEl = inlineHost;
    } else if (statusMode === "block") {
      statusEl =
        (wrapperEl && (wrapperEl.querySelector(".status") as HTMLElement | null)) ??
        (() => {
          const d = document.createElement("div");
          d.className = "status";
          input.insertAdjacentElement("afterend", d);
          return d;
        })();
    } else {
      statusEl = undefined;
    }

    // fallback id/name se mancano
    if (!input.id || !input.name) {
      const { inputId: defId, inputName: defName } = deriveDefaultIds(wrapperEl, false);
      if (!input.id) input.id = defId;
      if (!input.name) input.name = defName;
    }

    // forza type (di default "text", oppure prendi da opts se lo esponi)
    const inputType = (opts as any).inputType ?? "text";
    try {
      input.type = inputType;
    } catch {
      /* ignore invalid types */
    }
  }

  // ---------- LOGGER (ora abbiamo l'id)
  let DBG = !!debug;
  const logPrefix = input?.id ? `[EPL:${input.id}]` : "[EPL]";

  // ✅ badge+log con prefix sempre incluso (riusa globali se presenti)
  const { BADGE, LOG } = ensureBadgeLogger(logPrefix, DBG);

  // logger base (console / esterno)
  let log: Logger = makeBaseLogger(logPrefix, DBG, logger);

  // ---------- DEPS (fire & forget, ora con BADGE/LOG in chiaro)
  void ensureDepsOnce(opts, log, BADGE, LOG).then(() => {
    const G = window as any;

    if (useToastrLogger && getToastr() && !logger && !G.CC_EPV_TOASTR_LOGGER_ATTACHED) {
      log = makeToastrLogger(logPrefix, DBG);
      G.CC_EPV_TOASTR_LOGGER_ATTACHED = true;
      BADGE("EuroPlate", "Toastr logger attached (once)", "debug");
    }
    // se IM arriva dopo e non siamo in AUTO, prova ad applicare la mask
    if (hasIMBound() && selected !== "AUTO") {
      try {
        applyMaskDebounced(input, selected);
      } catch {}
    }
  });

  // ---------- BIND ai deps (closure; niente variabili globali mutate)
  const getIMBound = () => getIM(deps);
  const hasIMBound = () => hasIM(deps);

  // ---------- EuroMod guard
  if (!EuroMod?.validatePlate || !EuroMod?.getInputMask) {
    throw new Error("EuroMod mancante o incompleto");
  }

  // ---------- Stato/utility come li avevi...
  const { supportedCountries, getInputMask, getDisplayFormat, FLAG_MAP, validatePlate } = EuroMod;
  // ---------- fine stato EuroMod

  let selected: "AUTO" | CountryKey = (() => {
    if (mode === "AUTO") return "AUTO";
    const n = normalize(String(mode || ""));
    return isCountryKey(n) ? (n as CountryKey) : "AUTO";
  })();

  let allowed: CountryKey[] = (allowedCountries && allowedCountries.length ? allowedCountries : [...supportedCountries]).map((c) => normalize(String(c || ""))).filter(isCountryKey) as CountryKey[];

  let destroyed = false;

  const fmtFor = (cc: string, s: string) => (formatters[cc] ? formatters[cc](s) : String(s).toUpperCase());

  // setFlag
  const setFlag = (code: "AUTO" | CountryKey | null, flagIcon: HTMLElement | undefined, flagLabel: HTMLElement | undefined, lang: Lang) => {
    if (!flagIcon || !flagLabel) return; // UI opzionale
    if (!code || code === "AUTO") {
      flagIcon.className = "epv__flag epv__auto-eu";
      flagLabel.textContent = t(lang, "auto");
      return;
    }
    const iso = FLAG_MAP[code] || "auto-eu";
    flagIcon.className = `epv__flag epv__${iso}`;
    flagLabel.textContent = `${countryName(lang, code)} (${code})`; // sempre string
  };

  const debounce = <T extends (...args: any[]) => any>(fn: T, wait = 80) => {
    let t: any;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  function hardClearMask(el?: HTMLInputElement | null) {
    if (!el || !hasIMBound()) return; // 👈 use the bound helper
    setTimeout(() => {
      try {
        (el as any)._imInstance?.remove?.();
      } catch {}
      try {
        (el as any).inputmask?.remove?.();
      } catch {}
      (el as any)._imInstance = null;
    }, 0);
    log.debug?.("mask:clear (hard)");
  }
  const hardClearMaskDebounced = debounce(hardClearMask, timings.clear);

  const normalizePattern = (p: string) =>
    String(p)
      .replace(/A\{(\d+)\}/g, (_, n) => "A".repeat(+n))
      .replace(/9\{(\d+)\}/g, (_, n) => "9".repeat(+n));

  const applyMaskDebounced = debounce((inputEl: HTMLInputElement, country: string) => {
    if (!hasIMBound()) {
      log.warn?.("Inputmask non disponibile: salto applyMask");
      return;
    }
    const IM = getIMBound()! as IMGlobal; // tipo: IMGlobal

    if (!IM) {
      log.warn?.("AGAIN: Inputmask non disponibile: RETURN!");
      return;
    }

    if (!inputEl || !country || country === "AUTO") {
      hardClearMaskDebounced(inputEl);
      return;
    }

    const spec = getInputMask(country);
    if (!spec) {
      hardClearMaskDebounced(inputEl);
      return;
    }

    const optsIM = {
      mask: normalizePattern(spec.mask),
      keepStatic: spec.keepStatic ?? true,
      greedy: spec.greedy ?? false,
      placeholder: "",
      showMaskOnHover: false,
      showMaskOnFocus: false,
      jitMasking: true,
      autoUnmask: false,
      insertModeVisual: false,
      rightAlign: false,
      definitions: spec.definitions || {
        A: { validator: "[A-Z]", casing: "upper" },
        H: { validator: "[A-HJ-NP-RTV-Z]", casing: "upper" },
        9: { validator: "[0-9]" },
      },
      onBeforeMask: (v: string) => fmtFor(country, String(v ?? "")),
      onBeforePaste: (p: string) => fmtFor(country, String(p ?? "")),
      positionCaretOnClick: "lvp",
    };

    try {
      (inputEl as any)._imInstance?.remove?.();
      (inputEl as any).inputmask?.remove?.();
    } catch {}

    let instance: IMInstance;
    try {
      // UMD spesso è callable
      instance = IM(optsIM);
    } catch {
      // fallback costruttore
      instance = new IM(optsIM);
    }

    instance.mask(inputEl);
    (inputEl as any)._imInstance = instance;
    log.debug?.("mask:apply", country, optsIM.mask);
  }, timings.debounce);

  // setValidityUI
  function setValidityUI(ok: boolean | null, msg: string, matchCountry: CountryKey | null, input: HTMLInputElement, status: HTMLElement | undefined, lang: Lang, wrap?: HTMLElement | null) {
    // INPUT: classi + aria
    if (ok === true) {
      input.classList.add("valid");
      input.classList.remove("invalid");
      input.setAttribute("aria-invalid", "false");
      input.setCustomValidity("");
      wrap?.classList.add("valid");
      wrap?.classList.remove("invalid");
    } else if (ok === false) {
      input.classList.add("invalid");
      input.classList.remove("valid");
      input.setAttribute("aria-invalid", "true");
      input.setCustomValidity(msg || "Invalid");
      wrap?.classList.add("invalid");
      wrap?.classList.remove("valid");
    } else {
      // idle
      input.classList.remove("valid", "invalid");
      input.removeAttribute("aria-invalid");
      input.setCustomValidity("");
      wrap?.classList.remove("valid", "invalid");
    }

    if (!status || statusMode === "off") return;

    // dataset per CSS (→ usato anche dai selettori :has)
    if (ok === true) status.dataset.state = "ok";
    else if (ok === false) status.dataset.state = "err";
    else delete status.dataset.state; // idle: nessuno stato

    const shortText = ok === true && matchCountry ? `${countryName(lang, matchCountry)} (${matchCountry})` : ok === false ? t(lang, "invalid") : ""; // idle → niente testo

    if (statusMode === "inline") {
      status.className = "status-inline-host";
      status.dataset.pos = iconPosition;
      status.dataset.icon = statusIcon;
      status.dataset.text = String(!!showStatusText);

      let iconEl = status.querySelector(".s-icon") as HTMLElement | null;
      let textEl = status.querySelector(".s-text") as HTMLElement | null;
      if (!iconEl) {
        iconEl = document.createElement("span");
        iconEl.className = "s-icon";
        status.appendChild(iconEl);
      }
      if (!textEl) {
        textEl = document.createElement("span");
        textEl.className = "s-text";
        status.appendChild(textEl);
      }

      // icona
      iconEl.className = "s-icon";
      if (ok === true) {
        if (statusIcon === "icon") iconEl.textContent = "✓";
        else if (statusIcon === "pill") {
          iconEl.classList.add("pill", "ok");
          iconEl.textContent = "✓";
        } else iconEl.textContent = "";
      } else if (ok === false) {
        if (statusIcon === "icon") iconEl.textContent = "!";
        else if (statusIcon === "pill") {
          iconEl.classList.add("pill", "err");
          iconEl.textContent = "!";
        } else iconEl.textContent = "";
      } else {
        // idle
        iconEl.textContent = "";
        iconEl.classList.remove("pill", "ok", "err");
      }

      // testo
      textEl.textContent = ok == null ? "" : showStatusText ? shortText : "";
      textEl.style.display = showStatusText && ok != null ? "" : "none";
      return;
    }

    // BLOCK (retro)
    if (ok === true && matchCountry) {
      status.className = "status ok";
      status.textContent = `✅ ${t(lang, "valid")} — ${countryName(lang, matchCountry)} (${matchCountry})`;
    } else if (ok === false) {
      status.className = "status err";
      status.textContent = msg || `❌ ${t(lang, "invalid")}`;
    } else {
      status.className = "status";
      status.textContent = "";
    }
    BADGE("EuroPlate", `status block → ${ok ? "OK" : "ERR"}`, ok ? "ok" : "err");
  }

  // renderDropdown
  function renderDropdown() {
    if (!dropdown) return;
    const frag = document.createDocumentFragment();

    // AUTO
    {
      const auto = document.createElement("div");
      auto.className = "country-item";
      auto.role = "option";
      auto.dataset.value = "AUTO";
      auto.innerHTML = `
      <div class="epv__flag-box"><div class="epv__flag epv__auto-eu"></div></div>
      <div class="country-name">${t(lang, "auto")}</div>
      <div class="country-code">ANY</div>`;
      auto.onclick = () => selectCountry("AUTO");
      frag.appendChild(auto);
    }

    // paesi whitelisted
    for (const c of allowed) {
      const cc = normalize(String(c || ""));
      if (!isCountryKey(cc)) continue;

      const iso = FLAG_MAP?.[cc] || "auto-eu";
      const div = document.createElement("div");
      div.className = "country-item";
      div.role = "option";
      div.dataset.value = cc;
      div.innerHTML = `
        <div class="epv__flag-box"><div class="epv__flag epv__${iso}"></div></div>
        <div class="country-name">${countryName(lang, cc)}</div>
        <div class="country-code">${cc}</div>`;
      div.onclick = () => selectCountry(cc); // farà focus (interazione utente)
      frag.appendChild(div);
    }

    dropdown.innerHTML = "";
    dropdown.appendChild(frag);
  }

  function validateNow() {
    if (destroyed) return { ok: false, value: input.value };

    let raw = input.value;

    if (!raw.trim()) {
      // IN 1-0-12
      //setValidityUI(true as any, "", null, input, statusEl, lang, wrapperEl);
      //input.classList.remove("valid", "invalid");
      //wrapperEl?.classList.remove("valid", "invalid");
      setValidityUI(null, "", null, input, statusEl, lang, wrapperEl); // 👈 idle
      if (selected === "AUTO") {
        hardClearMaskDebounced(input);
        input.placeholder = placeholders.auto || "";
      }
      return { ok: false, value: raw };
    }

    if (selected !== "AUTO") {
      const formatted = fmtFor(selected, raw);
      if (formatted !== raw) {
        const caret = input.selectionStart;
        input.value = formatted;
        if (caret != null) input.setSelectionRange(caret, caret);
        raw = formatted;
      }
    } else {
      const v2 = raw.toUpperCase().replace(/\s+/g, " ").trimStart();
      if (v2 !== raw) input.value = raw = v2;
    }
    // non validiamo finche nn c e un risultato minimo
    if(raw.trim()?.length <= 2) return { ok: false, value: raw };

    const countries = selected === "AUTO" ? allowed : [selected];
    const res = validatePlate(raw, countries, { vehicleType });

    if (res.isValid && res.matches.length) {
      const m = normalize(res.matches[0]?.country || "");
      if (isCountryKey(m)) {
        const match = m as CountryKey;

        const formatted = fmtFor(match, input.value);
        if (formatted !== input.value) input.value = formatted;

        setValidityUI(true, "", match, input, statusEl, lang, wrapperEl);
        setFlag(match, flagIcon, flagLabel, lang);
        applyMaskDebounced(input, match);

        const fmt = getDisplayFormat(match);
        if (fmt) input.placeholder = fmt;

        return { ok: true, country: match, value: input.value };
      } else {
        // fallback: se non è un CountryKey valido, trattalo come KO sotto
        // KO
        const checkedArr = res.checked ?? [];
        const msg = checkedArr.length ? `❌ ${t(lang, "invalid")} — ${t(lang, "checked")}: ${checkedArr.join(", ")}` : `❌ ${t(lang, "invalid")}`;

        setValidityUI(false, msg, null, input, statusEl, lang, wrapperEl);

        // In AUTO rimuovi eventuale mask “residua”
        if (selected === "AUTO") {
          hardClearMaskDebounced(input);
          input.placeholder = "";
        }

        return { ok: false, value: input.value };
      }
    } else {
      // KO
      const checkedArr = res.checked ?? [];
      const msg = checkedArr.length ? `❌ ${t(lang, "invalid")} — ${t(lang, "checked")}: ${checkedArr.join(", ")}` : `❌ ${t(lang, "invalid")}`;

      setValidityUI(false, msg, null, input, statusEl, lang, wrapperEl);

      // In AUTO rimuovi eventuale mask “residua”
      if (selected === "AUTO") {
        hardClearMaskDebounced(input);
        input.placeholder = "";
      }

      return { ok: false, value: input.value };
    }
  }

  function updatePlaceholderForCurrentSelection(selected: "AUTO" | CountryKey, input: HTMLInputElement, EuroMod: any, lang: Lang) {
    if (selected === "AUTO") {
      input.placeholder = t(lang, "placeholderAuto");
    } else {
      input.placeholder = EuroMod.getDisplayFormat(selected) || "";
    }
  }

  // hasBtnDrop
  function hasBtnDrop(b?: HTMLElement, d?: HTMLElement): b is HTMLElement & {} {
    return !!b && !!d;
  }

  // onDocClick
  const onDocClick = (e: MouseEvent) => {
    if (!dropdown || !button) return;
    const t = e.target as Node;
    if (!dropdown.contains(t) && !button.contains(t)) {
      dropdown.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    }
  };

  function selectCountry(code: "AUTO" | string, doFocus = true) {
    // normalizza/valida
    let next: "AUTO" | CountryKey = "AUTO";
    if (code !== "AUTO") {
      const n = normalize(String(code || ""));
      if (isCountryKey(n)) next = n;
      else next = "AUTO";
    }
    selected = next;

    // flag + placeholder
    setFlag(selected, flagIcon, flagLabel, lang);
    updatePlaceholderForCurrentSelection(selected, input, EuroMod, lang);

    // mask
    if (selected === "AUTO") {
      hardClearMaskDebounced(input);
    } else {
      const v = fmtFor(selected, input.value);
      if (input.value !== v) input.value = v;
      applyMaskDebounced(input, selected);
    }

    // chiudi dropdown
    if (dropdown && button) {
      dropdown.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    }

    // 👇 focus solo se booleano true esplicito
    if (doFocus === true) input.focus();
  }

  const instance: EuroPlateInstance = {
    setCountry: (code) => selectCountry(code),

    setAllowed(codes) {
      allowed = Array.from(new Set((codes || []).map((c) => normalize(String(c || ""))))).filter(isCountryKey) as CountryKey[];
      renderDropdown();
    },
    setVehicleType(t) {
      (opts as any).vehicleType = t;
    },
    setDebug(on) {
      DBG = !!on;
    },

    // 3) in setMode mantieni il focus (interazione esplicita)
    setMode(m: "AUTO" | string) {
      selectCountry(m); // focus = true (default)
    },

    setI18n(code) {
      lang = pickLang(code);
      renderDropdown();
      setFlag(selected, flagIcon, flagLabel, lang);
      updatePlaceholderForCurrentSelection(selected, input, EuroMod, lang);
    },
    validate: validateNow,
    destroy() {
      destroyed = true;
      hardClearMaskDebounced(input);
      input.removeEventListener("input", validateNow as any);
      input.removeEventListener("blur", validateNow as any);
      document.removeEventListener("click", onDocClick);
    },
    getI18n: () => lang,
  };

  // wiring eventi
  if (button) {
    button.addEventListener("click", () => {
      if (!dropdown) return;
      const open = dropdown.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.addEventListener("click", onDocClick);
  input.addEventListener("input", validateNow as any);
  input.addEventListener("blur", validateNow as any);

  // 4) all’init evita il focus
  renderDropdown();
  selectCountry(mode, !!autoFocusOnInit); // 👈 niente autofocus all’avvio // ok: la funzione normalizza e imposta selected ("AUTO" | CountryKey)

  log.notify?.("EuroPlate pronto ✅", "success");

  return instance;
}

/* ============================================================
 * NOTE STRUTTURALI
 * - Tutto ciò che NON è esportato è considerato interno.
 * - @internal aiuta i lettori; per l’elisione serve tsconfig/declaration maps.
 * ============================================================ */

/**
 * Wrapper DOM
 * - A runtime, se `wrapper` è fornito, viene generata la struttura:
 *   .plate-epv-wrapper
 *     .plate-epv
 *       button.flag-btn > .epv__flag-box > .epv__flag
 *       input.plate-input
 *       .dropdown
 *     .status
 * - Classi di stato:
 *   input: .valid / .invalid (aria-invalid aggiornato)
 *   .dropdown: .open on/off
 *   .status: .ok / .err
 *
 * Accessibilità:
 * - `flag-btn` è `aria-haspopup="listbox"` + `aria-expanded`
 * - `.dropdown` ha `role="listbox"` e item con `role="option"`
 */
