import { esAdmin, esProfesional, esSecretaria } from "@/lib/auth";
import type { UsuarioSesion } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function lugaresAsignados(user: UsuarioSesion) {
  return user.places.map((item) => item.placeId);
}

/** Profesional propio, admin, o secretaría con atención previa en alguno de sus centros. */
export async function puedeEditarProfesional(user: UsuarioSesion, professionalId: string) {
  if (esAdmin(user)) return true;
  if (user.professional?.id === professionalId) return true;
  if (esSecretaria(user)) {
    const lugares = lugaresAsignados(user);
    if (lugares.length === 0) return false;
    const atiende = await prisma.attendance.findFirst({
      where: {
        professionalId,
        placeId: { in: lugares },
      },
    });
    return Boolean(atiende);
  }
  return false;
}

/** Stub sin cuenta ni asistencias (flujo «nuevo» en secretaría). */
async function esFichaStubSinAtenciones(professionalId: string) {
  const total = await prisma.attendance.count({ where: { professionalId } });
  if (total > 0) return false;
  const pro = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { userId: true },
  });
  return Boolean(pro && pro.userId === null);
}

/**
 * Página de carga / edición en un centro concreto (placeId viene de la ruta del panel).
 * No usa placeId enviado por el cliente en el JSON de guardado.
 */
export async function secretariaPuedeTrabajarFichaEnLugar(
  user: UsuarioSesion,
  professionalId: string,
  placeId: string,
) {
  if (!esSecretaria(user)) return false;
  if (!lugaresAsignados(user).includes(placeId)) return false;

  const enEsteCentro = await prisma.attendance.findFirst({
    where: { professionalId, placeId },
  });
  if (enEsteCentro) return true;

  if (await esFichaStubSinAtenciones(professionalId)) return true;

  const enCualquierCentro = await prisma.attendance.findFirst({
    where: { professionalId },
  });
  return Boolean(enCualquierCentro);
}

/** Guardado vía API: horarios solo en centros asignados y vínculo válido con la ficha. */
export async function secretariaPuedeGuardarFicha(
  user: UsuarioSesion,
  professionalId: string,
  placeIdsEnBorrador: string[],
) {
  if (!esSecretaria(user)) return false;
  const lugares = new Set(lugaresAsignados(user));
  const centrosDelBorrador = [...new Set(placeIdsEnBorrador.filter((id) => lugares.has(id)))];
  if (centrosDelBorrador.length === 0) return false;

  if (await puedeEditarProfesional(user, professionalId)) return true;

  for (const placeId of centrosDelBorrador) {
    if (await secretariaPuedeTrabajarFichaEnLugar(user, professionalId, placeId)) return true;
  }
  return false;
}

/**
 * Foto: igual que editar ficha, o stub en primera carga si el centro pedido está asignado a la secretaría
 * (placeId solo refina el stub; no alcanza para fichas ajenas con asistencias en otros lugares).
 */
export async function secretariaPuedeSubirFoto(
  user: UsuarioSesion,
  professionalId: string,
  placeIdOpcional?: string,
) {
  if (await puedeEditarProfesional(user, professionalId)) return true;
  if (!placeIdOpcional || !lugaresAsignados(user).includes(placeIdOpcional)) return false;
  return esFichaStubSinAtenciones(professionalId);
}

export function puedeEditarComoProfesional(user: UsuarioSesion, professionalId: string) {
  return esProfesional(user) && user.professional?.id === professionalId;
}