"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/auth";

function revalidarPublico() {
  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/farmacia");
  revalidatePath("/panel/admin");
}

function idDe(formData: FormData) {
  return String(formData.get("id") ?? "").trim();
}

export async function publicarProfesional(formData: FormData) {
  await requiereAdmin();
  const id = idDe(formData);
  if (!id) redirect("/panel/admin");
  await prisma.professional.update({
    where: { id },
    data: { published: true, reviewed: true },
  });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function bajarProfesional(formData: FormData) {
  await requiereAdmin();
  const id = idDe(formData);
  if (!id) redirect("/panel/admin");
  await prisma.professional.update({
    where: { id },
    data: { published: false },
  });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function eliminarProfesional(formData: FormData) {
  await requiereAdmin();
  const id = idDe(formData);
  if (!id) redirect("/panel/admin");
  await prisma.attendance.deleteMany({ where: { professionalId: id } });
  await prisma.professionalObra.deleteMany({ where: { professionalId: id } });
  await prisma.professional.delete({ where: { id } });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function publicarLugar(formData: FormData) {
  await requiereAdmin();
  const id = idDe(formData);
  if (!id) redirect("/panel/admin");
  await prisma.place.update({
    where: { id },
    data: { published: true },
  });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function bajarLugar(formData: FormData) {
  await requiereAdmin();
  const id = idDe(formData);
  if (!id) redirect("/panel/admin");
  await prisma.place.update({
    where: { id },
    data: { published: false },
  });
  revalidarPublico();
  redirect("/panel/admin");
}

export async function eliminarLugar(formData: FormData) {
  await requiereAdmin();
  const id = idDe(formData);
  if (!id) redirect("/panel/admin");
  await prisma.attendance.deleteMany({ where: { placeId: id } });
  await prisma.placeEditor.deleteMany({ where: { placeId: id } });
  await prisma.placeObra.deleteMany({ where: { placeId: id } });
  await prisma.study.deleteMany({ where: { placeId: id } });
  await prisma.pharmacyDuty.deleteMany({ where: { placeId: id } });
  await prisma.place.delete({ where: { id } });
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
