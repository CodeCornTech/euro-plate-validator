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
    statusMode?: "block" | "inline" | "off";
    statusIcon?: "none" | "icon" | "pill";
    showStatusText?: boolean;
    iconPosition?: "right" | "left";
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
    input?: HTMLInputElement;
    /** Wrapper in cui generare automaticamente la UI.
     *  - string: CSS selector (es. "#my-wrapper")
     *  - HTMLElement: nodo esistente
     *  - false: disabilita auto-build (usa `input`)
     *  @default false
     */
    wrapper?: string | HTMLElement | false;
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
    placeholders?: {
        auto?: string;
    };
    /** Normalizzatore codici paese (es. GB→UK). */
    normalize?: (code: string) => string;
    /** Formatter per country code (applicato a input/paste). */
    formatters?: Record<string, (s: string) => string>;
    /** Timing UI: debounce applicazione mask e clear. @default {debounce:80,clear:60} */
    timings?: {
        debounce?: number;
        clear?: number;
    };
    /** Se true, applica focus all’input all’init. @default false */
    autoFocusOnInit?: boolean;
    /** Dipendenze iniettate (per test o per ambienti bundler).
     *  - `inputmask`: factory/constructor UMD di Inputmask
     */
    deps?: {
        inputmask?: any;
    };
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
    validate: () => {
        ok: boolean;
        country?: string;
        value: string;
    };
    /** Distrugge listeners e rimuove mask. */
    destroy: () => void;
    /** Ritorna la lingua corrente (“it” | “en”). */
    getI18n: () => Lang;
};
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
export declare function createEuroPlate(EuroMod: any, opts: EuroPlateOptions): EuroPlateInstance;
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
//# sourceMappingURL=europlate.client.d.ts.map