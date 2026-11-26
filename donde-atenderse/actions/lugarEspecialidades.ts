"use server";

import { revalidatePath } from "next/cache";
import { esAdmin, esSecretaria, usuarioActual } from "@/lib/auth";
import { campoDesdeEspecialidades } from "@/lib/especialidades";
import { prisma } from "@/lib/prisma";

export async function guardarEspecialidadesLugar(
  placeId: string,
  especialidades: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };

  const esEditor =
    esAdmin(user) || (esSecretaria(user) && user.places.some((item) => item.placeId === placeId));
  if (!esEditor) return { ok: false, error: "No podés editar este lugar." };

  await prisma.place.update({
    where: { id: placeId },
    data: { specialties: campoDesdeEspecialidades(especialidades) },
  });

  revalidatePath(`/lugar/${placeId}`);
  revalidatePath(`/panel/cargas/${placeId}`);
  return { ok: true };
}