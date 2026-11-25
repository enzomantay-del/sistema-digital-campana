import { DIAS } from "./constants";
import { textoDias } from "./format";

export const SCHEDULE_MAGIC = "\x1ESCHED\x1E";

export type TurnoHorarioLugar = {
  activo: boolean;
  desde: string;
  hasta: string;
};

export type GrupoHorarioLugar = {
  manana: TurnoHorarioLugar;
  tarde: TurnoHorarioLugar;
  noche: TurnoHorarioLugar;
  guardia24: boolean;
};

export type OrdinalMensual = "primero" | "segundo" | "tercero" | "cuarto" | "ultimo";

/** Cuándo se repite la franja (además del horario del día). */
export type PeriodicidadFranja =
  | { tipo: "semanal"; cadaSemanas?: number }
  | { tipo: "mensual_dia"; diaDelMes: number }
  | { tipo: "mensual_semana"; ordinal: OrdinalMensual; dia: string }
  | { tipo: "fechas"; fechas: string[] }
  | { tipo: "nota"; texto: string };

export const ORDINALES_MENSUALES: { id: OrdinalMensual; label: string }[] = [
  { id: "primero", label: "Primer" },
  { id: "segundo", label: "Segundo" },
  { id: "tercero", label: "Tercer" },
  { id: "cuarto", label: "Cuarto" },
  { id: "ultimo", label: "Último" },
];

/** Una franja = un horario que aplica a los días que elijas (cualquier combinación). */
export type FranjaHorarioLugar = GrupoHorarioLugar & {
  key: string;
  dias: string[];
  cerrado: boolean;
  periodicidad?: PeriodicidadFranja;
};

export type HorarioLugarDataV1 = {
  v: 1;
  semana: GrupoHorarioLugar;
  finde: GrupoHorarioLugar;
};

export type HorarioLugarData = {
  v: 2;
  franjas: FranjaHorarioLugar[];
  /** Texto libre público (ej. “consultar agenda”, feriados). */
  complemento?: string;
};

export const TURNOS_HORARIO_LUGAR = [
  { id: "manana", label: "Mañana" },
  { id: "tarde", label: "Tarde" },
  { id: "noche", label: "Noche" },
] as const;

export type IdTurnoHorarioLugar = (typeof TURNOS_HORARIO_LUGAR)[number]["id"];

function turnoVacio(): TurnoHorarioLugar {
  return { activo: false, desde: "", hasta: "" };
}

export function grupoHorarioVacio(): GrupoHorarioLugar {
  return {
    manana: turnoVacio(),
    tarde: turnoVacio(),
    noche: turnoVacio(),
    guardia24: false,
  };
}

function claveFranja() {
  return `franja-${Math.random().toString(36).slice(2, 9)}`;
}

export function periodicidadDefecto(): PeriodicidadFranja {
  return { tipo: "semanal" };
}

export function esPeriodicidadSemanal(periodicidad: PeriodicidadFranja | undefined) {
  return !periodicidad || periodicidad.tipo === "semanal";
}

export function franjaHorarioVacia(dias: string[] = ["lun", "mar", "mie", "jue", "vie"]): FranjaHorarioLugar {
  return {
    key: claveFranja(),
    dias,
    cerrado: false,
    periodicidad: periodicidadDefecto(),
    ...grupoHorarioVacio(),
  };
}

export function horarioLugarVacio(): HorarioLugarData {
  return { v: 2, franjas: [franjaHorarioVacia([])] };
}

export function normalizarHora(valor: string): string {
  const limpio = valor.trim();
  if (!limpio) return "";
  const conDosPuntos = limpio.match(/^(\d{1,2}):(\d{2})$/);
  if (conDosPuntos) {
    const horas = Number(conDosPuntos[1]);
    const minutos = Number(conDosPuntos[2]);
    if (horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59) {
      return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
    }
  }
  const soloHora = limpio.match(/^(\d{1,2})$/);
  if (soloHora) {
    const horas = Number(soloHora[1]);
    if (horas >= 0 && horas <= 23) return `${String(horas).padStart(2, "0")}:00`;
  }
  return limpio;
}

