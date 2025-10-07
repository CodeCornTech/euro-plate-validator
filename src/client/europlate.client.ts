// Minimal client SDK (mask + validate + UI opzionale) — dependency-light
// Usa IM UMD su window.Inputmask (injectabile), nessun hardcode di DOM/paesi.

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
  input: HTMLInputElement; // REQUIRED
  ui?: EuroPlateUI; // opzionale (UI pronta)
  allowedCountries?: string[]; // default: tutte
  mode?: "AUTO" | string; // default: "AUTO"
  vehicleType?: VehicleType; // default: "any"
  placeholders?: { auto?: string }; // default: "AA 999 AA / AA-999-AA / 9999 AAA"
  normalize?: (code: string) => string; // default: GB->UK
  formatters?: Record<string, (s: string) => string>; // per-CC
  timings?: { debounce?: number; clear?: number }; // default: 80/60
  logger?: Logger; // opzionale
  deps?: { inputmask?: any }; // opzionale (se non c’è su window)
  debug?: boolean; // default: false
};

export type EuroPlateInstance = {
  setCountry: (code: "AUTO" | string) => void;
  setAllowed: (codes: string[]) => void;
  setVehicleType: (t: VehicleType) => void;
  setDebug: (on: boolean) => void;
  validate: () => { ok: boolean; country?: string; value: string };
  destroy: () => void;
};

