// types/logger-colors.d.ts
export type ColorKey = "ok" | "warn" | "err" | "info" | "gold" | "bg1" | "bg3";
export type CCColors = Record<ColorKey | "bg1" | "bg3", string>;
export type BadgeFn = (mod: string, msg: string, color?: CCColorKey | string) => void;
export type SmartLogFn = (...a: any[]) => void;

declare global {
  interface Window {
    CC_COLORS?: CCColors;
    CC_BADGE?: BadgeFn = () => {};
    CC_LOG?: SmartLogFn = () => {};
    CC_LOGGER_READY?: boolean;
    CC_EPV_DEBUG?: boolean; // EuroPlate
    CC_EPV_OPTS?: { debug?: boolean };
    CC_S2_DEBUG?: boolean; // Select2 compat
    CC_S2_OPTS?: { debug?: boolean };
  }
}

export{};