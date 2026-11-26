import type { IdTurnoHorarioLugar } from "./placeSchedule";
import {
  TURNOS_HORARIO_LUGAR,
  esPeriodicidadSemanal,
  franjaConDatos,
  horarioLugarVacio,
  leerHorarioLugarDesdeNota,
  type HorarioLugarData,
} from "./placeSchedule";

function primerTurnoActivo(franja: HorarioLugarData["franjas"][number]): IdTurnoHorarioLugar {
  for (const turno of TURNOS_HORARIO_LUGAR) {
    if (franja[turno.id].activo) return turno.id;
  }
  return "manana";
}

export function leerHorarioProfesional(nota: string, days: string, time: string, shift: string) {
  const { data, legacy } = leerHorarioLugarDesdeNota(nota);
  if (data.franjas.some(franjaConDatos)) {
    return { schedule: data, legacy: legacy };
  }
  if (days.trim() || time.trim() || shift.trim()) {
    const franja = horarioLugarVacio().franjas[0];
    franja.dias = days.split(",").filter(Boolean);
    if (shift === "guardia") franja.guardia24 = true;
    else if (shift) {
      const id = shift as IdTurnoHorarioLugar;
      if (id === "manana" || id === "tarde" || id === "noche") {
        const [desde, hasta] = time.split(/\s+a\s+/i).map((p) => p.trim());
        franja[id] = { activo: true, desde: desde ?? "", hasta: hasta ?? time.trim() };
      }
    }
    return { schedule: { v: 2 as const, franjas: [franja] }, legacy: null };
  }
  return { schedule: horarioLugarVacio(), legacy: legacy };
}

export function camposLegacyDesdeHorario(data: HorarioLugarData) {
  const franja =
    data.franjas.find((item) => franjaConDatos(item) && esPeriodicidadSemanal(item.periodicidad)) ??
    data.franjas.find(franjaConDatos);
  if (!franja) return { days: "", time: "", shift: "manana" };
  if (franja.guardia24) {
    return { days: franja.dias.join(","), time: "24 h", shift: "guardia" };
  }
  const turno = primerTurnoActivo(franja);
  const datos = franja[turno];
  const time = [datos.desde, datos.hasta].filter(Boolean).join(" a ");
  return { days: franja.dias.join(","), time, shift: turno };
}