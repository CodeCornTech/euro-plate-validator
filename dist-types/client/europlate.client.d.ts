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
    i18n?: I18nCode;
    input?: HTMLInputElement;
    wrapper?: string | HTMLElement | false;
    /** Nuovi: attributi input */
    inputId?: string;
    inputName?: string;
    preserveInputAttrs?: boolean;
    ui?: EuroPlateUI;
    allowedCountries?: string[];
    mode?: "AUTO" | string;
    vehicleType?: VehicleType;
    placeholders?: {
        auto?: string;
    };
    normalize?: (code: string) => string;
    formatters?: Record<string, (s: string) => string>;
    timings?: {
        debounce?: number;
        clear?: number;
    };
    autoFocusOnInit?: boolean;
    deps?: {
        inputmask?: any;
    };
    autoLoadDeps?: {
        inputmask?: boolean;
        jquery?: boolean;
        toastr?: boolean;
    };
    cdn?: {
        inputmask?: string;
        jquery?: string;
        toastrJs?: string;
        toastrCss?: string;
    };
    debug?: boolean;
    /** Dipendenze opzionali per logger */
    /** Se true e non passi un logger, userà jQuery (se presente/caricato) */
    useJqueryLogger?: boolean;
    /** Se true e non passi un logger, userà Toastr (se presente/caricato) */
    useToastrLogger?: boolean;
    logger?: Logger;
};
export type EuroPlateInstance = {
    setCountry: (code: "AUTO" | string) => void;
    setAllowed: (codes: string[]) => void;
    setVehicleType: (t: VehicleType) => void;
    setDebug: (on: boolean) => void;
    setMode: (m: "AUTO" | string) => void;
    setI18n: (code: I18nCode) => void;
    validate: () => {
        ok: boolean;
        country?: string;
        value: string;
    };
    destroy: () => void;
    getI18n: () => Lang;
};
export declare function createEuroPlate(EuroMod: any, opts: EuroPlateOptions): EuroPlateInstance;
export {};
//# sourceMappingURL=europlate.client.d.ts.map