function rangoTexto(desde: string, hasta: string) {
  const inicio = normalizarHora(desde);
  const fin = normalizarHora(hasta);
  if (inicio && fin) return `${inicio} a ${fin}`;
  if (inicio) return `desde ${inicio}`;
  if (fin) return `hasta ${fin}`;
  return "";
}

function textoTurnos(grupo: GrupoHorarioLugar) {
  const partes: string[] = [];
  if (grupo.guardia24) partes.push("guardia las 24 h");
  for (const turno of TURNOS_HORARIO_LUGAR) {
    const datos = grupo[turno.id];
    if (!datos.activo) continue;
    const rango = rangoTexto(datos.desde, datos.hasta);
    partes.push(rango ? `${turno.label.toLowerCase()} ${rango}` : turno.label.toLowerCase());
  }
  return partes.join(", ");
}

function ordenarDias(dias: string[]) {
  const orden = DIAS.map((dia) => dia.id);
  return orden.filter((id) => dias.includes(id));
}

function etiquetaDia(id: string) {
  return DIAS.find((dia) => dia.id === id)?.label.toLowerCase() ?? id;
}

function etiquetaOrdinal(ordinal: OrdinalMensual) {
  return ORDINALES_MENSUALES.find((item) => item.id === ordinal)?.label.toLowerCase() ?? ordinal;
}

function fechaCortaIso(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const [, y, m, d] = match;
  return `${Number(d)}/${Number(m)}/${y}`;
}

/** Texto de cuándo aplica la franja (público / avisos de solapamiento). */
export function etiquetaPeriodicidadFranja(franja: FranjaHorarioLugar) {
  return tituloPeriodicidad(franja);
}

function tituloPeriodicidad(franja: FranjaHorarioLugar) {
  const p = franja.periodicidad ?? periodicidadDefecto();
  if (p.tipo === "nota") return p.texto.trim();
  if (p.tipo === "fechas") {
    const fechas = p.fechas.map(fechaCortaIso).filter(Boolean);
    return fechas.length ? `Fechas: ${fechas.join(", ")}` : "";
  }
  if (p.tipo === "mensual_dia") {
    return p.diaDelMes >= 1 && p.diaDelMes <= 31 ? `Día ${p.diaDelMes} de cada mes` : "";
  }
  if (p.tipo === "mensual_semana") {
    if (!p.dia) return "";
    return `${etiquetaOrdinal(p.ordinal)} ${etiquetaDia(p.dia)} de cada mes`;
  }
  if (franja.dias.length === 0) return "";
  const titulo = textoDias(ordenarDias(franja.dias));
  if (!titulo) return "";
  const cada = p.cadaSemanas && p.cadaSemanas > 1 ? ` (cada ${p.cadaSemanas} semanas)` : "";
  return `${titulo}${cada}`;
}

function textoFranja(franja: FranjaHorarioLugar) {
  const titulo = tituloPeriodicidad(franja);
  if (!titulo) return "";
  if (franja.cerrado) return `${titulo}: cerrado.`;
  const detalle = textoTurnos(franja);
  const p = franja.periodicidad ?? periodicidadDefecto();
  if (p.tipo === "fechas" && !detalle) return `${titulo}.`;
  if (!detalle) return p.tipo === "nota" ? `${titulo}.` : "";
  return `${titulo}: ${detalle}.`;
}

export function lineasHorarioLugar(note: string): string[] {
  const datos = parsearScheduleNote(note);
  if (!datos) return note.trim() ? [note.trim()] : [];
  const lineas = datos.franjas.map(textoFranja).filter(Boolean);
  const complemento = datos.complemento?.trim();
  if (complemento) lineas.push(complemento);
  return lineas;
}

export type FranjaHorarioPublica = {
  diasLabel: string;
  cerrado: boolean;
  guardia24: boolean;
  turnos: { label: string; rango: string }[];
};

