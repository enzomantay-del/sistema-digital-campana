import { esAdmin, esSecretaria } from "@/lib/auth";
import type { UsuarioSesion } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Quién puede editar la ficha o subir foto de un profesional. */
export async function puedeEditarProfesional(user: UsuarioSesion, professionalId: string) {
  if (esAdmin(user)) return true;
  if (user.professional?.id === professionalId) return true;
  if (esSecretaria(user)) {
    const atiende = await prisma.attendance.findFirst({
      where: {
        professionalId,
        placeId: { in: user.places.map((item) => item.placeId) },
      },
    });
    if (atiende) return true;
    const recien = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { createdAt: true, attendances: { select: { placeId: true } } },
    });
    if (!recien) return false;
    const sinAtenciones = recien.attendances.length === 0;
    const hacePoco = Date.now() - recien.createdAt.getTime() < 2 * 60 * 60 * 1000;
    return sinAtenciones && hacePoco;
  }
  return false;
}