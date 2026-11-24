"use server";

import { revalidatePath } from "next/cache";
import { requiereAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Solo administración: une una cuenta con la ficha ya cargada (p. ej. por secretaría). */
export async function vincularCuentaProfesionalAdmin(
  professionalId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requiereAdmin();

  const [persona, cuenta] = await Promise.all([
    prisma.professional.findUnique({ where: { id: professionalId }, select: { id: true, userId: true, fullName: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, professional: { select: { id: true } } } }),
  ]);
  if (!persona) return { ok: false, error: "No existe esa ficha." };
  if (!cuenta) return { ok: false, error: "No existe esa cuenta." };
  if (cuenta.role !== "profesional") {
    return { ok: false, error: "La cuenta no es de tipo profesional." };
  }
  if (persona.userId && persona.userId !== userId) {
    return { ok: false, error: "La ficha ya tiene otra cuenta vinculada." };
  }
  if (cuenta.professional && cuenta.professional.id !== professionalId) {
    return { ok: false, error: "Esa cuenta ya tiene otra ficha. Desvinculala antes." };
  }

  await prisma.professional.update({
    where: { id: professionalId },
    data: { userId },
  });

  revalidatePath("/panel/admin");
  revalidatePath("/panel/profesional");
  revalidatePath(`/profesional/${professionalId}`);
  return { ok: true };
}