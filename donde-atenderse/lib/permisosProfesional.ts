import { esAdmin, esSecretaria } from "@/lib/auth";
import type { UsuarioSesion } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Quién puede editar la ficha o subir foto de un profesional. */
export async function puedeEditarProfesional(
  user: UsuarioSesion,
  professionalId: string,
  opts?: { placeIdsEnCarga?: string[] },
) {
  if (esAdmin(user)) return true;
  if (user.professional?.id === professionalId) return true;
  if (esSecretaria(user)) {
    const lugares = user.places.map((item) => item.placeId);
    if (lugares.length === 0) return false;
    const atiende = await prisma.attendance.findFirst({
      where: {
        professionalId,
        placeId: { in: lugares },
      },
    });
    if (atiende) return true;
    const cargandoEnSusLugares = (opts?.placeIdsEnCarga ?? []).some((id) => lugares.includes(id));
    return cargandoEnSusLugares;
  }
  return false;
}