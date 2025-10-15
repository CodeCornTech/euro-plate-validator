// src/client/europlate.client.ts
// Minimal client SDK (mask + validate + UI opzionale) — dependency-light
// Usa IM UMD su window.Inputmask (injectabile), nessun hardcode di DOM/paesi.
import type { CountryKey } from "../countries.js";
import {
  FLAG_MAP, // TODO: ALLINEARE O RIMUOVERE
  COUNTRY_NAMES, // TODO: ALLINEARE O RIMUOVERE VEDI LINEA :393 const { ... COUNTRY_NAMES } = EuroMod;
  supportedCountries,
  normalizeCode,
  getCountryName,
} from "../countries.js";

function loadScriptOnce(src: string): Promise<void> {
  if (!src) return Promise.resolve();
  if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.onload = () => res();
    s.onerror = () => rej(new Error("Failed " + src));
    document.head.appendChild(s);
  });
}
function loadCssOnce(href: string): Promise<void> {
  if (!href) return Promise.resolve();
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return Promise.resolve();
  return new Promise((res, rej) => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.crossOrigin = "anonymous";
    l.onload = () => res();
    l.onerror = () => rej(new Error("Failed " + href));
    document.head.appendChild(l);
  });
}
const cdnURLs = {
  basePath: "https://cdn.jsdelivr.net/npm/",
  jquery: { v: "jquery@3.7.1", JS: "/dist/jquery.min.js" },
  toastr: { v: "toastr@2.1.4", JS: "/build/toastr.min.js", CSS: "/build/toastr.min.css" },
  inputmask: { v: "inputmask@5.0.9", JS: "/dist/inputmask.min.js"},
};

async function ensureDeps(opts: EuroPlateOptions) {
  const wantJQ = opts.autoLoadDeps?.jquery === true;
  const wantToastr = opts.autoLoadDeps?.toastr === true;

  const jqueryUrl =
    opts.cdn?.jquery ?? "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js";
  const toastrJsUrl =
    opts.cdn?.toastrJs ?? "https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.js";
  const toastrCssUrl =
    opts.cdn?.toastrCss ?? "https://cdn.jsdelivr.net/npm/toastr@2.1.4/build/toastr.min.css";

  // jQuery (solo se richiesto e non presente)
  if (wantJQ && !(globalThis as any).jQuery) {
    try {
      await loadScriptOnce(jqueryUrl);
    } catch {}
  }
  // Toastr (solo se richiesto e non presente)
  if (wantToastr && !(globalThis as any).toastr) {
    try {
      await Promise.all([loadCssOnce(toastrCssUrl), loadScriptOnce(toastrJsUrl)]);
    } catch {}
  }
}

type Lang = "it" | "en";
export type I18nCode = "AUTO" | "IT" | "EN";

export type VehicleType = "any" | "car" | "bike";
export type Logger = {
  debug?: (...a: any[]) => void;
  info?: (...a: any[]) => void;
  warn?: (...a: any[]) => void;
  error?: (...a: any[]) => void;
  notify?: (msg: string, type?: string) => void;
};

export type EuroPlateUI = {
  flagIcon?: HTMLElement;
  flagLabel?: HTMLElement;
  dropdown?: HTMLElement;
  button?: HTMLElement;
  status?: HTMLElement;
};

