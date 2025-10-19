import type { ColorKey } from "../../../types/logger-colors.ts";
export type { ColorKey, CCColors, SmartLogFn, BadgeFn } from "../../../types/logger-colors.ts";
/**
 * Inizializza (senza sovrascrivere) CC_BADGE/CC_LOG globali.
 * Restituisce BADGE/LOG che prependono SEMPRE `prefix`.
 */
export declare function ensureBadgeLogger(prefix: string, debug: boolean): {
    BADGE: (mod: string, msg: string, color?: ColorKey | string) => any;
    LOG: (...a: any[]) => void;
};
//# sourceMappingURL=ensureBadgeLogger.d.ts.map