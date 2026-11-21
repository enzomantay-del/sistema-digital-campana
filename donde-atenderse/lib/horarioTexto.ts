import { TURNOS } from "./constants";
import { diasDesdeTexto, textoDias } from "./format";
import { lineasHorarioLugar, normalizarHora } from "./placeSchedule";

function etiquetaTurno(id: string) {
  return TURNOS.find((turno) => turno.id === id)?.label ?? "";
}

function textoRangoLibre(time: string) {
  const t = time.trim();
  if (!t) return "";
  if (/24\s*h/i.test(t)) return "24 h";
  const match = t.match(/^(\d{1,2})(?::(\d{2}))?\s*a\s*(\d{1,2})(?::(\d{2}))?$/i);
  if (match) {
    const desde = normalizarHora(match[2] ? `${match[1]}:${match[2]}` : match[1]!);
    const hasta = normalizarHora(match[4] ? `${match[3]}:${match[4]}` : match[3]!);
    if (desde && hasta) return `${desde} a ${hasta}`;
  }
  return t;
}

/** Misma redacción que las franjas v2: «lunes a viernes: mañana 08:00 a 12:00.» */
export function lineasHorarioLegacy(days: string, time: string, shift = ""): string[] {
  const titulo = textoDias(diasDesdeTexto(days));
  if (!titulo) return [];
  if (shift === "guardia" || /24\s*h/i.test(time)) {
    return [`${titulo}: guardia las 24 h.`];
  }
  const turno = etiquetaTurno(shift).toLowerCase();
  const rango = textoRangoLibre(time);
  let detalle = "";
  if (turno && rango) detalle = `${turno} ${rango}`;
  else if (turno) detalle = turno;
  else if (rango) detalle = rango;
  if (!detalle) return [];
  return [`${titulo}: ${detalle}.`];
}

export function lineasHorarioAtencion(input: {
  scheduleNote?: string | null;
  days?: string;
  time?: string;
  shift?: string;
}): string[] {
  const note = input.scheduleNote?.trim() ?? "";
  const desdeNota = lineasHorarioLugar(note);
  if (desdeNota.length) return desdeNota;
  return lineasHorarioLegacy(input.days ?? "", input.time ?? "", input.shift ?? "");
}

/** Varias franjas en un solo párrafo (cada franja ya termina en punto). */
export function textoHorarioUnido(lineas: string[]) {
  return lineas.join(" ");
}

export function detalleHorarioPublico(days: string, time: string, shift = "") {
  return textoHorarioUnido(lineasHorarioLegacy(days, time, shift));
}