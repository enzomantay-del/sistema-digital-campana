export const MODOS_OBRAS_LUGAR = [
  {
    id: "por_profesional",
    label: "Por profesional",
    descripcion: "Cada médico carga sus obras sociales. En la ficha del lugar no se lista un padrón único.",
  },
  {
    id: "del_lugar",
    label: "Del lugar",
    descripcion: "El centro publica un listado único de obras sociales (hospital, laboratorio, etc.).",
  },
  {
    id: "mixto",
    label: "Mixto",
    descripcion: "Listado del lugar y aclaración de que puede variar según el profesional.",
  },
] as const;

export type ObrasModoLugar = (typeof MODOS_OBRAS_LUGAR)[number]["id"];

export function obrasModoDefault(kind: string): ObrasModoLugar {
  if (kind === "policonsultorio" || kind === "consultorio") return "por_profesional";
  return "del_lugar";
}

export function obrasModoEfectivo(kind: string, modo: string | null | undefined): ObrasModoLugar {
  if (modo === "por_profesional" || modo === "del_lugar" || modo === "mixto") return modo;
  return obrasModoDefault(kind);
}

export function presentacionObrasLugar(modo: ObrasModoLugar, obras: string[]) {
  if (modo === "por_profesional") {
    return {
      mostrarLista: false,
      nota: "Las obras sociales dependen de cada profesional. Revisá su ficha antes de ir.",
    };
  }
  if (modo === "mixto") {
    return {
      mostrarLista: obras.length > 0,
      nota:
        obras.length > 0
          ? "Listado del lugar. Algún profesional puede atender otras obras sociales: confirmá en su ficha."
          : null,
    };
  }
  return {
    mostrarLista: obras.length > 0,
    nota: null as string | null,
  };
}

export function lugarAtiendeObra(
  modo: ObrasModoLugar,
  obrasLugar: string[],
  obraBuscada: string,
  obrasProfesionalesEnLugar: string[],
) {
  if (!obraBuscada) return true;
  if (modo === "por_profesional") {
    return obrasProfesionalesEnLugar.includes(obraBuscada);
  }
  if (modo === "del_lugar") {
    return obrasLugar.includes(obraBuscada);
  }
  return obrasLugar.includes(obraBuscada) || obrasProfesionalesEnLugar.includes(obraBuscada);
}