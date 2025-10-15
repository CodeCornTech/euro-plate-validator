// src/client/index.ts 
// Esponi SOLO l’API pubblica del client
export type {
  I18nCode,
  VehicleType,
  Logger,
  EuroPlateUI,
  EuroPlateOptions,
  EuroPlateInstance,
} from "./europlate.client.js";

export { createEuroPlate } from "./europlate.client.js";
