import type { Prisma } from "@prisma/client";
import { mostrarDatosEjemplo } from "@/lib/config";

export function filtroProfesionalPublico(): Prisma.ProfessionalWhereInput {
  if (mostrarDatosEjemplo()) return { published: true };
  return { published: true, example: false };
}

export function filtroLugarPublico(extra?: Prisma.PlaceWhereInput): Prisma.PlaceWhereInput {
  const base: Prisma.PlaceWhereInput = mostrarDatosEjemplo()
    ? { published: true }
    : { published: true, example: false };
  return { ...base, ...extra };
}

/** En la web pública solo se muestran horarios en lugares ya publicados por Cercalud. */
export function asistenciasEnLugaresPublicados<T extends { place: { published: boolean } }>(attendances: T[]): T[] {
  return attendances.filter((item) => item.place.published);
}