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

export function contactoEmail() {
  return process.env.CERCALUD_CONTACTO_EMAIL?.trim() || "contacto@cercalud.com.ar";
}

export function contactoWhatsApp() {
  return process.env.CERCALUD_CONTACTO_WHATSAPP?.trim() || "";
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

/** En hosting con Postgres el disco de fotos puede no persistir entre despliegues. */
export function avisoFotosHosting() {
  return process.env.NODE_ENV === "production" && (process.env.DATABASE_URL?.startsWith("postgres") ?? false);
}

export function urlSitioPublico() {
  const custom = process.env.CERCALUD_SITE_URL?.trim();
  if (custom) return custom.replace(/\/$/, "");
  return "https://donde-atenderse.apps.grok.bot";
}