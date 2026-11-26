"use server";

import { revalidatePath } from "next/cache";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { puedeEditarProfesional, secretariaPuedeTrabajarFichaEnLugar } from "@/lib/permisosProfesional";
import { prisma } from "@/lib/prisma";
import { diasRestantesInsignia, ultimaActualizacionProfesional } from "@/lib/verificacion";

export type ResultadoConfirmar = { ok: true } | { ok: false; error: string };

async function revalidarFichaProfesional(professionalId: string) {
  revalidatePath("/panel/profesional");
  revalidatePath(`/profesional/${professionalId}`);
  revalidatePath("/buscar");
  revalidatePath("/panel/admin");
}

export async function confirmarVigenciaProfesional(): Promise<ResultadoConfirmar> {
  const user = await usuarioActual();
  if (!user?.professional) {
    return { ok: false, error: "No encontramos tu ficha." };
  }
  const professionalId = user.professional.id;
  const persona = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { specialty: true },
  });
  if (!persona) return { ok: false, error: "No encontramos tu ficha." };
  const ahora = new Date();
  await prisma.$transaction([
    prisma.professional.update({
      where: { id: professionalId },
      data: { specialty: persona.specialty },
    }),
    prisma.attendance.updateMany({
      where: { professionalId },
      data: { professionalUpdatedAt: ahora },
    }),
  ]);
  await revalidarFichaProfesional(professionalId);
  return { ok: true };
}

export async function confirmarVigenciaProfesionalAdmin(professionalId: string): Promise<ResultadoConfirmar> {
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) return { ok: false, error: "Sin permiso." };
  const persona = await prisma.professional.findUnique({ where: { id: professionalId }, select: { specialty: true } });
  if (!persona) return { ok: false, error: "Esa ficha ya no está." };
  const ahora = new Date();
  await prisma.$transaction([
    prisma.professional.update({
      where: { id: professionalId },
      data: { specialty: persona.specialty },
    }),
    prisma.attendance.updateMany({
      where: { professionalId },
      data: { professionalUpdatedAt: ahora },
    }),
  ]);
  await revalidarFichaProfesional(professionalId);
  revalidatePath(`/panel/admin/profesional/${professionalId}`);
  return { ok: true };
}

export async function confirmarVigenciaEnLugar(professionalId: string, placeId: string): Promise<ResultadoConfirmar> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que iniciar sesión." };
  if (
    !(await puedeEditarProfesional(user, professionalId)) &&
    !(await secretariaPuedeTrabajarFichaEnLugar(user, professionalId, placeId))
  ) {
    return { ok: false, error: "No podés actualizar esta ficha." };
  }
  const fila = await prisma.attendance.findFirst({
    where: { professionalId, placeId },
    select: { id: true },
  });
  if (!fila) {
    return { ok: false, error: "Este profesional no tiene horario cargado en ese lugar." };
  }
  const ahora = new Date();
  await prisma.attendance.update({
    where: { id: fila.id },
    data: { professionalUpdatedAt: ahora },
  });
  if (user.professional?.id === professionalId) {
    const persona = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { specialty: true },
    });
    if (persona) {
      await prisma.professional.update({
        where: { id: professionalId },
        data: { specialty: persona.specialty },
      });
    }
  }
  await revalidarFichaProfesional(professionalId);
  revalidatePath(`/panel/cargas/${placeId}`);
  revalidatePath(`/panel/cargas/${placeId}/${professionalId}`);
  return { ok: true };
}

export async function lecturaEstadoInsigniaTrasConfirmar(professionalId: string) {
  const persona = await prisma.professional.findUnique({
    where: { id: professionalId },
    include: { attendances: { select: { professionalUpdatedAt: true } } },
  });
  if (!persona) return null;
  const ultima = ultimaActualizacionProfesional(persona);
  return diasRestantesInsignia(ultima);
}