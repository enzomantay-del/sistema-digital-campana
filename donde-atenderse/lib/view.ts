import { etiquetaArea, etiquetaTurno, fecha, textoPrecio } from "./format";
import { lineasHorarioLegacy, textoHorarioUnido } from "./horarioTexto";
import { datosActualizadosRecientes, fechaMasReciente } from "./verificacion";
import { ObrasModoLugar, obrasModoEfectivo, presentacionObrasLugar } from "./placeObras";
import { etiquetasServiciosLugar, serviciosIdsDesdeCampo } from "./placeServices";
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
  fotoUrl: string;
  precio: string;
  precioFecha: string;
  whatsapp: string;
  telefono: string;
  obras: string[];
  actualizacion: string;
  datosVerificados: boolean;
  bloques: { shift: string; titulo: string; lineas: VistaLinea[] }[];
};

export type VistaLugar = {
  nombre: string;
  tipo: string;
  kind: string;
  localidad: string;
  direccion: string;
  logoUrl: string;
  whatsapp: string;
  telefono: string;
  scheduleNote: string;
  horarioLugar: string;
  horarioLineas: string[];
  obras: string[];
  obrasMode: ObrasModoLugar;
  obrasNota: string | null;
  mostrarObrasLista: boolean;
  placeId: string;
  cantidadProfesionales: number;
  especialidades: string[];
  actualizacion: string;
  datosVerificados: boolean;
  servicios: string[];
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
  const detalle = textoHorarioUnido(
    lineasHorarioLegacy(linea.conflict.days, linea.conflict.time, linea.conflict.shift),
  );
  const turno = etiquetaTurno(linea.conflict.shift);
  const dato = [turno, detalle].filter(Boolean).join(", ");
  return `${linea.placeName} cargó otra cosa${cuando}${dato ? `: ${dato}` : ""}.`;
}

function decorar(linea: LineaHorario, nombreProfesional: string, rotulo: string, personaId?: string): VistaLinea {
  const quien = linea.source === "lugar" ? linea.placeName : nombreProfesional;
  const lineas =
    linea.horarioLineas.length > 0
      ? linea.horarioLineas
      : lineasHorarioLegacy(linea.days, linea.time, linea.shift);
  const detalle = textoHorarioUnido(lineas);
  return {
    ...linea,
    horarioLineas: lineas,
    detalle,
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
  photoUrl?: string;
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
    fotoUrl: input.photoUrl?.trim() ?? "",
    precio: textoPrecio(input.price),
    precioFecha: input.price.trim() ? fecha(input.priceUpdatedAt) : "",
    whatsapp: input.whatsapp.trim(),
    telefono: input.phone.trim(),
    obras: input.obras,
    actualizacion: frase(ultima, nombre),
    datosVerificados: datosActualizadosRecientes(
      fechaMasReciente(input.updatedAt, ...input.filas.map((fila) => fila.professionalUpdatedAt)),
    ),
    bloques: bloques(lineas),
  };
}

export function armarVistaLugar(input: {
  placeId: string;
  name: string;
  kind: string;
  locality: string;
  address: string;
  logoUrl?: string;
  whatsapp: string;
  phone: string;
  scheduleNote: string;
  obrasMode?: string | null;
  obras: string[];
  cantidadProfesionales: number;
  especialidades: string[];
  updatedAt: Date | null;
  services?: string | null;
  servicios?: string[];
  studies: { name: string; preparation: string; attention: string }[];
  filas: (FilaHorario & { professionalName: string; professionalId: string })[];
}): VistaLugar {
  const modo = obrasModoEfectivo(input.kind, input.obrasMode);
  const obrasPresentacion = presentacionObrasLugar(modo, input.obras);
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
    logoUrl: input.logoUrl?.trim() ?? "",
    whatsapp: input.whatsapp.trim(),
    telefono: input.phone.trim(),
    scheduleNote: input.scheduleNote,
    horarioLugar: textoHorarioLugarPublico(input.scheduleNote),
    horarioLineas: lineasHorarioLugar(input.scheduleNote),
    obras: obrasPresentacion.mostrarLista ? input.obras : [],
    obrasMode: modo,
    obrasNota: obrasPresentacion.nota,
    mostrarObrasLista: obrasPresentacion.mostrarLista,
    placeId: input.placeId,
    cantidadProfesionales: input.cantidadProfesionales,
    especialidades: input.especialidades,
    actualizacion: frase(input.updatedAt, input.name),
    datosVerificados: datosActualizadosRecientes(
      fechaMasReciente(input.updatedAt, ...input.filas.map((fila) => fila.placeUpdatedAt)),
    ),
    servicios: etiquetasServiciosLugar(
      input.servicios ?? serviciosIdsDesdeCampo(input.services ?? ""),
    ),
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