export function franjasHorarioLugarPublico(note: string): FranjaHorarioPublica[] {
  const datos = parsearScheduleNote(note);
  if (!datos) return [];
  return datos.franjas
    .map((franja) => {
      const diasLabel = tituloPeriodicidad(franja);
      if (!diasLabel) return null;
      const turnos: FranjaHorarioPublica["turnos"] = [];
      for (const turno of TURNOS_HORARIO_LUGAR) {
        const datosTurno = franja[turno.id];
        if (!datosTurno.activo) continue;
        const rango = rangoTexto(datosTurno.desde, datosTurno.hasta);
        turnos.push({ label: turno.label, rango });
      }
      return {
        diasLabel,
        cerrado: franja.cerrado,
        guardia24: franja.guardia24,
        turnos,
      };
    })
    .filter((franja): franja is FranjaHorarioPublica => Boolean(franja));
}

export function lugarTieneGuardia24h(note: string) {
  return franjasHorarioLugarPublico(note).some((franja) => franja.guardia24);
}

export function textoHorarioLugarPublico(note: string) {
  return lineasHorarioLugar(note).join(" ");
}

export function complementoHorarioLugar(note: string) {
  const datos = parsearScheduleNote(note);
  return datos?.complemento?.trim() ?? "";
}

export function diasEnConflicto(data: HorarioLugarData) {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const franja of data.franjas) {
    if (!esPeriodicidadSemanal(franja.periodicidad)) continue;
    for (const dia of franja.dias) {
      if (vistos.has(dia)) repetidos.add(dia);
      else vistos.add(dia);
    }
  }
  return ordenarDias([...repetidos]);
}

export function diasSinFranja(data: HorarioLugarData) {
  const semanales = data.franjas.filter((franja) => esPeriodicidadSemanal(franja.periodicidad));
  if (semanales.length === 0) return [];
  const cubiertos = new Set(semanales.flatMap((franja) => franja.dias));
  return DIAS.map((dia) => dia.id).filter((id) => !cubiertos.has(id));
}

export function etiquetasDias(ids: string[]) {
  return ordenarDias(ids)
    .map((id) => DIAS.find((dia) => dia.id === id)?.label ?? id)
    .join(", ");
}

function grupoConDatos(grupo: GrupoHorarioLugar) {
  if (grupo.guardia24) return true;
  return [grupo.manana, grupo.tarde, grupo.noche].some((turno) => turno.activo);
}

export function franjaConDatos(franja: FranjaHorarioLugar) {
  const p = franja.periodicidad ?? periodicidadDefecto();
  if (p.tipo === "nota") return p.texto.trim().length > 0 || franja.cerrado || grupoConDatos(franja);
  if (p.tipo === "fechas") return p.fechas.length > 0;
  if (p.tipo === "mensual_dia") return p.diaDelMes >= 1 && p.diaDelMes <= 31 && (franja.cerrado || grupoConDatos(franja));
  if (p.tipo === "mensual_semana") return Boolean(p.dia) && (franja.cerrado || grupoConDatos(franja));
  if (franja.dias.length === 0) return false;
  return franja.cerrado || grupoConDatos(franja);
}

export function horarioLugarConDatos(data: HorarioLugarData) {
  return data.franjas.some(franjaConDatos) || Boolean(data.complemento?.trim());
}

function fechasEnConflicto(data: HorarioLugarData) {
  const vistos = new Set<string>();
  const repetidas: string[] = [];
  for (const franja of data.franjas) {
    const p = franja.periodicidad;
    if (!p || p.tipo !== "fechas") continue;
    for (const fecha of p.fechas) {
      if (vistos.has(fecha)) repetidas.push(fecha);
      else vistos.add(fecha);
    }
  }
  return [...new Set(repetidas)];
}

