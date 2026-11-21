import { enlaceWhatsApp } from "@/lib/format";

/** Número de Cercalud (Misiones). Podés cambiarlo con el Secret CERCALUD_CONTACTO_WHATSAPP. */
export const WHATSAPP_RECUPERACION_DEFECTO = "3743483429";

export const MENSAJE_RECUPERACION_INGRESO =
  "Hola, olvidé mis datos de ingreso a Cercalud.";

export function numeroWhatsAppRecuperacion() {
  if (typeof process !== "undefined") {
    const desdeSecret = process.env.CERCALUD_CONTACTO_WHATSAPP?.trim();
    if (desdeSecret) return desdeSecret;
  }
  return WHATSAPP_RECUPERACION_DEFECTO;
}

export function enlaceRecuperacionIngreso() {
  return enlaceWhatsApp(numeroWhatsAppRecuperacion(), MENSAJE_RECUPERACION_INGRESO);
}