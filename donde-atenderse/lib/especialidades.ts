/** Especialidades seleccionables en la ficha (múltiples). */
export const ESPECIALIDADES_CATALOGO = [
  "Clínica médica",
  "Pediatría",
  "Traumatología",
  "Ginecología",
  "Obstetricia",
  "Cardiología",
  "Oftalmología",
  "Psiquiatría",
  "Psicología",
  "Odontología",
  "Kinesiología",
  "Nutrición",
  "Dermatología",
  "Urología",
  "Neurología",
  "Cirugía general",
  "Anestesiología",
  "Medicina laboral",
  "Diagnóstico por imágenes",
  "Laboratorio",
] as const;

export function especialidadesDesdeCampo(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function campoDesdeEspecialidades(items: string[]): string {
  const unicos = [...new Set(items.map((item) => item.trim()).filter(Boolean))];
  return unicos.join("|");
}

export function etiquetaEspecialidades(items: string[], specialtyLegacy = ""): string {
  if (items.length > 0) return items.join(" · ");
  return specialtyLegacy.trim() || "Especialidad sin cargar";
}