export function validarHorarioLugar(data: HorarioLugarData): string | null {
  const conflictos = diasEnConflicto(data);
  if (conflictos.length) {
    return `Cada día debe estar en una sola franja semanal. Revisá: ${etiquetasDias(conflictos)}.`;
  }
  const fechasDup = fechasEnConflicto(data);
  if (fechasDup.length) {
    return `Cada fecha puntual debe aparecer una sola vez. Revisá: ${fechasDup.map(fechaCortaIso).join(", ")}.`;
  }
  for (const franja of data.franjas) {
    const p = franja.periodicidad;
    if (!p) continue;
    if (p.tipo === "mensual_dia" && (p.diaDelMes < 1 || p.diaDelMes > 31)) {
      return "El día del mes debe estar entre 1 y 31.";
    }
    if (p.tipo === "mensual_semana" && !p.dia) {
      return "Elegí el día de la semana para la franja mensual.";
    }
    if (p.tipo === "fechas") {
      const invalida = p.fechas.find((f) => !/^\d{4}-\d{2}-\d{2}$/.test(f));
      if (invalida) return `Fecha inválida: ${invalida}. Usá el formato año-mes-día.`;
    }
    if (
      p.tipo === "semanal" &&
      p.cadaSemanas != null &&
      p.cadaSemanas !== 1 &&
      (p.cadaSemanas < 2 || p.cadaSemanas > 4)
    ) {
      return "Si no es todas las semanas, elegí cada 2, 3 o 4 semanas.";
    }
  }
  return null;
}

export function horarioLugarParaGuardar(data: HorarioLugarData): HorarioLugarData {
  const complemento = data.complemento?.trim();
  return {
    v: 2,
    franjas: data.franjas.filter(franjaConDatos),
    ...(complemento ? { complemento } : {}),
  };
}

export function serializarHorarioLugar(data: HorarioLugarData) {
  return SCHEDULE_MAGIC + JSON.stringify(sanitizarHorarioLugar(data));
}

export function notaHorarioParaGuardar(data: HorarioLugarData, legacy: string | null) {
  if (horarioLugarConDatos(data)) return serializarHorarioLugar(data);
  return (legacy ?? "").trim();
}

function limpiarGrupo(grupo: GrupoHorarioLugar): GrupoHorarioLugar {
  const limpiarTurno = (turno: TurnoHorarioLugar): TurnoHorarioLugar => {
    if (!turno.activo) return { activo: false, desde: "", hasta: "" };
    return {
      activo: true,
      desde: normalizarHora(turno.desde),
      hasta: normalizarHora(turno.hasta),
    };
  };
  return {
    manana: limpiarTurno(grupo.manana),
    tarde: limpiarTurno(grupo.tarde),
    noche: limpiarTurno(grupo.noche),
    guardia24: grupo.guardia24,
  };
}

function limpiarPeriodicidad(periodicidad: PeriodicidadFranja | undefined): PeriodicidadFranja | undefined {
  if (!periodicidad) return periodicidadDefecto();
  if (periodicidad.tipo === "semanal") {
    const cada = periodicidad.cadaSemanas && periodicidad.cadaSemanas > 1 ? periodicidad.cadaSemanas : undefined;
    return { tipo: "semanal", ...(cada ? { cadaSemanas: Math.min(4, Math.max(2, cada)) } : {}) };
  }
  if (periodicidad.tipo === "mensual_dia") {
    return { tipo: "mensual_dia", diaDelMes: Math.min(31, Math.max(1, Math.round(periodicidad.diaDelMes))) };
  }
  if (periodicidad.tipo === "mensual_semana") {
    return {
      tipo: "mensual_semana",
      ordinal: periodicidad.ordinal,
      dia: periodicidad.dia,
    };
  }
  if (periodicidad.tipo === "fechas") {
  const fechas = [
      ...new Set(
        periodicidad.fechas
          .map((f) => f.trim())
          .filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f)),
      ),
    ].sort();
    return { tipo: "fechas", fechas };
  }
  if (periodicidad.tipo === "nota") {
    return { tipo: "nota", texto: periodicidad.texto.trim().slice(0, 400) };
  }
  return periodicidadDefecto();
}

