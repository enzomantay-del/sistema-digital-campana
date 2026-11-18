export const LOCALIDADES = [
  "Santo Pipó",
  "Hipólito Yrigoyen",
  "Jardín América",
  "Ruiz de Montoya",
  "Puerto Rico",
  "Capioví",
] as const;

export const AREAS = [
  { id: "cuerpo", label: "Salud del cuerpo" },
  { id: "mental", label: "Salud mental" },
  { id: "odontologia", label: "Odontológica" },
] as const;

export const TIPOS_LUGAR = [
  { id: "hospital", label: "Hospital" },
  { id: "sanatorio", label: "Sanatorio" },
  { id: "consultorio", label: "Consultorio particular" },
  { id: "imagenes", label: "Centro de diagnóstico por imágenes" },
  { id: "laboratorio", label: "Laboratorio" },
  { id: "farmacia", label: "Farmacia" },
] as const;

export const TURNOS = [
  { id: "manana", label: "Mañana" },
  { id: "tarde", label: "Tarde" },
  { id: "guardia", label: "Guardia" },
] as const;

export const DIAS = [
  { id: "lun", label: "lunes" },
  { id: "mar", label: "martes" },
  { id: "mie", label: "miércoles" },
  { id: "jue", label: "jueves" },
  { id: "vie", label: "viernes" },
  { id: "sab", label: "sábado" },
  { id: "dom", label: "domingo" },
] as const;

export const OBRAS_INICIALES = ["IPS", "Particular", "OSDE", "Swiss Medical", "Galeno"] as const;

export const MENSAJE_WHATSAPP =
  "Hola, te escribo desde Dónde atenderse. Quería consultar por atención.";

export type AreaId = (typeof AREAS)[number]["id"];
export type TipoLugarId = (typeof TIPOS_LUGAR)[number]["id"];
export type TurnoId = (typeof TURNOS)[number]["id"];
export type DiaId = (typeof DIAS)[number]["id"];
