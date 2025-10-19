import type { ColorKey, CCColors, SmartLogFn, BadgeFn } from "../../../types/logger-colors.ts";
export type { ColorKey, CCColors, SmartLogFn, BadgeFn } from "../../../types/logger-colors.ts";
/**
 * Inizializza (senza sovrascrivere) CC_BADGE/CC_LOG globali.
 * Restituisce BADGE/LOG che prependono SEMPRE `prefix`.
 */
export function ensureBadgeLogger(prefix: string, debug: boolean) {
  const DEFAULT_COLORS: CCColors = {
    ok: "#9fe870",
    warn: "#f3b44a",
    err: "#e85959",
    info: "#7ac8ff",
    debug: "#7e57c2", // 👈 viola "developer" (material deep-purple)
    gold: "#b69b6a",
    bg1: "#111",
    bg3: "#333",
  };

  const G = window as any;
  G.CC_COLORS = G.CC_COLORS || DEFAULT_COLORS;

  const globalBADGE = typeof G.CC_BADGE === "function" ? (G.CC_BADGE as (m: string, t: string, c?: string) => void) : null;

  // Badge locale “di base” (usato solo se NON esiste un globale già presente)
  function localBADGE(mod: string, msg: string, colorKey?: ColorKey | string) {
    if (!debug) return;
    const c = G.CC_COLORS[colorKey as keyof CCColors] || colorKey || G.CC_COLORS.gold;
    const txc = [G.CC_COLORS["bg1"], G.CC_COLORS["bg1"]].includes(c) ? "#fff" : "#000";
    //const tag = `%c CodeCorn™ ${mod} %c ${prefix} ${msg} %c`;
    // ⚠️ niente prefix qui: lo aggiunge il wrapper BADGE sotto
    const tag = `%c CodeCorn™ ${mod} %c ${msg} %c`;
    const css1 = `background:${G.CC_COLORS.bg1};color:#fff;padding:3px 6px;border-radius:4px 0 0 4px;`;
    const css2 = `background:${c};color:${txc};font-weight:bold;padding:3px 6px;text-transform:uppercase;`;
    const css3 = `background:${G.CC_COLORS.bg3};color:#fff;padding:3px 6px;border-radius:0 4px 4px 0;`;
    try {
      console.log(tag, css1, css2, css3);
    } catch {}
  }

  // Non sovrascrivere: se non c’è, definisci; se c’è, lascialo com’è.
  if (!globalBADGE) {
    G.CC_BADGE = localBADGE;
  }

  // LOG intelligente con prefix, serializzazione safe
  function localLOG(...args: any[]) {
    if (!debug) return;
    const parts = args.map((a) => {
      if (a && (a.nodeType || (a as any).jquery)) return "[DOM]";
      if (typeof a === "object") {
        try {
          return JSON.stringify(a);
        } catch {
          return "[Object]";
        }
      }
      return String(a);
    });
    // usa il badge globale ma aggiungi tu il prefix
    (G.CC_BADGE as any)("EuroPlate", `${prefix} ${parts.join(" ")}`, "ok");
  }

  if (typeof G.CC_LOG !== "function") {
    G.CC_LOG = localLOG;
  }

  // Wrapper che prepende SEMPRE il prefix anche se CC_BADGE è custom
  const BADGE = (mod: string, msg: string, color?: ColorKey | string) => (G.CC_BADGE as any)(mod, `${prefix} ${msg}`, color);

  const LOG = (...a: any[]) => localLOG(...a);

  return { BADGE, LOG };
}
