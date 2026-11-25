import type { BorradorProfesional, HorarioBorrador } from "@/lib/draft";
import {
  franjaConDatos,
  horarioLugarConDatos,
  horarioLugarParaGuardar,
  periodicidadDefecto,
  validarHorarioLugar,
} from "@/lib/placeSchedule";
import { mensajeSolapamientoEntreSedes } from "@/lib/solapamientoHorarios";

export type ErroresPorHorario = {
  lugar?: string;
  horario?: string;
  obras?: string;
};

export type ErroresCamposFicha = {
  fullName?: string;
  license?: string;
  specialties?: string;
  photo?: string;
  sedes?: string;
  solapamiento?: string;
  porHorario: Record<string, ErroresPorHorario>;
};

function obrasDelHorario(horario: HorarioBorrador) {
  return [...(horario.obras ?? []), horario.otraObra?.trim() ?? ""].filter(Boolean);
}

/** Primer error de horario en una sede (mensaje corto, sin repetir el nombre del centro). */
export function errorHorarioEnSede(horario: HorarioBorrador): string | null {
  if (!horario.placeId) return null;

  const paraGuardar = horarioLugarParaGuardar(horario.schedule);
  if (!horarioLugarConDatos(paraGuardar)) {
    return "Completá el horario: elegí días, turnos u otro patrón (al menos una franja con datos).";
  }

  const errorEstructura = validarHorarioLugar(paraGuardar);
  if (errorEstructura) return errorEstructura;

  for (const franja of horario.schedule.franjas) {
    if (!franjaConDatos(franja)) continue;
    const p = franja.periodicidad ?? periodicidadDefecto();
    if (p.tipo === "semanal" && !franja.cerrado && franja.dias.length === 0) {
      return "Marcá al menos un día de la semana (lun–dom) en el horario.";
    }
    if (p.tipo === "semanal" && !franja.cerrado && !franja.guardia24) {
      const tieneTurno = [franja.manana, franja.tarde, franja.noche].some((t) => t.activo);
      if (!tieneTurno) return "Activá mañana, tarde o noche (o marcá guardia 24 h).";
      const turnoSinHora = [franja.manana, franja.tarde, franja.noche].find(
        (t) => t.activo && !t.desde.trim() && !t.hasta.trim(),
      );
      if (turnoSinHora) return "Completá desde y hasta en el turno que activaste, o desactivá ese turno.";
    }
    if (p.tipo === "fechas") {
      const fechasValidas = p.fechas.filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f));
      if (fechasValidas.length === 0) return "Cargá al menos una fecha concreta en el calendario.";
    }
    if (p.tipo === "nota" && !p.texto.trim() && !franja.cerrado && !franja.guardia24) {
      const tieneTurno = [franja.manana, franja.tarde, franja.noche].some((t) => t.activo);
      if (!tieneTurno) return "Escribí en «horario especial» cómo atendés, o usá días y turnos.";
    }
  }
  return null;
}

export function erroresCamposFichaProfesional(
  borrador: BorradorProfesional,
  opts: { exigeHorario: boolean; tieneFoto: boolean },
): ErroresCamposFicha {
  const porHorario: Record<string, ErroresPorHorario> = {};
  const errores: ErroresCamposFicha = { porHorario };

  if (borrador.fullName.trim().length < 2) {
    errores.fullName = "Escribí el nombre completo del profesional.";
  }
  if (borrador.license.trim().length < 3) {
    errores.license = "Indicá la matrícula profesional.";
  }
  const especialidades = [...(borrador.specialties ?? []), borrador.specialty.trim()].filter(Boolean);
  if (especialidades.length === 0) {
    errores.specialties = "Elegí al menos una especialidad.";
  }
  if (!opts.tieneFoto) {
    errores.photo = "Subí la foto del profesional.";
  }

  if (!opts.exigeHorario) return errores;

  const filasVisibles = borrador.horarios.filter((h) => h.placeName.trim() || h.placeId || borrador.horarios.length <= 1);

  for (const horario of filasVisibles) {
    if (!horario.placeId) {
      porHorario[horario.key] = {
        ...porHorario[horario.key],
        lugar: "Elegí el centro en el desplegable (hospital, consultorio, etc.).",
      };
    }
  }

  const conLugar = borrador.horarios.filter((h) => h.placeId);
  if (conLugar.length === 0) {
    errores.sedes = "Agregá al menos una sede y elegí el centro en el desplegable.";
  }

  for (const horario of conLugar) {
    const errHorario = errorHorarioEnSede(horario);
    if (errHorario) {
      porHorario[horario.key] = { ...porHorario[horario.key], horario: errHorario };
    }
    if (obrasDelHorario(horario).length === 0) {
      porHorario[horario.key] = {
        ...porHorario[horario.key],
        obras: "Marcá las obras sociales que atendés acá o «Solo particular».",
      };
    }
  }

  const solapamiento = mensajeSolapamientoEntreSedes(conLugar);
  if (solapamiento) errores.solapamiento = solapamiento;

  return errores;
}

export function fichaTieneErrores(errores: ErroresCamposFicha) {
  if (errores.fullName || errores.license || errores.specialties || errores.photo || errores.sedes || errores.solapamiento) {
    return true;
  }
  return Object.values(errores.porHorario).some((h) => h.lugar || h.horario || h.obras);
}

/** Mismo criterio que el guardado; mensaje largo para la barra de guardar. */
export function primerMensajeGuardado(errores: ErroresCamposFicha): string | null {
  if (errores.fullName) return errores.fullName;
  if (errores.license) return errores.license;
  if (errores.specialties) return errores.specialties;
  if (errores.photo) return errores.photo;
  if (errores.sedes) return errores.sedes;

  for (const horario of Object.values(errores.porHorario)) {
    if (horario.lugar) return horario.lugar;
  }

  for (const horario of Object.values(errores.porHorario)) {
    if (horario.horario) return horario.horario;
  }

  if (errores.solapamiento) return errores.solapamiento;

  for (const horario of Object.values(errores.porHorario)) {
    if (horario.obras) return horario.obras;
  }
  return null;
}

/** Primer ancla para hacer scroll al guardar con errores. */
export function idPrimerCampoConError(errores: ErroresCamposFicha): string | null {
  if (errores.fullName) return "campo-error-nombre";
  if (errores.license) return "campo-error-matricula";
  if (errores.specialties) return "campo-error-especialidades";
  if (errores.photo) return "campo-error-foto";
  if (errores.sedes) return "campo-error-sedes";
  for (const [key, h] of Object.entries(errores.porHorario)) {
    if (h.lugar) return `campo-error-lugar-${key}`;
    if (h.horario) return `campo-error-horario-${key}`;
  }
  if (errores.solapamiento) return "campo-error-solapamiento";
  for (const [key, h] of Object.entries(errores.porHorario)) {
    if (h.obras) return `campo-error-obras-${key}`;
  }
  return null;
}