/// <reference types="jquery" />
/// <reference types="toastr" />

declare global {
  interface Window {
    jQuery?: JQueryStatic;
    toastr?: Toastr;
  }
}
export {};
