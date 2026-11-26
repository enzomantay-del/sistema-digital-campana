import { enlaceWhatsAppCercalud, numeroWhatsAppCercalud, WHATSAPP_CERCALUD_DEFECTO } from "@/lib/contactoCercalud";

/** @deprecated Usá numeroWhatsAppCercalud(). */
export const WHATSAPP_RECUPERACION_DEFECTO = WHATSAPP_CERCALUD_DEFECTO;

export const MENSAJE_RECUPERACION_INGRESO =
  "Hola, olvidé mis datos de ingreso a Cercalud.";

export function numeroWhatsAppRecuperacion() {
  return numeroWhatsAppCercalud();
}

export function enlaceRecuperacionIngreso() {
  return enlaceWhatsAppCercalud(MENSAJE_RECUPERACION_INGRESO);
}