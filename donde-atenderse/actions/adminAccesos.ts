"use server";

import { revalidatePath } from "next/cache";
import { requiereAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function guardarReferenciaAcceso(formData: FormData) {
  await requiereAdmin();
  const userId = String(formData.get("userId") ?? "").trim();
  const contrasenaReferencia = String(formData.get("contrasenaReferencia") ?? "").trim().slice(0, 120);
  const notaAcceso = String(formData.get("notaAcceso") ?? "").trim().slice(0, 500);
  if (!userId) return;

  const cuenta = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!cuenta || cuenta.role === "admin") return;

  await prisma.user.update({
    where: { id: userId },
    data: { contrasenaReferencia, notaAcceso },
  });
  revalidatePath("/panel/admin");
}