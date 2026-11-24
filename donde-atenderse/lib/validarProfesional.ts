import type { BorradorProfesional } from "@/lib/draft";

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
    const conLugar = borrador.horarios.filter((h) => h.placeId && !h.sugerido);
    if (conLugar.length === 0) return "Indicá al menos un lugar de atención con horario.";
  }
  if (borrador.obras.length === 0 && !borrador.otraObra.trim()) {
    return "Marcá al menos una obra social que atiende.";
  }
  return null;
}