function limpiarFranja(franja: FranjaHorarioLugar): FranjaHorarioLugar {
  const grupo = limpiarGrupo(franja);
  const periodicidad = limpiarPeriodicidad(franja.periodicidad);
  return {
    ...grupo,
    key: franja.key || claveFranja(),
    dias: esPeriodicidadSemanal(periodicidad) ? ordenarDias(franja.dias) : [],
    cerrado: franja.cerrado,
    periodicidad,
  };
}

function sanitizarHorarioLugar(data: HorarioLugarData): HorarioLugarData {
  const complemento = data.complemento?.trim().slice(0, 500);
  return {
    v: 2,
    franjas: data.franjas.map(limpiarFranja).filter((franja) => franjaConDatos(franja)),
    ...(complemento ? { complemento } : {}),
  };
}

function migrarV1(crudo: HorarioLugarDataV1): HorarioLugarData {
  const franjas: FranjaHorarioLugar[] = [];
  if (grupoConDatos(crudo.semana)) {
    franjas.push({ ...franjaHorarioVacia(["lun", "mar", "mie", "jue", "vie"]), ...limpiarGrupo(crudo.semana) });
  }
  if (grupoConDatos(crudo.finde)) {
    franjas.push({ ...franjaHorarioVacia(["sab", "dom"]), ...limpiarGrupo(crudo.finde) });
  }
  return franjas.length ? { v: 2, franjas } : horarioLugarVacio();
}

function esTurno(valor: unknown): valor is TurnoHorarioLugar {
  if (!valor || typeof valor !== "object") return false;
  const turno = valor as TurnoHorarioLugar;
  return typeof turno.activo === "boolean" && typeof turno.desde === "string" && typeof turno.hasta === "string";
}

function esGrupo(valor: unknown): valor is GrupoHorarioLugar {
  if (!valor || typeof valor !== "object") return false;
  const grupo = valor as GrupoHorarioLugar;
  return esTurno(grupo.manana) && esTurno(grupo.tarde) && esTurno(grupo.noche) && typeof grupo.guardia24 === "boolean";
}

function esPeriodicidad(valor: unknown): valor is PeriodicidadFranja {
  if (!valor || typeof valor !== "object") return false;
  const p = valor as PeriodicidadFranja;
  if (p.tipo === "semanal") return p.cadaSemanas === undefined || typeof p.cadaSemanas === "number";
  if (p.tipo === "mensual_dia") return typeof p.diaDelMes === "number";
  if (p.tipo === "mensual_semana") return typeof p.ordinal === "string" && typeof p.dia === "string";
  if (p.tipo === "fechas") return Array.isArray(p.fechas);
  if (p.tipo === "nota") return typeof p.texto === "string";
  return false;
}

function esFranja(valor: unknown): valor is FranjaHorarioLugar {
  if (!valor || typeof valor !== "object") return false;
  const franja = valor as FranjaHorarioLugar;
  return (
    typeof franja.key === "string" &&
    Array.isArray(franja.dias) &&
    typeof franja.cerrado === "boolean" &&
    esGrupo(franja) &&
    (franja.periodicidad === undefined || esPeriodicidad(franja.periodicidad))
  );
}

export function parsearScheduleNote(note: string): HorarioLugarData | null {
  if (!note.startsWith(SCHEDULE_MAGIC)) return null;
  try {
    const crudo = JSON.parse(note.slice(SCHEDULE_MAGIC.length)) as HorarioLugarData | HorarioLugarDataV1;
    if (crudo.v === 1 && esGrupo(crudo.semana) && esGrupo(crudo.finde)) {
      return sanitizarHorarioLugar(migrarV1(crudo));
    }
    if (crudo.v === 2 && Array.isArray((crudo as HorarioLugarData).franjas) && (crudo as HorarioLugarData).franjas.every(esFranja)) {
      return sanitizarHorarioLugar(crudo as HorarioLugarData);
    }
    return null;
  } catch {
    return null;
  }
}

export function leerHorarioLugarDesdeNota(note: string): { data: HorarioLugarData; legacy: string | null } {
  const datos = parsearScheduleNote(note);
  if (datos) return { data: datos, legacy: null };
  return { data: horarioLugarVacio(), legacy: note.trim() || null };
}