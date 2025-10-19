// types/logger-colors.d.ts
export type ColorKey = "ok" | "warn" | "err" | "info" | "debug" | "gold";
export type BgKey    = "bg1" | "bg3";

/** Tavolozza completa usata da CC_BADGE/CC_LOG */
export type CCColors = Record<ColorKey | BgKey, string>;

/** Firma del badge: accetta chiavi note o qualsiasi stringa CSS color */
export type BadgeFn   = (mod: string, msg: string, color?: ColorKey | BgKey | string) => void;
export type SmartLogFn = (...a: any[]) => void;

declare global {
  interface Window {
    /** Palette globale (puoi impostare solo le chiavi che vuoi) */
    CC_COLORS?: Partial<CCColors>;

    /** Funzioni globali opzionali; saranno valorizzate a runtime */
    CC_BADGE?: BadgeFn;
    CC_LOG?: SmartLogFn;

    /** Flag diagnostici */
    CC_LOGGER_READY?: boolean;

    /** Toggle debug per EPV/S2 (se presenti) */
    CC_EPV_DEBUG?: boolean;
    CC_EPV_OPTS?: { debug?: boolean };

    CC_S2_DEBUG?: boolean;
    CC_S2_OPTS?: { debug?: boolean };
  }
}

export {};