export type EuroPlateOptions = {
  i18n?: I18nCode; // <— NEW (default: 'AUTO')
  input?: HTMLInputElement; // era required → ora opzionale (se usi wrapper)
  wrapper?: string | HTMLElement | false; // 👈 selector, nodo o false (default)
  /** Nuovi: attributi input */
  inputId?: string; // default: derivato da wrapper/id → "epv-plate-xxxx"
  inputName?: string; // default: derivato da id oppure "plate"
  preserveInputAttrs?: boolean; //Se true, non sovrascrive id/name quando l'input è esterno. Default: false (sovrascrive)
  ui?: EuroPlateUI; // opzionale (UI pronta)
  allowedCountries?: string[]; // default: tutte
  mode?: "AUTO" | string; // default: "AUTO"
  vehicleType?: VehicleType; // default: "any"
  placeholders?: { auto?: string }; // default: "AA 999 AA / AA-999-AA / 9999 AAA"
  normalize?: (code: string) => string; // default: GB->UK
  formatters?: Record<string, (s: string) => string>; // per-CC
  timings?: { debounce?: number; clear?: number }; // default: 80/60
  autoFocusOnInit?: boolean; // Se true, imposta il focus sull’input all’inizializzazione. Default: false
  deps?: { inputmask?: any }; // opzionale (se non c’è su window)
  // 👉 Autoload delle dipendenze (true di default)
  autoLoadDeps?: {
    inputmask?: boolean; // default: true
    jquery?: boolean; // default: false
    toastr?: boolean; // default: false
  };
  // 👉 CDN override (se vuoi cambiare l’URL)
  cdn?: {
    inputmask?: string; // default jsDelivr UMD
    jquery?: string; // default: jsDelivr
    toastrJs?: string; // default: jsDelivr
    toastrCss?: string; // default: jsDelivr
  };
  debug?: boolean; // default: false (messaggi console) | ATTIVA IL LOGGER IN CONSOLE / TOASTR SE PRESENTE nel window
  /** Dipendenze opzionali per logger */
  /** Se true e non passi un logger, userà jQuery (se presente/caricato) */
  useJqueryLogger?: boolean; // default: false
  /** Se true e non passi un logger, userà Toastr (se presente/caricato) */
  useToastrLogger?: boolean; // default: false
  logger?: Logger; // opzionale
};

const ALL_COUNTRIES = supportedCountries as readonly CountryKey[];

function isCountryKey(x: string): x is CountryKey {
  return (ALL_COUNTRIES as readonly string[]).includes(x);
}

// 👇 chiavi scalari (niente 'countries')
type DictScalarKey = "auto" | "placeholderAuto" | "valid" | "invalid" | "checked";

// Nomi paese localizzati (facoltativi per ciascun cc)
type CountryNameDict = Partial<Record<CountryKey, string>>;
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
      IT: "Italia",
      UK: "Regno Unito",
      DE: "Germania",
      FR: "Francia",
      ES: "Spagna",
      PT: "Portogallo",
      NL: "Paesi Bassi",
      BE: "Belgio",
      CH: "Svizzera",
      AT: "Austria",
      IE: "Irlanda",
      LU: "Lussemburgo",
      DK: "Danimarca",
      SE: "Svezia",
      NO: "Norvegia",
      FI: "Finlandia",
      PL: "Polonia",
      CZ: "Cechia",
      SK: "Slovacchia",
      HU: "Ungheria",
      RO: "Romania",
      BG: "Bulgaria",
      SI: "Slovenia",
      HR: "Croazia",
      GR: "Grecia",
      LT: "Lituania",
      LV: "Lettonia",
      EE: "Estonia",
      UA: "Ucraina",
    },
  },
  en: {
    auto: "Auto (All)",
    placeholderAuto: "AA 999 AA / AA-999-AA / 9999 AAA",
    valid: "Valid",
    invalid: "Invalid",
    checked: "Checked",
    countries: {
      IT: "Italy",
      UK: "United Kingdom",
      DE: "Germany",
      FR: "France",
      ES: "Spain",
      PT: "Portugal",
      NL: "Netherlands",
      BE: "Belgium",
      CH: "Switzerland",
      AT: "Austria",
      IE: "Ireland",
      LU: "Luxembourg",
      DK: "Denmark",
      SE: "Sweden",
      NO: "Norway",
      FI: "Finland",
      PL: "Poland",
      CZ: "Czechia",
      SK: "Slovakia",
      HU: "Hungary",
      RO: "Romania",
      BG: "Bulgaria",
      SI: "Slovenia",
      HR: "Croatia",
      GR: "Greece",
      LT: "Lithuania",
      LV: "Latvia",
      EE: "Estonia",
      UA: "Ukraine",
    },
  },
};

function pickLang(code: I18nCode): Lang {
  if (code === "IT") return "it";
  if (code === "EN") return "en";
  const nav = (navigator?.language || "").toLowerCase();
  return nav.startsWith("it") ? "it" : "en";
}

// ✅ ora t() restituisce sempre string
function t(lang: Lang, key: DictScalarKey): string {
  return DICT[lang][key];
}

