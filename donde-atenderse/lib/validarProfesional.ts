import type { BorradorProfesional, HorarioBorrador } from "@/lib/draft";
import {
  erroresCamposFichaProfesional,
  fichaTieneErrores,
  primerMensajeGuardado,
  errorHorarioEnSede,
} from "@/lib/erroresCamposFicha";

export { erroresCamposFichaProfesional, type ErroresCamposFicha } from "@/lib/erroresCamposFicha";

function conSede(sede: string, mensaje: string) {
  const texto = mensaje.charAt(0).toLowerCase() + mensaje.slice(1);
  return `En ${sede}, ${texto}`;
}

export function validarBorradorProfesional(
  borrador: BorradorProfesional,
  opts: { exigeHorario: boolean; tieneFoto: boolean },
): string | null {
  const errores = erroresCamposFichaProfesional(borrador, opts);
  if (!fichaTieneErrores(errores)) return null;
  if (errores.fullName) return errores.fullName;
  if (errores.license) return errores.license;
  if (errores.specialties) return errores.specialties;
  if (errores.photo) return errores.photo;
  if (errores.sedes) return errores.sedes;
  for (const horario of borrador.horarios) {
    const item = errores.porHorario[horario.key];
    if (!item) continue;
    const sede = horario.placeName?.trim() || "esta sede";
    if (item.lugar) return conSede(sede, item.lugar);
    if (item.horario) return conSede(sede, item.horario);
  }
  if (errores.solapamiento) return errores.solapamiento;
  for (const horario of borrador.horarios) {
    const item = errores.porHorario[horario.key];
    if (item?.obras) return conSede(horario.placeName?.trim() || "esta sede", item.obras);
  }
  return primerMensajeGuardado(errores);
}

/** Mensajes claros antes de guardar (panel profesional / secretaría). */
export function validarHorariosEnBorrador(horarios: HorarioBorrador[]): string | null {
  for (const horario of horarios) {
    const sede = horario.placeName?.trim() || "esta sede";
    if (!horario.placeId) continue;
    const error = errorHorarioEnSede(horario);
    if (error) return `En ${sede}, ${error.charAt(0).toLowerCase()}${error.slice(1)}`;
  }
  return null;
}

export function validarAntesDeGuardar(
  borrador: BorradorProfesional,
  opts: { exigeHorario: boolean; tieneFoto: boolean },
): string | null {
  return validarBorradorProfesional(borrador, opts);
}