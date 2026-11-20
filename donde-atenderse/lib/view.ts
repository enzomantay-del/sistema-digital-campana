import { etiquetaArea, etiquetaTurno, detalleHorario, fecha, textoPrecio } from "./format";
import { lineasHorarioLugar, textoHorarioLugarPublico } from "./placeSchedule";
import { lineaHorario, ordenarTurnos, type FilaHorario, type LineaHorario } from "./schedule";

export type VistaLinea = LineaHorario & {
  detalle: string;
  actualizacion: string;
  conflictoTexto: string;
  rotulo: string;
  personaId?: string;
};

export type VistaProfesional = {
  nombre: string;
  especialidad: string;
  area: string;
  matricula: string;
  precio: string;
  precioFecha: string;
  whatsapp: string;
  telefono: string;
  obras: string[];
  actualizacion: string;
  bloques: { shift: string; titulo: string; lineas: VistaLinea[] }[];
};

export type VistaLugar = {
  nombre: string;
  tipo: string;
  kind: string;
  localidad: string;
  direccion: string;
  whatsapp: string;
  telefono: string;
  horarioLugar: string;
  horarioLineas: string[];
  obras: string[];
  actualizacion: string;
  notaHospital: string;
  estudios: { nombre: string; preparacion: string; atencion: string }[];
  bloques: { shift: string; titulo: string; lineas: VistaLinea[] }[];
};

function frase(fechaValor: Date | null, quien: string) {
  if (!fechaValor) return `Cargado por ${quien}.`;
  return `Actualizado el ${fecha(fechaValor)} por ${quien}.`;
}

function conflictoTexto(linea: LineaHorario) {
  if (!linea.conflict) return "";
  const cuando = linea.conflict.updatedAt ? ` el ${fecha(linea.conflict.updatedAt)}` : "";
  const detalle = detalleHorario(linea.conflict.days, linea.conflict.time);
  const turno = etiquetaTurno(linea.conflict.shift);
  const dato = [turno, detalle].filter(Boolean).join(", ");
  return `${linea.placeName} cargó otra cosa${cuando}${dato ? `: ${dato}` : ""}.`;
}

function decorar(linea: LineaHorario, nombreProfesional: string, rotulo: string, personaId?: string): VistaLinea {
  const quien = linea.source === "lugar" ? linea.placeName : nombreProfesional;
  return {
    ...linea,
    detalle: detalleHorario(linea.days, linea.time),
    actualizacion: frase(linea.updatedAt, quien),
    conflictoTexto: conflictoTexto(linea),
    rotulo,
    personaId,
  };
}

function bloques(lineas: VistaLinea[]) {
  const grupos = new Map<string, VistaLinea[]>();
  for (const linea of ordenarTurnos(lineas)) {
    const lista = grupos.get(linea.shift) ?? [];
    lista.push(linea);
    grupos.set(linea.shift, lista);
  }
  return [...grupos.entries()].map(([shift, items]) => ({
    shift,
    titulo: etiquetaTurno(shift) || "Horario",
    lineas: items,
  }));
}

export function armarVistaProfesional(input: {
  fullName: string;
  specialty: string;
  area: string;
  license: string;
  price: string;
  priceUpdatedAt: Date | null;
  whatsapp: string;
  phone: string;
  obras: string[];
  updatedAt: Date | null;
  filas: FilaHorario[];
}): VistaProfesional {
  const nombre = input.fullName.trim() || "Sin nombre";
  const lineas = input.filas
    .map(lineaHorario)
    .filter((linea): linea is LineaHorario => Boolean(linea))
    .map((linea) => decorar(linea, nombre, linea.placeName));
  const ultima = lineas.reduce<Date | null>((max, linea) => {
    if (!linea.updatedAt) return max;
    if (!max || linea.updatedAt > max) return linea.updatedAt;
    return max;
  }, null) ?? input.updatedAt;
  return {
    nombre,
    especialidad: input.specialty.trim() || "Especialidad sin cargar",
    area: etiquetaArea(input.area),
    matricula: input.license.trim(),
    precio: textoPrecio(input.price),
    precioFecha: input.price.trim() ? fecha(input.priceUpdatedAt) : "",
    whatsapp: input.whatsapp.trim(),
    telefono: input.phone.trim(),
    obras: input.obras,
    actualizacion: frase(ultima, nombre),
    bloques: bloques(lineas),
  };
}

export function armarVistaLugar(input: {
  name: string;
  kind: string;
  locality: string;
  address: string;
  whatsapp: string;
  phone: string;
  scheduleNote: string;
  obras: string[];
  updatedAt: Date | null;
  studies: { name: string; preparation: string; attention: string }[];
  filas: (FilaHorario & { professionalName: string; professionalId: string })[];
}): VistaLugar {
  const lineas = input.filas.flatMap((fila) => {
    const linea = lineaHorario(fila);
    return linea ? [decorar(linea, fila.professionalName, fila.professionalName, fila.professionalId)] : [];
  });
  return {
    nombre: input.name,
    tipo: input.kind,
    kind: input.kind,
    localidad: input.locality,
    direccion: input.address.trim(),
    whatsapp: input.whatsapp.trim(),
    telefono: input.phone.trim(),
    horarioLugar: textoHorarioLugarPublico(input.scheduleNote),
    horarioLineas: lineasHorarioLugar(input.scheduleNote),
    obras: input.obras,
    actualizacion: frase(input.updatedAt, input.name),
    notaHospital:
      input.kind === "hospital" || input.kind === "sanatorio"
        ? "Los consultorios externos de este lugar están en esta ficha."
        : "",
    estudios: input.studies
      .filter((estudio) => estudio.name.trim())
      .map((estudio) => ({
        nombre: estudio.name.trim(),
        preparacion: estudio.preparation.trim(),
        atencion: estudio.attention === "turno" ? "Con turno" : estudio.attention === "orden" ? "Por orden de llegada" : "",
      })),
    bloques: bloques(lineas),
  };
}
