// src/utils/placeholders.ts

import type { CountryKey, InputMaskLayout } from "../countries.js";

/**
 * Converte un "display format" leggibile in un placeholder.
 * Regole :
 *  - Lettere ( A / B / L / H / C ) → "_"
 *  - Cifre ( 9 / # / 0-9 ) → "_"
 *  - Separatori ( spazio , - , . , / ) → preservati
 *  - Per formati multipli ( "|" o "/" ) prende il PRIMO segmento significativo
 */
export function placeholderFromDisplayFormat(format: string): string {
  const pick = firstSignificantVariant(format);

  let out = "";
  for (const ch of pick) {
    if (isLetterToken(ch) || isDigitToken(ch)) out += "_";
    else out += ch; // separatori, spazi, trattini, ecc.
  }
  // normalizza spazi multipli
  return out.replace(/\s{2,}/g, " ").trim();
}

/**
 * Separa per '|' o '/' e sceglie la variante più rappresentativa.
 * Criteri : prima variante non vuota , preferibilmente con cifre.
 */
function firstSignificantVariant(format: string): string {
  const parts = format.split(/\s*(?:\|\/|\/|\|)\s*/).filter(Boolean);
  if (parts.length === 0) return format;
  // Heuristica : preferisci quella con più cifre / lunghezza
  return parts.slice().sort((a, b) => scoreVariant(b) - scoreVariant(a))[0];
}

function scoreVariant(s: string): number {
  const digits = (s.match(/[9#0-9]/g) || []).length;
  return digits * 10 + s.length; // peso maggiore ai digit
}

function isLetterToken(ch: string): boolean {
  // Token usati nei display : A B L H C X
  return /[A-Z]/.test(ch) && /[ABLHCX]/.test(ch);
}

function isDigitToken(ch: string): boolean {
  return /[9#0-9]/.test(ch);
}
// --- helper per tokenizzare una mask ---
function isLetterTokenMask(ch: string): boolean {
  // token lettere usati nelle nostre mask: L / H / C / X (più eventuali A/B)
  return /[A-Z]/.test(ch) && /[LH CAX]/.test(ch.replace(/ /g, "")); // tollera spazio
}
function isDigitTokenMask(ch: string): boolean {
  return /[9#0]/.test(ch);
}
function isSeparator(ch: string): boolean {
  return !isLetterTokenMask(ch) && !isDigitTokenMask(ch);
}

// prende il primo/ultimo char non-separatore
function firstNonSep(s: string): string | null {
  for (const ch of s) if (!isSeparator(ch)) return ch;
  return null;
}
function lastNonSep(s: string): string | null {
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i];
    if (!isSeparator(ch)) return ch;
  }
  return null;
}

// blocchi di lettere consecutivi (per preferire LL-...-LL)
function countLetterBlocks(s: string): number {
  let blocks = 0,
    inBlock = false;
  for (const ch of s) {
    if (isLetterTokenMask(ch)) {
      if (!inBlock) {
        blocks++;
        inBlock = true;
      }
    } else if (!isSeparator(ch)) {
      inBlock = false;
    } else {
      // separatore: chiude eventuale blocco
      inBlock = false;
    }
  }
  return blocks;
}

function scoreMaskVariant(s: string): number {
  const digits = (s.match(/[9#0]/g) || []).length;
  const letters = (s.match(/[A-Z]/g) || []).length; // conta i token lettera
  const len = s.length;

  const first = firstNonSep(s);
  const last = lastNonSep(s);

  const startsWithLetter = first ? isLetterTokenMask(first) : false;
  const endsWithLetter = last ? isLetterTokenMask(last) : false;

  const letterBlocks = countLetterBlocks(s);

  // base: preferisci molte cifre (più informativo) e lunghezza
  // bonus: inizio con lettera (+8), fine con lettera (+4), 2+ blocchi lettera (+3)
  // ulteriore bonus: più lettere totali (+letters)
  return digits * 10 + len + (startsWithLetter ? 8 : 0) + (endsWithLetter ? 4 : 0) + (letterBlocks >= 2 ? 3 : 0) + letters;
}

/**
 * Dato un array di mask Inputmask, genera un placeholder rappresentativo
 * scegliendo la variante con punteggio migliore (preferenza: inizio lettera).
 */
export function placeholderFromMasks(masks: string[]): string {
  const best = masks.slice().sort((a, b) => scoreMaskVariant(b) - scoreMaskVariant(a))[0] || "";
  let out = "";
  for (const ch of best) {
    if (isLetterTokenMask(ch)) out += "_";
    else if (isDigitTokenMask(ch)) out += "_";
    else out += ch; // separatori
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

/**
 * Costruisce una mappa CountryKey → placeholder a partire dai DISPLAY_FORMATS.
 */
export function buildPlaceholdersFromDisplay(displayFormats: Partial<Record<CountryKey, string>>): Partial<Record<CountryKey, string>> {
  const out: Partial<Record<CountryKey, string>> = {};
  for (const [k, fmt] of Object.entries(displayFormats) as [CountryKey, string][]) {
    out[k] = placeholderFromDisplayFormat(fmt);
  }
  return out;
}

/**
 * Inietta i placeholder mancanti dentro le layout Inputmask.
 * - Se la layout ha `placeholder` non vuoto → NON toccare.
 * - Se `mask` è stringa → deriva placeholder dalla mask.
 * - Se `mask` è array → usa placeholderFromMasks.
 * - Se fallisce → prova da DISPLAY_FORMATS.
 * Inoltre: normalizza keepStatic `null` → `undefined`.
 */
export function finalizeInputMaskLayouts<T extends Partial<Record<CountryKey, InputMaskLayout>>>(baseLayouts: T, displayFormats: Partial<Record<CountryKey, string>>): T {
  // copia superficiale della mappa; poi copiamo ogni voce che modifichiamo
  const out: Partial<Record<CountryKey, InputMaskLayout>> = { ...baseLayouts };

  const displayPH: Partial<Record<CountryKey, string>> = {};
  for (const [k, fmt] of Object.entries(displayFormats) as [CountryKey, string][]) {
    displayPH[k] = placeholderFromDisplayFormat(fmt);
  }

  (Object.keys(out) as CountryKey[]).forEach((cc) => {
    const layout = out[cc];
    if (!layout) return;

    let next: InputMaskLayout = { ...layout };

    // normalizza keepStatic: null → undefined
    if (next.keepStatic === null) {
      delete (next as any).keepStatic;
    }

    // se già presente e non vuoto, lascia stare
    if (next.placeholder && next.placeholder.trim()) {
      out[cc] = next;
      return;
    }

    // prova a derivare dalla mask
    const m = next.mask;
    if (typeof m === "string") {
      next.placeholder = placeholderFromMasks([m]);
    } else if (Array.isArray(m) && m.length > 0) {
      next.placeholder = placeholderFromMasks(m as string[]);
    }

    // fallback dal display format
    if (!next.placeholder || !next.placeholder.trim()) {
      if (displayPH[cc]) next.placeholder = displayPH[cc]!;
    }

    out[cc] = next;
  });

  return out as T;
}
