/// <reference types="jquery" />
/// <reference types="toastr" />
/// <reference types="inputmask" />

export {}; // mantiene il file come modulo

declare global {
  interface Window {
    jQuery?: JQueryStatic;
    $?: JQueryStatic;
    toastr?: Toastr;
    Inputmask?: typeof import("inputmask");
  }
}
// Se preferisci usare `window` invece di `globalThis`, decommenta la riga seguente
//declare var window: Window;