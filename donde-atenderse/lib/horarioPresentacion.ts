/** Separa «lunes a viernes: mañana 08:00 a 12:00.» en título y detalle. */
export function partirLineaHorario(linea: string): { titulo: string; detalle: string } {
  const limpia = linea.trim().replace(/\.$/, "");
  const idx = limpia.indexOf(":");
  if (idx === -1) return { titulo: "", detalle: limpia };
  return {
    titulo: limpia.slice(0, idx).trim(),
    detalle: limpia.slice(idx + 1).trim(),
  };
}

const INICIO_NUEVA_LINEA =
  /\.\s+(?=(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bados?|domingos?|todos\b|[A-ZÁÉÍÓÚ]))/i;

/** Si el horario quedó en un solo párrafo, lo parte en varias líneas. */
export function expandirLineasHorario(lineas: string[]): string[] {
  if (lineas.length !== 1) return lineas.filter((l) => l.trim());
  const unica = lineas[0]?.trim() ?? "";
  if (!unica) return [];
  if (!INICIO_NUEVA_LINEA.test(unica)) return [unica];
  return unica
    .split(INICIO_NUEVA_LINEA)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .map((parte) => (parte.endsWith(".") ? parte : `${parte}.`));
}

/** Detalle con varios turnos («mañana X · tarde Y») en chips. */
export function trozosDetalleHorario(detalle: string): string[] {
  if (!detalle) return [];
  if (detalle.includes(" · ")) return detalle.split(" · ").map((t) => t.trim()).filter(Boolean);
  return [detalle];
}