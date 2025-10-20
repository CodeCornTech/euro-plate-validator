import type { CountryKey, InputMaskLayout } from "../countries.js";
/**
 * Converte un "display format" leggibile in un placeholder.
 * Regole :
 *  - Lettere ( A / B / L / H / C ) → "_"
 *  - Cifre ( 9 / # / 0-9 ) → "_"
 *  - Separatori ( spazio , - , . , / ) → preservati
 *  - Per formati multipli ( "|" o "/" ) prende il PRIMO segmento significativo
 */
export declare function placeholderFromDisplayFormat(format: string): string;
/**
 * Dato un array di mask Inputmask, genera un placeholder rappresentativo
 * scegliendo la variante con punteggio migliore (preferenza: inizio lettera).
 */
export declare function placeholderFromMasks(masks: string[]): string;
/**
 * Costruisce una mappa CountryKey → placeholder a partire dai DISPLAY_FORMATS.
 */
export declare function buildPlaceholdersFromDisplay(displayFormats: Partial<Record<CountryKey, string>>): Partial<Record<CountryKey, string>>;
/**
 * Inietta i placeholder mancanti dentro le layout Inputmask.
 * - Se la layout ha `placeholder` non vuoto → NON toccare.
 * - Se `mask` è stringa → deriva placeholder dalla mask.
 * - Se `mask` è array → usa placeholderFromMasks.
 * - Se fallisce → prova da DISPLAY_FORMATS.
 * Inoltre: normalizza keepStatic `null` → `undefined`.
 */
export declare function finalizeInputMaskLayouts<T extends Partial<Record<CountryKey, InputMaskLayout>>>(baseLayouts: T, displayFormats: Partial<Record<CountryKey, string>>): T;
//# sourceMappingURL=placeholders.d.ts.map