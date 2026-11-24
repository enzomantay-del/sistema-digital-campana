import type { BorradorProfesional, HorarioBorrador } from "@/lib/draft";
import {
  franjaConDatos,
  horarioLugarConDatos,
  horarioLugarParaGuardar,
  periodicidadDefecto,
  validarHorarioLugar,
} from "@/lib/placeSchedule";

function obrasDelHorario(horario: BorradorProfesional["horarios"][number]) {
  return [...(horario.obras ?? []), horario.otraObra?.trim() ?? ""].filter(Boolean);
}

export function validarBorradorProfesional(
  borrador: BorradorProfesional,
  opts: { exigeHorario: boolean; tieneFoto: boolean },
): string | null {
  if (borrador.fullName.trim().length < 2) return "Escribí el nombre completo del profesional.";
  if (borrador.license.trim().length < 3) return "Indicá la matrícula profesional.";
  const especialidades = [...(borrador.specialties ?? []), borrador.specialty.trim()].filter(Boolean);
  if (especialidades.length === 0) return "Elegí al menos una especialidad.";
  if (!opts.tieneFoto) return "Subí la foto del profesional.";
  if (opts.exigeHorario) {
    const conLugar = borrador.horarios.filter((h) => h.placeId);
    if (conLugar.length === 0) return "Agregá al menos una sede y elegí el centro en el desplegable.";
    const errorHorario = validarHorariosEnBorrador(conLugar);
    if (errorHorario) return errorHorario;
    for (const horario of conLugar) {
      const obras = obrasDelHorario(horario);
      if (obras.length === 0) {
        return `En ${horario.placeName || "esta sede"}, marcá las obras que atendés o «Solo particular».`;
      }
    }
  }
  return null;
}

/** Mensajes claros antes de guardar (panel profesional / secretaría). */
export function validarHorariosEnBorrador(horarios: HorarioBorrador[]): string | null {
  for (const horario of horarios) {
    const sede = horario.placeName?.trim() || "esta sede";
  if (!horario.placeId) continue;

    const paraGuardar = horarioLugarParaGuardar(horario.schedule);
    if (!horarioLugarConDatos(paraGuardar)) {
      return `En ${sede}, completá el horario: elegí días, turnos u otro patrón (franja con datos).`;
    }

    const errorEstructura = validarHorarioLugar(paraGuardar);
    if (errorEstructura) return `${sede}: ${errorEstructura}`;

    for (const franja of horario.schedule.franjas) {
      if (!franjaConDatos(franja)) continue;
      const p = franja.periodicidad ?? periodicidadDefecto();
      if (p.tipo === "semanal" && !franja.cerrado && franja.dias.length === 0) {
        return `En ${sede}, marcá al menos un día de la semana (lun–dom) en el horario.`;
      }
      if (p.tipo === "semanal" && !franja.cerrado && !franja.guardia24) {
        const tieneTurno = [franja.manana, franja.tarde, franja.noche].some((t) => t.activo);
        if (!tieneTurno) {
          return `En ${sede}, activá mañana, tarde o noche (o guardia 24 h) en el horario.`;
        }
        const turnoSinHora = [franja.manana, franja.tarde, franja.noche].find(
          (t) => t.activo && !t.desde.trim() && !t.hasta.trim(),
        );
        if (turnoSinHora) {
          return `En ${sede}, completá desde y hasta en el turno que activaste, o desactivá ese turno.`;
        }
      }
      if (p.tipo === "fechas") {
        const fechasValidas = p.fechas.filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f));
        if (fechasValidas.length === 0) {
          return `En ${sede}, cargá al menos una fecha concreta en el calendario.`;
        }
      }
      if (p.tipo === "nota" && !p.texto.trim() && !franja.cerrado && !franja.guardia24) {
        const tieneTurno = [franja.manana, franja.tarde, franja.noche].some((t) => t.activo);
        if (!tieneTurno) {
          return `En ${sede}, escribí en «horario especial» cómo atendés, o usá días y turnos.`;
        }
      }
    }
  }
  return null;
}

export function validarAntesDeGuardar(
  borrador: BorradorProfesional,
  opts: { exigeHorario: boolean; tieneFoto: boolean },
): string | null {
  return validarBorradorProfesional(borrador, opts);
}