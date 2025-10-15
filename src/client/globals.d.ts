// src/client/globals.d.ts
import type { JQueryStatic } from "jquery";
import type { Toastr } from "toastr";

declare global {
  interface Window {
    jQuery?: JQueryStatic;
    $?: JQueryStatic;
    toastr?: Toastr;
    Inputmask?: typeof import("inputmask");
    __CSP_NONCE__?: string;
  }
}
export {};
// Se preferisci usare `window` invece di `globalThis`, decommenta la riga seguente
//declare var window: Window;