// ✅ countryName legge prima i18n, poi fallback EN/core
function countryName(lang: Lang, cc: string): string {
  const norm = normalizeCode(cc) as CountryKey | undefined;
  if (!norm) return cc.toUpperCase();
  const local = DICT[lang].countries?.[norm];
  if (local) return local;
  return getCountryName(norm) ?? COUNTRY_NAMES[norm] ?? norm;
}

export type EuroPlateInstance = {
  setCountry: (code: "AUTO" | string) => void;
  setAllowed: (codes: string[]) => void;
  setVehicleType: (t: VehicleType) => void;
  setDebug: (on: boolean) => void;
  setMode: (m: "AUTO" | string) => void; // 👈 aggiunto
  setI18n: (code: I18nCode) => void; // 👈 mancava
  validate: () => { ok: boolean; country?: string; value: string };
  destroy: () => void;
  getI18n: () => Lang;
};

function randSuffix(n = 6) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + n);
}
function deriveDefaultIds(root?: HTMLElement | null, wrapperOpt?: string | HTMLElement | false) {
  // prova a usare l'id del wrapper se c'è
  const wId =
    (typeof wrapperOpt === "string" && wrapperOpt.startsWith("#") ? wrapperOpt.slice(1) : null) ||
    (root && root.id) ||
    "";

  const base = wId || `epv-${randSuffix()}`;
  const inputId = `${base}-plate`;
  const inputName = base.includes("-plate") ? base : `${base}-plate`;
  return { inputId, inputName };
}

//prettier-ignore
function makeToastrLogger(logPrefix='[EPL]',DBG: boolean): Logger {
  const t: any = (globalThis as any).toastr;
  const has = !!t;
  return {
    debug: (...a) => { if (DBG) console.debug(logPrefix, ...a); },
    info:  (...a) => { if (DBG) console.info(logPrefix, ...a); has && t.info?.(a.join(" ")); },
    warn:  (...a) => { if (DBG) console.warn(logPrefix, ...a); has && t.warning?.(a.join(" ")); },
    error: (...a) => { console.error(logPrefix, ...a); has && t.error?.(a.join(" ")); },
    notify: (msg, type = "info") => {
      if (!has) { if (DBG) console.log(logPrefix, msg); return; }
      const fn = (t[type] || t.info).bind(t);
      try { fn(String(msg)); } catch {}
    },
  };
}

