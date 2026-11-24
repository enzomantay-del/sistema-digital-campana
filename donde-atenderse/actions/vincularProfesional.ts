"use server";

import { revalidatePath } from "next/cache";
import { esProfesional, usuarioActual } from "@/lib/auth";
import { claveMatricula } from "@/lib/matricula";
import { prisma } from "@/lib/prisma";

export async function vincularFichaPorMatricula(
  matricula: string,
): Promise<{ ok: true; professionalId: string } | { ok: false; error: string }> {
  const user = await usuarioActual();
  if (!user || (!esProfesional(user) && !user.professional)) {
    return { ok: false, error: "Solo con cuenta de profesional." };
  }

  const clave = claveMatricula(matricula);
  if (!clave) return { ok: false, error: "Escribí la matrícula completa para vincular." };

  const existente = await prisma.professional.findFirst({
    where: { licenseKey: clave },
    select: { id: true, fullName: true, userId: true },
  });
  if (!existente) {
    return { ok: false, error: "No hay otra ficha con esa matrícula. Seguí editando la tuya." };
  }
  if (existente.userId && existente.userId !== user.id) {
    return {
      ok: false,
      error: `Esa matrícula ya está vinculada a otra cuenta. Escribinos por contacto si necesitás recuperar el acceso.`,
    };
  }
  if (existente.userId === user.id) {
    return { ok: true, professionalId: existente.id };
  }

  const actual = await prisma.professional.findUnique({
    where: { userId: user.id },
    include: { _count: { select: { attendances: true } } },
  });

  if (actual && actual.id !== existente.id) {
    if (actual._count.attendances > 0 || actual.license.trim().length >= 3) {
      return {
        ok: false,
        error: `Ya cargaste datos en otra ficha. Pedí a administración que una las fichas de ${existente.fullName}.`,
      };
    }
    await prisma.professional.delete({ where: { id: actual.id } });
  }

  await prisma.professional.update({
    where: { id: existente.id },
    data: { userId: user.id },
  });

  revalidatePath("/panel/profesional");
  revalidatePath(`/profesional/${existente.id}`);
  return { ok: true, professionalId: existente.id };
}