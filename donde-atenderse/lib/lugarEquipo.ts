import { prisma } from "./prisma";

export async function equipoPublicadoEnLugar(placeId: string) {
  const filas = await prisma.attendance.findMany({
    where: { placeId, professional: { published: true } },
    include: { professional: true },
    orderBy: { professional: { fullName: "asc" } },
  });
  const vistos = new Set<string>();
  const profesionales = filas
    .map((fila) => fila.professional)
    .filter((persona) => {
      if (vistos.has(persona.id)) return false;
      vistos.add(persona.id);
      return true;
    });
  const especialidades = Array.from(
    new Set(
      profesionales
        .map((persona) => persona.specialty.trim())
        .filter((especialidad) => especialidad.length > 1),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));
  return { profesionales, especialidades, cantidad: profesionales.length };
}