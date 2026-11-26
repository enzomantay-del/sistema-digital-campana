export const LOCALIDADES = [
  "Santo Pipó",
  "Hipólito Yrigoyen",
  "Jardín América",
  "Ruiz de Montoya",
  "Capioví",
  "Puerto Rico",
] as const;

export const AREAS = [
  { id: "cuerpo", label: "Salud del cuerpo" },
  { id: "mental", label: "Salud mental" },
  { id: "odontologia", label: "Odontológica" },
] as const;

/** Hospitales, sanatorios y consultorios (sin farmacia ni laboratorio/imágenes). */
export const TIPOS_CENTRO_SALUD = ["hospital", "sanatorio", "consultorio", "policonsultorio"] as const;

export const TIPOS_LUGAR = [
  { id: "hospital", label: "Hospital" },
  { id: "sanatorio", label: "Sanatorio" },
  { id: "consultorio", label: "Consultorio particular" },
  { id: "policonsultorio", label: "Policonsultorio" },
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

export const OBRAS_MISIONES = [
  "Particular",
  "IPS",
  "PAMI",
  "ACTIM",
  "APTM",
  "Asis Salud",
  "Avalian",
  "Bramed",
  "Cámara del Tabaco de Misiones",
  "Camioneros",
  "Conexión Salud",
  "Galeno",
  "Grupo Premedic",
  "IAMIP",
  "Jerárquicos Salud",
  "Luz y Fuerza",
  "Medicus",
  "Medifé",
  "OMINT",
  "OSALARA",
  "OSDE",
  "OSDEPYM",
  "OSDOP",
  "OSECAC",
  "OSFATUN",
  "OSJERA",
  "OSMISS",
  "OSPATCA",
  "OSPECON",
  "OSPEDYC",
  "OSPES",
  "OSPIDA",
  "OSPIM",
  "OSPSA",
  "OSSACRA",
  "OSSEG",
  "OSTEL",
  "OSUOMRA",
  "OSUTHGRA",
  "Patrones de Cabotaje",
  "Poder Judicial",
  "Prevención Salud",
  "Sancor Salud",
  "SCIS",
  "SMAUNaM",
  "SOMU",
  "Su Salud",
  "Swiss Medical",
  "Unión Personal",
  "UTA",
] as const;

export const OBRAS_INICIALES = OBRAS_MISIONES;

export const MENSAJE_WHATSAPP =
  "Hola, te escribo desde Cercalud. Quería consultar por atención.";

export type AreaId = (typeof AREAS)[number]["id"];
export type TipoLugarId = (typeof TIPOS_LUGAR)[number]["id"];
export type TurnoId = (typeof TURNOS)[number]["id"];
export type DiaId = (typeof DIAS)[number]["id"];
