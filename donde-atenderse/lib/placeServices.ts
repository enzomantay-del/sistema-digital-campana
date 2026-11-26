/** Servicios institucionales del lugar (internación, cirugía, etc.), distintos de estudios laboratorio/imágenes. */
export const SERVICIOS_LUGAR = [
  { id: "internacion", label: "Internación" },
  { id: "uti", label: "Terapia intensiva (UTI)" },
  { id: "cirugia", label: "Cirugía" },
  { id: "emergencias", label: "Guardia / emergencias" },
  { id: "maternidad", label: "Maternidad" },
  { id: "neonatologia", label: "Neonatología" },
  { id: "pediatria_hospital", label: "Internación pediátrica" },
  { id: "hemodialisis", label: "Hemodiálisis" },
  { id: "rehabilitacion", label: "Rehabilitación / kinesiología hospitalaria" },
  { id: "ambulatorio", label: "Atención ambulatoria" },
  { id: "laboratorio_propio", label: "Laboratorio en el lugar" },
  { id: "imagenes_propio", label: "Diagnóstico por imágenes en el lugar" },
  { id: "farmacia_interna", label: "Farmacia interna" },
] as const;

export type ServicioLugarId = (typeof SERVICIOS_LUGAR)[number]["id"];

const IDS_VALIDOS = new Set<string>(SERVICIOS_LUGAR.map((item) => item.id));

export function serviciosIdsDesdeCampo(value: string | null | undefined): ServicioLugarId[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((parte) => parte.trim())
    .filter((id): id is ServicioLugarId => IDS_VALIDOS.has(id));
}

export function serviciosCampoDesdeIds(ids: string[]): string {
  const unicos = [...new Set(ids.map((id) => id.trim()).filter((id) => IDS_VALIDOS.has(id)))];
  return unicos.join(",");
}

export function etiquetasServiciosLugar(ids: string[]): string[] {
  const etiquetas: string[] = [];
  for (const id of ids) {
    const label = SERVICIOS_LUGAR.find((item) => item.id === id)?.label;
    if (label) etiquetas.push(label);
  }
  return etiquetas;
}

export function etiquetaServicioLugar(id: string): string {
  return SERVICIOS_LUGAR.find((item) => item.id === id)?.label ?? id;
}