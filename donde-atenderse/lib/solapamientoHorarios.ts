import type { HorarioBorrador } from "@/lib/draft";
import {
  etiquetaPeriodicidadFranja,
  franjaConDatos,
  horarioLugarParaGuardar,
  normalizarHora,
  periodicidadDefecto,
  TURNOS_HORARIO_LUGAR,
  type FranjaHorarioLugar,
  type OrdinalMensual,
  type PeriodicidadFranja,
} from "@/lib/placeSchedule";

type IntervaloTiempo = {
  inicioMin: number;
  finMin: number;
  guardia24: boolean;
};

type InstanciaHorario = {
  franja: FranjaHorarioLugar;
  tiempo: IntervaloTiempo;
};

type FechaYmd = { y: number; m: number; d: number };

const ORDEN_DIAS_JS = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"] as const;
const MESES_SIMULACION = 30;
const EPOCH_SEMANAL = Date.UTC(1970, 0, 5);

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

function isoDe(f: FechaYmd) {
  return `${f.y}-${String(f.m).padStart(2, "0")}-${String(f.d).padStart(2, "0")}`;
}

function fechaCortaDesdeIso(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const [, y, m, d] = match;
  return `${Number(d)}/${Number(m)}/${y}`;
}

/** Día lun–dom para una fecha YYYY-MM-DD (mediodía UTC). */
export function diaSemanaDesdeIso(iso: string): string | null {
  const match = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const fecha = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return ORDEN_DIAS_JS[fecha.getUTCDay()] ?? null;
}

function idDiaSemana(f: FechaYmd) {
  return diaSemanaDesdeIso(isoDe(f));
}

