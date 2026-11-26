export type FilaHorario = {
  id: string;
  placeId: string;
  placeName: string;
  locality: string;
  professionalDays: string;
  professionalTime: string;
  professionalShift: string;
  professionalScheduleNote?: string;
  professionalUpdatedAt: Date | null;
  placeDays: string;
  placeTime: string;
  placeShift: string;
  placeUpdatedAt: Date | null;
  placeWhatsapp?: string;
  placePhone?: string;
  obrasEnLugar?: string[];
};

export type LineaHorario = {
  id: string;
  placeId: string;
  placeName: string;
  locality: string;
  shift: string;
  days: string;
  time: string;
  horarioLineas: string[];
  updatedAt: Date | null;
  source: "profesional" | "lugar";
  conflict: null | {
    shift: string;
    days: string;
    time: string;
    updatedAt: Date | null;
  };
  placeWhatsapp?: string;
  placePhone?: string;
  obrasLugar?: string[];
};

import { lineasHorarioAtencion, lineasHorarioLegacy } from "./horarioTexto";

function tieneDatos(days: string, time: string, shift: string) {
  return Boolean(days.trim() || time.trim() || shift.trim());
}

function masReciente(a: Date | null, b: Date | null) {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function datosPublicosFila(fila: FilaHorario) {
  return {
    placeWhatsapp: fila.placeWhatsapp ?? "",
    placePhone: fila.placePhone ?? "",
    obrasLugar: fila.obrasEnLugar ?? [],
  };
}

export function lineaHorario(fila: FilaHorario): LineaHorario | null {
  const horarioPro = lineasHorarioAtencion({
    scheduleNote: fila.professionalScheduleNote,
    days: fila.professionalDays,
    time: fila.professionalTime,
    shift: fila.professionalShift,
  });
  const profesional = horarioPro.length > 0 || tieneDatos(fila.professionalDays, fila.professionalTime, fila.professionalShift);
  const lugar = tieneDatos(fila.placeDays, fila.placeTime, fila.placeShift);
  if (!profesional && !lugar) return null;

  const iguales =
    profesional &&
    lugar &&
    fila.professionalDays === fila.placeDays &&
    fila.professionalTime === fila.placeTime &&
    fila.professionalShift === fila.placeShift;

  if (!lugar || iguales) {
    const lugarMasNuevo =
      iguales &&
      fila.placeUpdatedAt &&
      (!fila.professionalUpdatedAt || fila.placeUpdatedAt > fila.professionalUpdatedAt);
    return {
      id: fila.id,
      placeId: fila.placeId,
      placeName: fila.placeName,
      locality: fila.locality,
      shift: fila.professionalShift || fila.placeShift,
      days: fila.professionalDays || fila.placeDays,
      time: fila.professionalTime || fila.placeTime,
      horarioLineas: horarioPro.length > 0 && (profesional || iguales) ? horarioPro : [],
      updatedAt: iguales
        ? masReciente(fila.professionalUpdatedAt, fila.placeUpdatedAt)
        : fila.professionalUpdatedAt,
      source: lugarMasNuevo ? "lugar" : profesional ? "profesional" : "lugar",
      conflict: null,
      ...datosPublicosFila(fila),
    };
  }

  if (!profesional) {
    const horarioLugar = lineasHorarioLegacy(fila.placeDays, fila.placeTime, fila.placeShift);
    return {
      id: fila.id,
      placeId: fila.placeId,
      placeName: fila.placeName,
      locality: fila.locality,
      shift: fila.placeShift,
      days: fila.placeDays,
      time: fila.placeTime,
      horarioLineas: horarioLugar,
      updatedAt: fila.placeUpdatedAt,
      source: "lugar",
      conflict: null,
      ...datosPublicosFila(fila),
    };
  }

  return {
    id: fila.id,
    placeId: fila.placeId,
    placeName: fila.placeName,
    locality: fila.locality,
    shift: fila.professionalShift,
    days: fila.professionalDays,
    time: fila.professionalTime,
    horarioLineas: horarioPro,
    updatedAt: fila.professionalUpdatedAt,
    source: "profesional",
    conflict: {
      shift: fila.placeShift,
      days: fila.placeDays,
      time: fila.placeTime,
      updatedAt: fila.placeUpdatedAt,
    },
    ...datosPublicosFila(fila),
  };
}

export function ordenarTurnos<T extends { shift: string }>(lineas: T[]) {
  const orden = ["manana", "tarde", "guardia"];
  return [...lineas].sort((a, b) => orden.indexOf(a.shift) - orden.indexOf(b.shift));
}