export function createEuroPlate(EuroMod: any, opts: EuroPlateOptions): EuroPlateInstance {
  const {
    i18n = "AUTO",
    //input,
    wrapper = false, // 👈 AGGIUNTO: selector | HTMLElement | false
    ui = {},
    allowedCountries,
    mode = "AUTO",
    vehicleType = "any",
    placeholders = { auto: "AA 999 AA / AA-999-AA / 9999 AAA" },
    normalize = (c: string) =>
      String(c || "").toUpperCase() === "GB" ? "UK" : String(c || "").toUpperCase(),
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

  // kick-off best-effort (non blocca l’init)
  try {
    void ensureDeps(opts);
  } catch {}
  // prepara logger
  let lang: Lang = pickLang(i18n);

  // ----- RIFERIMENTI UI -----
  // TODO PERMETTERE DI DECIRE IL TYPE DELL INPUT (text/number/altro)?
  // riferimenti UI locali (li riempiremo da wrapper oppure da opts.ui)
  let input!: HTMLInputElement; // ← verrà assegnato
  let button: HTMLElement | undefined = ui.button ?? undefined;
  let dropdown: HTMLElement | undefined = ui.dropdown ?? undefined;
  let flagIcon: HTMLElement | undefined = ui.flagIcon ?? undefined;
  let flagLabel: HTMLElement | undefined = ui.flagLabel ?? undefined;
  let statusEl: HTMLElement | undefined = ui.status ?? undefined;

  // ----- AUTO-BUILD DOM SE wrapper È TRUTHY -----
  if (wrapper) {
    const root: HTMLElement | null =
      typeof wrapper === "string" ? document.querySelector(wrapper) : wrapper;

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
      <input class="plate-input" type="text" placeholder="${t(lang, "placeholderAuto")}" autocomplete="off" />
      <div class="dropdown" role="listbox" aria-label="Select country"></div>
    </div>
    <div class="status"></div>
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
    statusEl = root.querySelector(".status") as HTMLElement;

    // aggiorna anche opts per retro-compat (se altrove li leggi da opts)
    (opts as any).ui = { button, flagIcon, flagLabel, dropdown, status: statusEl };
    (opts as any).input = input;
  } else {
    // input esterno     // nessun wrapper → usa ciò che arriva da fuori (comportamento attuale)

    input = (opts as any).input as HTMLInputElement;
    if (!input) throw new Error("Devi passare `input` o `wrapper`.");

    const preserve = !!opts.preserveInputAttrs;

    // se l’utente ha passato inputId/inputName → applica secondo policy
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

    // fallback di sicurezza se mancano entrambi
    if (!input.id || !input.name) {
      const { inputId: defId, inputName: defName } = deriveDefaultIds(
        input.closest<HTMLElement>(".plate-epv-wrapper") || input.parentElement,
        false
      );
      if (!input.id) input.id = defId;
      if (!input.name) input.name = defName;
    }
  }

  // guard finali
  if (!EuroMod?.validatePlate || !EuroMod?.getInputMask) {
    throw new Error("EuroMod mancante o incompleto");
  }
  if (!input) throw new Error("Devi passare `input` o `wrapper`.");

  // logger morbido
  let DBG = !!debug;
  const logPrefix = `[EPL:${input.id}]`;
  //prettier-ignore
  let log: Logger = {
    debug: (...a) => { if (DBG) (opts.logger?.debug ?? console.debug)(logPrefix, ...a); },
    info:  (...a) => { if (DBG) (opts.logger?.info  ?? console.info )(logPrefix, ...a); },
    warn:  (...a) => { if (DBG) (opts.logger?.warn  ?? console.warn )(logPrefix, ...a); },
    error: (...a) => { (opts.logger?.error ?? console.error)(logPrefix, ...a); },
    notify: (msg, type = "info") => { if (DBG) (opts.logger?.notify ?? (()=>{}))(msg, type); },
  };

  //prettier-ignore
  // se non è stato passato un logger e l’utente chiede Toastr, prova ad abilitarlo appena c’è
  if (!opts.logger && useToastrLogger) {
    // primo tentativo immediato
    if ((globalThis as any).toastr) { log = makeToastrLogger(logPrefix,DBG); }
    else {
      // secondo tentativo “post-caricamento” (non blocca nulla)
      setTimeout(() => {
        if ((globalThis as any).toastr) {
          log = makeToastrLogger(logPrefix,DBG);
          log.info?.("Toastr logger attached");
        }
      }, 200);
    }
  }

  // ---- Inputmask fallback loader ---------------------------------------------
  let IM: any = deps?.inputmask ?? (globalThis as any).Inputmask;
  let imReady = !!IM;
  const wantAutoload = opts.autoLoadDeps?.inputmask !== false; // default: true

  const imCdnUrl =
    opts.cdn?.inputmask ?? "https://cdn.jsdelivr.net/npm/inputmask@5.0.9/dist/inputmask.min.js";

  // Carica UMD async se non presente e autoload attivo
  if (!IM && wantAutoload) {
    const script = document.createElement("script");
    script.src = imCdnUrl;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      IM = (globalThis as any).Inputmask;
      imReady = !!IM;
      log.info?.("Inputmask caricato da CDN");
      // se siamo già su un paese fisso, prova a (ri)applicare la maschera
      if (IM && selected !== "AUTO") {
        try {
          applyMaskDebounced(input, selected);
        } catch {}
      }
    };
    script.onerror = () => {
      log.warn?.("Caricamento Inputmask fallito (CDN)");
    };
    document.head.appendChild(script);
  }

  function hasIM(): boolean {
    return !!IM;
  }

  const {
    supportedCountries,
    getInputMask,
    getDisplayFormat,
    COUNTRY_NAMES,
    FLAG_MAP,
    validatePlate,
  } = EuroMod;

  let selected: "AUTO" | CountryKey = (() => {
    if (mode === "AUTO") return "AUTO";
    const n = normalize(String(mode || ""));
    return isCountryKey(n) ? (n as CountryKey) : "AUTO";
  })();

  let allowed: CountryKey[] = (
    allowedCountries && allowedCountries.length ? allowedCountries : [...supportedCountries]
  )
    .map((c) => normalize(String(c || "")))
    .filter(isCountryKey) as CountryKey[];

  let destroyed = false;

  const fmtFor = (cc: string, s: string) =>
    formatters[cc] ? formatters[cc](s) : String(s).toUpperCase();

  // setFlag
  const setFlag = (
    code: "AUTO" | CountryKey | null,
    flagIcon: HTMLElement | undefined,
    flagLabel: HTMLElement | undefined,
    lang: Lang
  ) => {
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
    if (!el || !IM) return;
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
    if (!hasIM()) {
      log.warn?.("Inputmask non disponibile: salto applyMask");
      return;
    }
    if (!IM) return;
    if (!inputEl || !country || country === "AUTO") {
      hardClearMaskDebounced(inputEl);
      return;
    }
    const spec = getInputMask(country);
    if (!spec) {
      hardClearMaskDebounced(inputEl);
      return;
    }

    const opts = {
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

    let instance: any;
    try {
      instance = IM(opts);
    } catch {
      instance = new IM(opts);
    }
    instance.mask(inputEl);
    (inputEl as any)._imInstance = instance;
    log.debug?.("mask:apply", country, opts.mask);
  }, timings.debounce);

  // setValidityUI
  function setValidityUI(
    ok: boolean,
    msg: string,
    matchCountry: CountryKey | null,
    input: HTMLInputElement,
    status: HTMLElement | undefined,
    lang: Lang
  ) {
    input.classList.toggle("valid", !!ok);
    input.classList.toggle("invalid", !ok);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    input.setCustomValidity(ok ? "" : msg || "Invalid plate");

    if (!status) return;

    if (ok && matchCountry) {
      status.className = "status ok";
      status.textContent = `✅ ${t(lang, "valid")} — ${countryName(lang, matchCountry)} (${matchCountry})`;
    } else if (!ok) {
      status.className = "status err";
      status.textContent = msg || `❌ ${t(lang, "invalid")}`;
    } else {
      status.className = "status";
      status.textContent = "";
    }
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
      setValidityUI(false, "", null, input, statusEl, lang);

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

    const countries = selected === "AUTO" ? allowed : [selected];
    const res = validatePlate(raw, countries, { vehicleType });

    if (res.isValid && res.matches.length) {
      const m = normalize(res.matches[0]?.country || "");
      if (isCountryKey(m)) {
        const match = m as CountryKey;

        const formatted = fmtFor(match, input.value);
        if (formatted !== input.value) input.value = formatted;

        setValidityUI(true, "", match, input, statusEl, lang);
        setFlag(match, flagIcon, flagLabel, lang);
        applyMaskDebounced(input, match);

        const fmt = getDisplayFormat(match);
        if (fmt) input.placeholder = fmt;

        return { ok: true, country: match, value: input.value };
      } else {
        // fallback: se non è un CountryKey valido, trattalo come KO sotto
        // KO
        const checkedArr = res.checked ?? [];
        const msg = checkedArr.length
          ? `❌ ${t(lang, "invalid")} — ${t(lang, "checked")}: ${checkedArr.join(", ")}`
          : `❌ ${t(lang, "invalid")}`;

        setValidityUI(false, msg, null, input, statusEl, lang);

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
      const msg = checkedArr.length
        ? `❌ ${t(lang, "invalid")} — ${t(lang, "checked")}: ${checkedArr.join(", ")}`
        : `❌ ${t(lang, "invalid")}`;

      setValidityUI(false, msg, null, input, statusEl, lang);

      // In AUTO rimuovi eventuale mask “residua”
      if (selected === "AUTO") {
        hardClearMaskDebounced(input);
        input.placeholder = "";
      }

      return { ok: false, value: input.value };
    }
  }

  function updatePlaceholderForCurrentSelection(
    selected: "AUTO" | CountryKey,
    input: HTMLInputElement,
    EuroMod: any,
    lang: Lang
  ) {
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
      allowed = Array.from(new Set((codes || []).map((c) => normalize(String(c || ""))))).filter(
        isCountryKey
      ) as CountryKey[];
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