function diasEnMes(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function semanasDesdeEpoch(f: FechaYmd) {
  const ms = Date.UTC(f.y, f.m - 1, f.d);
  return Math.floor((ms - EPOCH_SEMANAL) / (7 * 86_400_000));
}

function nroOcurrenciaDiaEnMes(f: FechaYmd) {
  const dia = idDiaSemana(f);
  if (!dia) return 0;
  let n = 0;
  for (let d = 1; d <= f.d; d++) {
    if (idDiaSemana({ y: f.y, m: f.m, d }) === dia) n += 1;
  }
  return n;
}

function esUltimoDiaSemanaEnMes(f: FechaYmd) {
  const dia = idDiaSemana(f);
  if (!dia) return false;
  const finMes = diasEnMes(f.y, f.m);
  for (let d = f.d + 1; d <= finMes; d++) {
    if (idDiaSemana({ y: f.y, m: f.m, d }) === dia) return false;
  }
  return true;
}

function coincideMensualSemana(f: FechaYmd, ordinal: OrdinalMensual, diaId: string) {
  if (idDiaSemana(f) !== diaId) return false;
  if (ordinal === "ultimo") return esUltimoDiaSemanaEnMes(f);
  const objetivo = { primero: 1, segundo: 2, tercero: 3, cuarto: 4 }[ordinal];
  return nroOcurrenciaDiaEnMes(f) === objetivo;
}

function franjaAplicaEnFecha(franja: FranjaHorarioLugar, f: FechaYmd): boolean {
  if (!franjaConDatos(franja) || franja.cerrado) return false;
  const p: PeriodicidadFranja = franja.periodicidad ?? periodicidadDefecto();

  if (p.tipo === "fechas") {
    return p.fechas.some((item) => item.trim() === isoDe(f));
  }

  if (p.tipo === "mensual_dia") {
    if (p.diaDelMes < 1 || p.diaDelMes > 31) return false;
    if (p.diaDelMes > diasEnMes(f.y, f.m)) return false;
    return f.d === p.diaDelMes;
  }

  if (p.tipo === "mensual_semana") {
    if (!p.dia) return false;
    return coincideMensualSemana(f, p.ordinal, p.dia);
  }

  if (p.tipo === "nota") return false;

  if (p.tipo === "semanal") {
    const dia = idDiaSemana(f);
    if (!dia || !franja.dias.includes(dia)) return false;
    const cada = p.cadaSemanas && p.cadaSemanas > 1 ? p.cadaSemanas : 1;
    if (cada === 1) return true;
    return semanasDesdeEpoch(f) % cada === 0;
  }

  return false;
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

function instanciasEnFecha(franjas: FranjaHorarioLugar[], f: FechaYmd): InstanciaHorario[] {
  const out: InstanciaHorario[] = [];
  for (const franja of franjas) {
    if (!franjaAplicaEnFecha(franja, f)) continue;
    for (const tiempo of tiemposDeFranja(franja)) out.push({ franja, tiempo });
  }
  return out;
}

function tiemposSeSolapan(a: IntervaloTiempo, b: IntervaloTiempo) {
  if (a.guardia24 || b.guardia24) return true;
  return a.inicioMin < b.finMin && b.inicioMin < a.finMin;
}

function parsearIso(fecha: string): FechaYmd | null {
  const match = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

function inicioSimulacion(horarios: HorarioBorrador[]): FechaYmd {
  const hoy = new Date();
  let minMs = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
  for (const h of horarios) {
    const data = horarioLugarParaGuardar(h.schedule);
    for (const franja of data.franjas) {
      const p = franja.periodicidad;
      if (p?.tipo === "fechas") {
        for (const raw of p.fechas) {
          const f = parsearIso(raw.trim());
          if (f) minMs = Math.min(minMs, Date.UTC(f.y, f.m - 1, f.d));
        }
      }
    }
  }
  const inicio = new Date(minMs);
  return { y: inicio.getUTCFullYear(), m: inicio.getUTCMonth() + 1, d: inicio.getUTCDate() };
}

function finSimulacion(horarios: HorarioBorrador[], inicio: FechaYmd) {
  let finAbs = Date.UTC(inicio.y, inicio.m - 1 + MESES_SIMULACION, inicio.d);
  for (const h of horarios) {
    const data = horarioLugarParaGuardar(h.schedule);
    for (const franja of data.franjas) {
      const p = franja.periodicidad;
      if (p?.tipo !== "fechas") continue;
      for (const raw of p.fechas) {
        const f = parsearIso(raw.trim());
        if (f) finAbs = Math.max(finAbs, Date.UTC(f.y, f.m - 1, f.d));
      }
    }
  }
  return finAbs;
}

function fechasEnVentana(horarios: HorarioBorrador[]) {
  const inicio = inicioSimulacion(horarios);
  const lista: FechaYmd[] = [];
  let y = inicio.y;
  let m = inicio.m;
  let d = inicio.d;
  const finAbs = finSimulacion(horarios, inicio);

  while (true) {
    const actual = Date.UTC(y, m - 1, d);
    if (actual > finAbs) break;
    lista.push({ y, m, d });
    d += 1;
    const maxD = diasEnMes(y, m);
    if (d > maxD) {
      d = 1;
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
  }
  return lista;
}

function textoRango(tiempo: IntervaloTiempo) {
  if (tiempo.guardia24) return "guardia 24 h";
  return `${formatoMinutos(tiempo.inicioMin)} a ${formatoMinutos(tiempo.finMin)}`;
}

function describeInstancia(instancia: InstanciaHorario) {
  const etiqueta = etiquetaPeriodicidadFranja(instancia.franja);
  const horario = textoRango(instancia.tiempo);
  return etiqueta ? `${etiqueta} (${horario})` : horario;
}

function primerConflicto(
  franjasA: FranjaHorarioLugar[],
  franjasB: FranjaHorarioLugar[],
  ventana: FechaYmd[],
): { fecha: string; a: InstanciaHorario; b: InstanciaHorario } | null {
  for (const f of ventana) {
    const listaA = instanciasEnFecha(franjasA, f);
    if (listaA.length === 0) continue;
    const listaB = instanciasEnFecha(franjasB, f);
    if (listaB.length === 0) continue;
    for (const a of listaA) {
      for (const b of listaB) {
        if (tiemposSeSolapan(a.tiempo, b.tiempo)) {
          return { fecha: isoDe(f), a, b };
        }
      }
    }
  }
  return null;
}

/** Aviso si en el mismo día calendario hay franjas que se pisan entre dos sedes (todos los tipos de periodicidad). */
export function mensajeSolapamientoEntreSedes(horarios: HorarioBorrador[]): string | null {
  const sedes = horarios
    .filter((h) => h.placeId)
    .map((h) => ({
      nombre: h.placeName?.trim() || "una sede",
      franjas: horarioLugarParaGuardar(h.schedule).franjas,
    }))
    .filter((s) => s.franjas.some((f) => franjaConDatos(f) && !f.cerrado && tiemposDeFranja(f).length > 0));

  if (sedes.length < 2) return null;

  const ventana = fechasEnVentana(horarios);

  for (let i = 0; i < sedes.length; i++) {
    for (let j = i + 1; j < sedes.length; j++) {
      const choque = primerConflicto(sedes[i].franjas, sedes[j].franjas, ventana);
      if (!choque) continue;
      const dia = fechaCortaDesdeIso(choque.fecha);
      return (
        `Superposición de horarios el ${dia}: «${sedes[i].nombre}» (${describeInstancia(choque.a)}) y ` +
        `«${sedes[j].nombre}» (${describeInstancia(choque.b)}). No podés atender en dos lugares a la vez. Ajustá días, fechas u horarios en una de las sedes.`
      );
    }
  }
  return null;
}