export function createEuroPlate(EuroMod: any, opts: EuroPlateOptions): EuroPlateInstance {
  const {
    input,
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
    debug = false,
  } = opts || ({} as EuroPlateOptions);

  const button = ui.button ?? undefined;
  const dropdown = ui.dropdown ?? undefined;
  const flagIcon = ui.flagIcon ?? undefined;
  const flagLabel = ui.flagLabel ?? undefined;
  const statusEl = ui.status ?? undefined;

  if (!EuroMod?.validatePlate || !EuroMod?.getInputMask) {
    throw new Error("EuroMod mancante o incompleto");
  }
  if (!input) throw new Error("opts.input è richiesto");

  // logger morbido
  let DBG = !!debug;
  const log: Logger = {
    debug: (...a) => {
      if (DBG) (logger?.debug ?? console.debug)("[EPL]", ...a);
    },
    info: (...a) => {
      if (DBG) (logger?.info ?? console.info)("[EPL]", ...a);
    },
    warn: (...a) => {
      if (DBG) (logger?.warn ?? console.warn)("[EPL]", ...a);
    },
    error: (...a) => {
      if (DBG) (logger?.error ?? console.error)("[EPL]", ...a);
    },
    notify: (msg, type = "info") => {
      if (DBG) (logger?.notify ?? (() => {}))(msg, type);
    },
  };

  const IM = deps?.inputmask ?? (globalThis as any).Inputmask;
  if (!IM) log.warn?.("Inputmask non trovato: la maschera non sarà applicata");

  const {
    supportedCountries,
    getInputMask,
    getDisplayFormat,
    COUNTRY_NAMES,
    FLAG_MAP,
    validatePlate,
  } = EuroMod;

  let selected = mode;
  let allowed =
    allowedCountries && allowedCountries.length ? allowedCountries : [...supportedCountries];
  let destroyed = false;

  const fmtFor = (cc: string, s: string) =>
    formatters[cc] ? formatters[cc](s) : String(s).toUpperCase();

  // setFlag
  const setFlag = (code?: string) => {
    if (!flagIcon || !flagLabel) return;
    if (!code || code === "AUTO") {
      flagIcon.className = "iti__flag iti__auto-eu";
      flagLabel.textContent = "Auto (All)";
      return;
    }
    const iso = FLAG_MAP?.[code] || "auto-eu";
    flagIcon.className = `iti__flag iti__${iso}`;
    flagLabel.textContent = `${COUNTRY_NAMES?.[code] ?? code} (${code})`;
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
  function setValidityUI(ok: boolean, msg?: string, matchCountry?: string) {
    input.classList.toggle("valid", !!ok);
    input.classList.toggle("invalid", !ok);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    input.setCustomValidity(ok ? "" : msg || "Invalid plate");

    if (statusEl) {
      if (ok && matchCountry) {
        statusEl.className = "status ok";
        statusEl.textContent = `✅ Valida — ${COUNTRY_NAMES?.[matchCountry] ?? matchCountry} (${matchCountry})`;
      } else if (!ok) {
        statusEl.className = "status err";
        statusEl.textContent = msg || "❌ Non valida";
      } else {
        statusEl.className = "status";
        statusEl.textContent = "";
      }
    }
  }

  // renderDropdown
  function renderDropdown() {
    if (!dropdown) return;
    const frag = document.createDocumentFragment();

    const auto = document.createElement("div");
    auto.className = "country-item";
    auto.role = "option";
    auto.dataset.value = "AUTO";
    auto.innerHTML = `
    <div class="iti__flag-box"><div class="iti__flag iti__auto-eu"></div></div>
    <div class="country-name">Auto (All)</div>
    <div class="country-code">ANY</div>`;
    auto.onclick = () => instance.setCountry("AUTO");
    frag.appendChild(auto);

    for (const c of allowed) {
      const iso = FLAG_MAP?.[c] || "auto-eu";
      const div = document.createElement("div");
      div.className = "country-item";
      div.role = "option";
      div.dataset.value = c;
      div.innerHTML = `
      <div class="iti__flag-box"><div class="iti__flag iti__${iso}"></div></div>
      <div class="country-name">${COUNTRY_NAMES?.[c] ?? c}</div>
      <div class="country-code">${c}</div>`;
      div.onclick = () => instance.setCountry(c);
      frag.appendChild(div);
    }
    dropdown.innerHTML = "";
    dropdown.appendChild(frag);
  }

  function validateNow() {
    if (destroyed) return { ok: false, value: input.value };

    let raw = input.value;

    if (!raw.trim()) {
      setValidityUI(false, "", null as any);
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
      const match = normalize(res.matches[0]?.country || "");
      const formatted = fmtFor(match, input.value);
      if (formatted !== input.value) input.value = formatted;

      setValidityUI(true, "", match);
      setFlag(match);
      applyMaskDebounced(input, match);

      const fmt = getDisplayFormat(match);
      if (fmt) input.placeholder = fmt;

      return { ok: true, country: match, value: input.value };
    } else {
      setValidityUI(
        false,
        (res.checked || []).length
          ? `❌ Non valida — Controllati: ${(res.checked || []).join(", ")}`
          : "❌ Non valida",
        undefined
      );
      if (selected === "AUTO") {
        hardClearMaskDebounced(input);
        input.placeholder = "";
      }
      return { ok: false, value: input.value };
    }
  }

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

  const instance: EuroPlateInstance = {
    setCountry(code) {
      selected = code;
      setFlag(selected);

      const ph = selected === "AUTO" ? placeholders.auto || "" : getDisplayFormat(selected) || "";
      input.placeholder = ph;

      if (selected === "AUTO") {
        hardClearMaskDebounced(input);
      } else {
        const v = fmtFor(selected, input.value);
        if (input.value !== v) input.value = v;
        applyMaskDebounced(input, selected);
      }

      // instance.setCountry
      if (dropdown && button) {
        dropdown.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }

      input.focus();
    },
    setAllowed(codes) {
      allowed = Array.from(new Set((codes || []).map(normalize)));
      renderDropdown();
    },
    setVehicleType(t) {
      (opts as any).vehicleType = t;
    },
    setDebug(on) {
      DBG = !!on;
    },
    validate: validateNow,
    destroy() {
      destroyed = true;
      hardClearMaskDebounced(input);
      input.removeEventListener("input", validateNow as any);
      input.removeEventListener("blur", validateNow as any);
      document.removeEventListener("click", onDocClick);
    },
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

  renderDropdown();
  instance.setCountry(selected);
  log.notify?.("EuroPlate pronto ✅", "success");

  return instance;
}
