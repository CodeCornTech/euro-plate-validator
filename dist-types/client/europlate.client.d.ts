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
    input: HTMLInputElement;
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
    logger?: Logger;
    deps?: {
        inputmask?: any;
    };
    debug?: boolean;
};
export type EuroPlateInstance = {
    setCountry: (code: "AUTO" | string) => void;
    setAllowed: (codes: string[]) => void;
    setVehicleType: (t: VehicleType) => void;
    setDebug: (on: boolean) => void;
    validate: () => {
        ok: boolean;
        country?: string;
        value: string;
    };
    destroy: () => void;
};
export declare function createEuroPlate(EuroMod: any, opts: EuroPlateOptions): EuroPlateInstance;
//# sourceMappingURL=europlate.client.d.ts.map