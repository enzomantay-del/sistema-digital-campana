"use server";

import { revalidatePath } from "next/cache";
import { lugarPermiteCargaSecretaria } from "@/lib/lugarAsignacion";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/auth";

function revalidarPublico() {
  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/farmacia");
  revalidatePath("/panel/admin");
}

function idsDe(formData: FormData) {
  const varios = formData
    .getAll("ids")
    .map((valor) => String(valor).trim())
    .filter(Boolean);
  if (varios.length > 0) return [...new Set(varios)];
  const uno = String(formData.get("id") ?? "").trim();
  return uno ? [uno] : [];
}

export async function publicarProfesional(formData: FormData) {
  await requiereAdmin();
  const ids = idsDe(formData);
  if (ids.length === 0) redirect("/panel/admin");
  await prisma.professional.updateMany({
    where: { id: { in: ids } },
    data: { published: true, reviewed: true },
  });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function bajarProfesional(formData: FormData) {
  await requiereAdmin();
  const ids = idsDe(formData);
  if (ids.length === 0) redirect("/panel/admin");
  await prisma.professional.updateMany({
    where: { id: { in: ids } },
    data: { published: false },
  });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function eliminarProfesional(formData: FormData) {
  await requiereAdmin();
  const ids = idsDe(formData);
  if (ids.length === 0) redirect("/panel/admin");
  await prisma.attendance.deleteMany({ where: { professionalId: { in: ids } } });
  await prisma.professionalObra.deleteMany({ where: { professionalId: { in: ids } } });
  await prisma.professional.deleteMany({ where: { id: { in: ids } } });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function publicarLugar(formData: FormData) {
  await requiereAdmin();
  const ids = idsDe(formData);
  if (ids.length === 0) redirect("/panel/admin");
  await prisma.place.updateMany({
    where: { id: { in: ids } },
    data: { published: true },
  });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function bajarLugar(formData: FormData) {
  await requiereAdmin();
  const ids = idsDe(formData);
  if (ids.length === 0) redirect("/panel/admin");
  await prisma.place.updateMany({
    where: { id: { in: ids } },
    data: { published: false },
  });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function eliminarLugar(formData: FormData) {
  await requiereAdmin();
  const ids = idsDe(formData);
  if (ids.length === 0) redirect("/panel/admin");
  await prisma.attendance.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.placeEditor.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.placeObra.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.study.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.pharmacyDuty.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.place.deleteMany({ where: { id: { in: ids } } });
  revalidarPublico();
  redirect("/panel/admin");
}

/** @deprecated Usar eliminarLugar */
export async function rechazarSugerencia(formData: FormData) {
  return eliminarLugar(formData);
}

export async function asignarEditor(formData: FormData) {
  await requiereAdmin();
  const placeId = String(formData.get("placeId") ?? "");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!placeId || !email.includes("@")) redirect(`/panel/lugar/${placeId || ""}`);
  const lugar = await prisma.place.findUnique({ where: { id: placeId }, select: { kind: true } });
  if (!lugar || !lugarPermiteCargaSecretaria(lugar.kind)) redirect(`/panel/lugar/${placeId}`);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) redirect(`/panel/lugar/${placeId}?error=correo`);
  await prisma.placeEditor.upsert({
    where: { userId_placeId: { userId: user.id, placeId } },
    update: {},
    create: { userId: user.id, placeId },
  });
  revalidatePath(`/panel/lugar/${placeId}`);
  redirect(`/panel/lugar/${placeId}`);
}

export async function quitarEditor(formData: FormData) {
  await requiereAdmin();
  const placeId = String(formData.get("placeId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!placeId || !userId) redirect("/panel/admin");
  await prisma.placeEditor.deleteMany({ where: { placeId, userId } });
  revalidatePath(`/panel/lugar/${placeId}`);
  redirect(`/panel/lugar/${placeId}`);
}