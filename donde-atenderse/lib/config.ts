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

export function authConfigurado() {
  const valor = process.env.AUTH_SECRET?.trim() ?? "";
  return valor.length >= 32;
}