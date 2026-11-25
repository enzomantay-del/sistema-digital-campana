import type { HorarioBorrador } from "@/lib/draft";
import { DIAS } from "@/lib/constants";
import {
  franjaConDatos,
  horarioLugarParaGuardar,
  normalizarHora,
  periodicidadDefecto,
  TURNOS_HORARIO_LUGAR,
  type FranjaHorarioLugar,
  type HorarioLugarData,
} from "@/lib/placeSchedule";

type IntervaloTiempo = {
  inicioMin: number;
  finMin: number;
  guardia24: boolean;
};

type Ocurrencia =
  | { modo: "semanal"; dia: string; tiempo: IntervaloTiempo }
  | { modo: "fecha"; fecha: string; dia: string; tiempo: IntervaloTiempo };

const ORDEN_DIAS_JS = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"] as const;

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

/** Día lun–dom para una fecha YYYY-MM-DD (mediodía UTC, coherente con el calendario del formulario). */
export function diaSemanaDesdeIso(iso: string): string | null {
  const match = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const fecha = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const js = fecha.getUTCDay();
  return ORDEN_DIAS_JS[js] ?? null;
}

function fechaCortaDesdeIso(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const [, y, m, d] = match;
  return `${Number(d)}/${Number(m)}/${y}`;
}

function tiemposDeFranja(franja: FranjaHorarioLugar): IntervaloTiempo[] {
  const out: IntervaloTiempo[] = [];
  if (franja.guardia24) {
    out.push({ inicioMin: 0, finMin: 24 * 60, guardia24: true });
    return out;
  }
  for (const turno of TURNOS_HORARIO_LUGAR) {
    const slot = franja[turno.id];
    if (!slot.activo) continue;
    const inicio = minutosDesdeHora(slot.desde);
    const fin = minutosDesdeHora(slot.hasta);
    if (inicio === null || fin === null || fin <= inicio) continue;
    out.push({ inicioMin: inicio, finMin: fin, guardia24: false });
  }
  return out;
}

function ocurrenciasDeFranja(franja: FranjaHorarioLugar): Ocurrencia[] {
  if (!franjaConDatos(franja) || franja.cerrado) return [];
  const tiempos = tiemposDeFranja(franja);
  if (tiempos.length === 0) return [];

  const p = franja.periodicidad ?? periodicidadDefecto();
  const out: Ocurrencia[] = [];

  if (p.tipo === "semanal" || p.tipo === undefined) {
    for (const dia of franja.dias) {
      for (const tiempo of tiempos) out.push({ modo: "semanal", dia, tiempo });
    }
    return out;
  }

  if (p.tipo === "fechas") {
    for (const raw of p.fechas) {
      const fecha = raw.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) continue;
      const dia = diaSemanaDesdeIso(fecha);
      if (!dia) continue;
      for (const tiempo of tiempos) out.push({ modo: "fecha", fecha, dia, tiempo });
    }
    return out;
  }

  if (p.tipo === "mensual_semana" && p.dia) {
    for (const tiempo of tiempos) out.push({ modo: "semanal", dia: p.dia, tiempo });
    return out;
  }

  return out;
}

function ocurrenciasDeHorario(data: HorarioLugarData): Ocurrencia[] {
  return data.franjas.flatMap(ocurrenciasDeFranja);
}

function tiemposSeSolapan(a: IntervaloTiempo, b: IntervaloTiempo) {
  if (a.guardia24 || b.guardia24) return true;
  return a.inicioMin < b.finMin && b.inicioMin < a.finMin;
}

function ocurrenciasSeSolapan(a: Ocurrencia, b: Ocurrencia) {
  if (!tiemposSeSolapan(a.tiempo, b.tiempo)) return false;
  if (a.modo === "semanal" && b.modo === "semanal") return a.dia === b.dia;
  if (a.modo === "fecha" && b.modo === "fecha") return a.fecha === b.fecha;
  if (a.modo === "semanal" && b.modo === "fecha") return a.dia === b.dia;
  if (a.modo === "fecha" && b.modo === "semanal") return a.dia === b.dia;
  return false;
}

function etiquetaDia(id: string) {
  return DIAS.find((dia) => dia.id === id)?.label.toLowerCase() ?? id;
}

function textoRango(tiempo: IntervaloTiempo) {
  if (tiempo.guardia24) return "guardia 24 h";
  return `${formatoMinutos(tiempo.inicioMin)} a ${formatoMinutos(tiempo.finMin)}`;
}

function describeOcurrencia(o: Ocurrencia) {
  const horario = textoRango(o.tiempo);
  if (o.modo === "fecha") return `${etiquetaDia(o.dia)} ${fechaCortaDesdeIso(o.fecha)} (${horario})`;
  return `${etiquetaDia(o.dia)} cada semana (${horario})`;
}

/** Aviso si el mismo día y franja horaria se repite en dos sedes (semanal, fechas puntuales o ambos). */
export function mensajeSolapamientoEntreSedes(horarios: HorarioBorrador[]): string | null {
  const sedes = horarios
    .filter((h) => h.placeId)
    .map((h) => ({
      nombre: h.placeName?.trim() || "una sede",
      ocurrencias: ocurrenciasDeHorario(horarioLugarParaGuardar(h.schedule)),
    }))
    .filter((s) => s.ocurrencias.length > 0);

  if (sedes.length < 2) return null;

  for (let i = 0; i < sedes.length; i++) {
    for (let j = i + 1; j < sedes.length; j++) {
      for (const oa of sedes[i].ocurrencias) {
        for (const ob of sedes[j].ocurrencias) {
          if (!ocurrenciasSeSolapan(oa, ob)) continue;
          return (
            `Superposición de horarios: coinciden «${sedes[i].nombre}» (${describeOcurrencia(oa)}) y ` +
            `«${sedes[j].nombre}» (${describeOcurrencia(ob)}). No podés atender en dos lugares a la vez. Ajustá días, fechas u horarios en una de las sedes.`
          );
        }
      }
    }
  }
  return null;
}