import { normalizar } from "./format";

/** Clave única para detectar matrículas duplicadas (vacío = sin clave). */
export function claveMatricula(license: string): string | null {
  const limpia = license.trim();
  if (limpia.length < 3) return null;
  const clave = normalizar(limpia).replace(/\s+/g, "");
  return clave.length >= 3 ? clave : null;
}