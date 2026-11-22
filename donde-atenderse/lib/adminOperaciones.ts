import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type AccionAdminLugar = "publicar" | "bajar" | "eliminar";
export type AccionAdminProfesional = "publicar" | "bajar" | "eliminar";

function revalidarPublico() {
  revalidatePath("/");
  revalidatePath("/buscar");
  revalidatePath("/farmacia");
  revalidatePath("/panel/admin");
}

export function idsDesdeFormulario(formData: FormData) {
  const varios = formData
    .getAll("ids")
    .map((valor) => String(valor).trim())
    .filter(Boolean);
  if (varios.length > 0) return [...new Set(varios)];
  const uno = String(formData.get("id") ?? "").trim();
  return uno ? [uno] : [];
}

export async function publicarLugares(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.place.updateMany({
    where: { id: { in: ids } },
    data: { published: true },
  });
  for (const id of ids) revalidatePath(`/panel/lugar/${id}`);
  revalidarPublico();
}

export async function bajarLugares(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.place.updateMany({
    where: { id: { in: ids } },
    data: { published: false },
  });
  for (const id of ids) revalidatePath(`/panel/lugar/${id}`);
  revalidarPublico();
}

export async function eliminarLugares(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.attendance.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.placeEditor.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.placeObra.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.study.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.pharmacyDuty.deleteMany({ where: { placeId: { in: ids } } });
  await prisma.place.deleteMany({ where: { id: { in: ids } } });
  revalidarPublico();
}

export async function publicarProfesionales(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.professional.updateMany({
    where: { id: { in: ids } },
    data: { published: true, reviewed: true },
  });
  revalidarPublico();
}

export async function bajarProfesionales(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.professional.updateMany({
    where: { id: { in: ids } },
    data: { published: false },
  });
  revalidarPublico();
}

export async function eliminarProfesionales(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.attendance.deleteMany({ where: { professionalId: { in: ids } } });
  await prisma.professionalObra.deleteMany({ where: { professionalId: { in: ids } } });
  await prisma.professional.deleteMany({ where: { id: { in: ids } } });
  revalidarPublico();
}

export async function ejecutarAccionLugar(accion: AccionAdminLugar, ids: string[]) {
  if (accion === "publicar") return publicarLugares(ids);
  if (accion === "bajar") return bajarLugares(ids);
  return eliminarLugares(ids);
}

export async function ejecutarAccionProfesional(accion: AccionAdminProfesional, ids: string[]) {
  if (accion === "publicar") return publicarProfesionales(ids);
  if (accion === "bajar") return bajarProfesionales(ids);
  return eliminarProfesionales(ids);
}