import { fotosPersistenEnProduccion } from "./almacenamientoImagen";

/**
 * Configuración de entorno para demo vs producción.
 * En producción, sin `CERCALUD_MOSTRAR_EJEMPLOS=1`, no se muestran datos `example` ni avisos demo.
 */
export function mostrarDatosEjemplo() {
  const raw = process.env.CERCALUD_MOSTRAR_EJEMPLOS?.trim().toLowerCase();
  if (raw === "1" || raw === "true" || raw === "si" || raw === "yes") return true;
  if (raw === "0" || raw === "false" || raw === "no") return false;
  return process.env.NODE_ENV !== "production";
}

/** @deprecated Contacto público: usar WhatsApp (contactoWhatsApp / lib/contactoCercalud). */
export function contactoEmail() {
  return process.env.CERCALUD_CONTACTO_EMAIL?.trim() || "contacto@cercalud.com.ar";
}

/** WhatsApp institucional de Cercalud. Override con CERCALUD_CONTACTO_WHATSAPP. */
export function contactoWhatsApp() {
  const custom = process.env.CERCALUD_CONTACTO_WHATSAPP?.trim();
  if (custom && custom.replace(/\D/g, "").length >= 10) return custom.replace(/\D/g, "");
  return "3743483429";
}

const AUTH_SECRET_PLANTILLA = "cambia-esta-frase-por-una-larga-y-minima-de-32-caracteres";

export function authConfigurado() {
  const valor = process.env.AUTH_SECRET?.trim() ?? "";
  if (valor.length < 32) return false;
  if (process.env.NODE_ENV === "production" && valor === AUTH_SECRET_PLANTILLA) return false;
  return true;
}

export function correoAdminConfigurado() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

export function correoReservadoParaAdmin(email: string) {
  const admin = correoAdminConfigurado();
  return admin.length > 0 && email.trim().toLowerCase() === admin;
}

/** Solo avisar si en producción las fotos quedarían en disco efímero (raro). */
export function avisoFotosHosting() {
  if (fotosPersistenEnProduccion()) return false;
  return process.env.NODE_ENV === "production";
}

export function urlSitioPublico() {
  const custom = process.env.CERCALUD_SITE_URL?.trim();
  if (custom) return custom.replace(/\/$/, "");
  return "https://donde-atenderse.apps.grok.bot";
}