import { prisma } from "@/lib/prisma";

/** Nombre de la ficha modelo que el seed mantiene actualizada. */
export const PROFESIONAL_EJEMPLO_MODELO = "Dra. Ana López";

export const RUTA_PROFESIONAL_EJEMPLO = "/ejemplo/profesional";

export async function profesionalEjemploModelo() {
  const modelo = await prisma.professional.findFirst({
    where: { example: true, fullName: PROFESIONAL_EJEMPLO_MODELO, published: true },
    include: { obras: { include: { obra: true } }, attendances: { include: { place: true } } },
  });
  if (modelo) return modelo;

  return prisma.professional.findFirst({
    where: { example: true, published: true },
    orderBy: { fullName: "asc" },
    include: { obras: { include: { obra: true } }, attendances: { include: { place: true } } },
  });
}