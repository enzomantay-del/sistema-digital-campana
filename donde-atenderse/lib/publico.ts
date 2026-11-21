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