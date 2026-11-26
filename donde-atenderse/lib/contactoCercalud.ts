import { contactoWhatsApp } from "@/lib/config";
import { enlaceWhatsApp } from "@/lib/format";

export const WHATSAPP_CERCALUD_DEFECTO = "3743483429";

export function numeroWhatsAppCercalud() {
  const n = contactoWhatsApp().replace(/\D/g, "");
  return n.length >= 10 ? n : WHATSAPP_CERCALUD_DEFECTO;
}

/** Pedir usuario/contraseña para fichas (profesional o centro completo). */
export const MENSAJE_PEDIR_ACCESO =
  "Hola, consulto por Cercalud. Necesito usuario y contraseña para cargar fichas en el directorio (puede ser una ficha mía o las de todo un centro de salud, con cuentas para secretaría si hace falta). Indico nombre del lugar, localidad y mi rol (profesional o secretaría). Gracias.";

export const MENSAJE_CONSULTA_CERCALUD = "Hola, consulto por Cercalud.";

export function mensajePublicidadCercalud(formatoNombre: string) {
  return `Hola, consulto por publicidad (${formatoNombre}) en Cercalud.`;
}

export function enlaceWhatsAppCercalud(mensaje: string) {
  return enlaceWhatsApp(numeroWhatsAppCercalud(), mensaje);
}

export function enlacePedirAccesoCercalud() {
  return enlaceWhatsAppCercalud(MENSAJE_PEDIR_ACCESO);
}