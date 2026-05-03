"use server";

import { prisma } from "@/lib/prisma";
import { normalizarTelefono } from "@/lib/phone";
import { revalidatePath } from "next/cache";

export async function crearContacto(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const barrio = String(formData.get("barrio") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();

  if (!nombre || !telefono || !barrio) {
    return { ok: false as const, error: "Completá nombre, teléfono y barrio." };
  }

  await prisma.contacto.create({
    data: {
      nombre,
      telefono: normalizarTelefono(telefono),
      barrio,
      notas: notas || null,
    },
  });

  revalidatePath("/panel");
  revalidatePath("/panel/contactos");
  return { ok: true as const };
}

export async function eliminarContacto(id: string) {
  await prisma.contacto.delete({ where: { id } });
  revalidatePath("/panel");
  revalidatePath("/panel/contactos");
  return { ok: true as const };
}
