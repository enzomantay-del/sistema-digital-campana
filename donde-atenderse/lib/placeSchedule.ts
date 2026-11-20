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

/** Una franja = un horario que aplica a los días que elijas (cualquier combinación). */
export type FranjaHorarioLugar = GrupoHorarioLugar & {
  key: string;
  dias: string[];
  cerrado: boolean;
};

export type HorarioLugarDataV1 = {
  v: 1;
  semana: GrupoHorarioLugar;
  finde: GrupoHorarioLugar;
};

export type HorarioLugarData = {
  v: 2;
  franjas: FranjaHorarioLugar[];
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

export function franjaHorarioVacia(dias: string[] = ["lun", "mar", "mie", "jue", "vie"]): FranjaHorarioLugar {
  return {
    key: claveFranja(),
    dias,
    cerrado: false,
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

function textoFranja(franja: FranjaHorarioLugar) {
  if (franja.dias.length === 0) return "";
  const titulo = textoDias(ordenarDias(franja.dias));
  if (!titulo) return "";
  if (franja.cerrado) return `${titulo}: cerrado.`;
  const detalle = textoTurnos(franja);
  if (!detalle) return "";
  return `${titulo}: ${detalle}.`;
}

export function lineasHorarioLugar(note: string): string[] {
  const datos = parsearScheduleNote(note);
  if (!datos) return note.trim() ? [note.trim()] : [];
  return datos.franjas.map(textoFranja).filter(Boolean);
}

export function textoHorarioLugarPublico(note: string) {
  return lineasHorarioLugar(note).join(" ");
}

export function diasEnConflicto(data: HorarioLugarData) {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const franja of data.franjas) {
    for (const dia of franja.dias) {
      if (vistos.has(dia)) repetidos.add(dia);
      else vistos.add(dia);
    }
  }
  return ordenarDias([...repetidos]);
}

export function diasSinFranja(data: HorarioLugarData) {
  const cubiertos = new Set(data.franjas.flatMap((franja) => franja.dias));
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

function franjaConDatos(franja: FranjaHorarioLugar) {
  if (franja.dias.length === 0) return false;
  return franja.cerrado || grupoConDatos(franja);
}

export function horarioLugarConDatos(data: HorarioLugarData) {
  return data.franjas.some(franjaConDatos);
}

export function validarHorarioLugar(data: HorarioLugarData): string | null {
  const conflictos = diasEnConflicto(data);
  if (conflictos.length) {
    return `Cada día debe estar en una sola franja. Revisá: ${etiquetasDias(conflictos)}.`;
  }
  return null;
}

export function horarioLugarParaGuardar(data: HorarioLugarData): HorarioLugarData {
  return {
    v: 2,
    franjas: data.franjas.filter((franja) => franja.dias.length > 0 && (franja.cerrado || grupoConDatos(franja))),
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

function limpiarFranja(franja: FranjaHorarioLugar): FranjaHorarioLugar {
  const grupo = limpiarGrupo(franja);
  return {
    ...grupo,
    key: franja.key || claveFranja(),
    dias: ordenarDias(franja.dias),
    cerrado: franja.cerrado,
  };
}

function sanitizarHorarioLugar(data: HorarioLugarData): HorarioLugarData {
  return {
    v: 2,
    franjas: data.franjas.map(limpiarFranja).filter((franja) => franja.dias.length > 0 || franjaConDatos(franja)),
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

function esFranja(valor: unknown): valor is FranjaHorarioLugar {
  if (!valor || typeof valor !== "object") return false;
  const franja = valor as FranjaHorarioLugar;
  return (
    typeof franja.key === "string" &&
    Array.isArray(franja.dias) &&
    typeof franja.cerrado === "boolean" &&
    esGrupo(franja)
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