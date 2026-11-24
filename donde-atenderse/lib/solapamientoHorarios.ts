import type { HorarioBorrador } from "@/lib/draft";
import { DIAS } from "@/lib/constants";
import {
  franjaConDatos,
  horarioLugarParaGuardar,
  normalizarHora,
  periodicidadDefecto,
  TURNOS_HORARIO_LUGAR,
  type HorarioLugarData,
} from "@/lib/placeSchedule";

type IntervaloSemanal = {
  dia: string;
  inicioMin: number;
  finMin: number;
  guardia24: boolean;
};

function minutosDesdeHora(valor: string): number | null {
  const normal = normalizarHora(valor);
  const partes = normal.match(/^(\d{2}):(\d{2})$/);
  if (!partes) return null;
  const h = Number(partes[1]);
  const m = Number(partes[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function formatoMinutos(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function intervalosSemanales(data: HorarioLugarData): IntervaloSemanal[] {
  const out: IntervaloSemanal[] = [];
  for (const franja of data.franjas) {
    if (!franjaConDatos(franja) || franja.cerrado) continue;
    const p = franja.periodicidad ?? periodicidadDefecto();
    if (p.tipo !== "semanal") continue;
    for (const dia of franja.dias) {
      if (franja.guardia24) {
        out.push({ dia, inicioMin: 0, finMin: 24 * 60, guardia24: true });
        continue;
      }
      for (const turno of TURNOS_HORARIO_LUGAR) {
        const slot = franja[turno.id];
        if (!slot.activo) continue;
        const inicio = minutosDesdeHora(slot.desde);
        const fin = minutosDesdeHora(slot.hasta);
        if (inicio === null || fin === null || fin <= inicio) continue;
        out.push({ dia, inicioMin: inicio, finMin: fin, guardia24: false });
      }
    }
  }
  return out;
}

function seSolapan(a: IntervaloSemanal, b: IntervaloSemanal) {
  if (a.dia !== b.dia) return false;
  if (a.guardia24 || b.guardia24) return true;
  return a.inicioMin < b.finMin && b.inicioMin < a.finMin;
}

function etiquetaDia(id: string) {
  return DIAS.find((dia) => dia.id === id)?.label.toLowerCase() ?? id;
}

function textoRango(intervalo: IntervaloSemanal) {
  if (intervalo.guardia24) return "guardia 24 h";
  return `${formatoMinutos(intervalo.inicioMin)} a ${formatoMinutos(intervalo.finMin)}`;
}

/** Aviso si el mismo día y franja horaria se repite en dos sedes (solo patrón semanal). */
export function mensajeSolapamientoEntreSedes(horarios: HorarioBorrador[]): string | null {
  const sedes = horarios
    .filter((h) => h.placeId)
    .map((h) => ({
      nombre: h.placeName?.trim() || "una sede",
      intervalos: intervalosSemanales(horarioLugarParaGuardar(h.schedule)),
    }))
    .filter((s) => s.intervalos.length > 0);

  if (sedes.length < 2) return null;

  for (let i = 0; i < sedes.length; i++) {
    for (let j = i + 1; j < sedes.length; j++) {
      for (const ia of sedes[i].intervalos) {
        for (const ib of sedes[j].intervalos) {
          if (!seSolapan(ia, ib)) continue;
          const dia = etiquetaDia(ia.dia);
          return (
            `Superposición de horarios: el ${dia} coinciden «${sedes[i].nombre}» (${textoRango(ia)}) y ` +
            `«${sedes[j].nombre}» (${textoRango(ib)}). No podés atender en dos lugares a la vez. Ajustá días u horarios en una de las sedes.`
          );
        }
      }
    }
  }
  return null;
}