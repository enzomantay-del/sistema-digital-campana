import {
  datosActualizadosRecientes,
  diasRestantesInsignia,
  profesionalVerificadoEnListado,
  ultimaActualizacionProfesional,
} from "@/lib/verificacion";

/** A partir de cuántos días restantes mostramos aviso en el panel del profesional / secretaría. */
export const AVISO_PANEL_INSIGNIA_DIAS = 7;

export function estadoInsigniaProfesional(input: {
  updatedAt: Date;
  published: boolean;
  attendances: { professionalUpdatedAt: Date | null }[];
}) {
  const ultima = ultimaActualizacionProfesional(input);
  const diasRestantes = diasRestantesInsignia(ultima);
  const verificado = profesionalVerificadoEnListado({
    updatedAt: input.updatedAt,
    attendances: input.attendances,
  });
  const mostrarAviso =
    input.published &&
    (!verificado || diasRestantes <= AVISO_PANEL_INSIGNIA_DIAS);
  return { ultima, diasRestantes, verificado, mostrarAviso };
}

export function estadoInsigniaAsistencia(input: {
  professionalUpdatedAt: Date | null;
  professional: { updatedAt: Date; published: boolean; attendances: { professionalUpdatedAt: Date | null }[] };
}) {
  const global = estadoInsigniaProfesional(input.professional);
  const verificadoFila = datosActualizadosRecientes(
    input.professionalUpdatedAt ?? input.professional.updatedAt,
  );
  return {
    ...global,
    verificadoEnEsteLugar: verificadoFila,
    mostrarAvisoEnLugar: input.professional.published && !verificadoFila,
  };
}