"use server";

import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";
import type { BorradorProfesional } from "@/lib/draft";
import { camposLegacyDesdeHorario } from "@/lib/professionalSchedule";
import { horarioLugarParaGuardar, notaHorarioParaGuardar, validarHorarioLugar } from "@/lib/placeSchedule";

export type GuardadoProfesional =
  | { ok: true; rows: { key: string; id: string; placeId: string }[] }
  | { ok: false; error: string };

async function obraId(nombre: string) {
  const name = nombre.trim();
  if (!name) return null;
  const obra = await prisma.obraSocial.upsert({
    where: { name },
    update: {},
    create: { name },
  });
  return obra.id;
}

export async function guardarProfesional(borrador: BorradorProfesional): Promise<GuardadoProfesional> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  return guardarProfesionalInterno(user, borrador, null);
}

export async function guardarProfesionalAdmin(
  professionalId: string,
  borrador: BorradorProfesional,
): Promise<GuardadoProfesional> {
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) return { ok: false, error: "Solo administración puede editar otra ficha." };
  return guardarProfesionalInterno(user, borrador, professionalId);
}

async function guardarProfesionalInterno(
  user: NonNullable<Awaited<ReturnType<typeof usuarioActual>>>,
  borrador: BorradorProfesional,
  professionalId: string | null,
): Promise<GuardadoProfesional> {
  const modoAdmin = Boolean(professionalId && esAdmin(user));
  let professional = modoAdmin
    ? await prisma.professional.findUnique({ where: { id: professionalId! } })
    : user.professional;
  if (modoAdmin && !professional) return { ok: false, error: "Esa ficha ya no está." };
  if (!professional) {
    professional = await prisma.professional.create({
      data: {
        userId: user.id,
        fullName: user.name,
        published: false,
        reviewed: false,
      },
    });
  }

  const fullName = borrador.fullName.trim();
  if (fullName.length < 2) return { ok: false, error: "Escribí el nombre." };

  const price = borrador.price.trim();
  const precioCambio = price !== professional.price;
  await prisma.professional.update({
    where: { id: professional.id },
    data: {
      fullName,
      license: borrador.license.trim(),
      area: borrador.area || "cuerpo",
      specialty: borrador.specialty.trim(),
      whatsapp: borrador.whatsapp.trim(),
      phone: borrador.phone.trim(),
      price,
      priceUpdatedAt: precioCambio ? new Date() : professional.priceUpdatedAt,
    },
  });

  const nombres = [...borrador.obras, borrador.otraObra].map((item) => item.trim()).filter(Boolean);
  const ids = (await Promise.all(nombres.map(obraId))).filter((id): id is string => Boolean(id));
  await prisma.professionalObra.deleteMany({ where: { professionalId: professional.id } });
  if (ids.length) {
    await prisma.professionalObra.createMany({
      data: ids.map((id) => ({ professionalId: professional.id, obraId: id })),
    });
  }

  const actuales = await prisma.attendance.findMany({ where: { professionalId: professional.id } });
  const editores = new Set(user.places.map((item) => item.placeId));
  const conservados = new Set<string>();
  const rows: { key: string; id: string; placeId: string }[] = [];
  const ahora = new Date();

  for (const horario of borrador.horarios) {
    const existente = horario.id
      ? actuales.find((item) => item.id === horario.id && item.professionalId === professional.id)
      : undefined;
    let placeId = existente?.placeId;

    if (!placeId && horario.sugerido && !horario.placeId) {
      if (horario.placeName.trim().length < 2) continue;
      if (!LOCALIDADES.includes(horario.locality as (typeof LOCALIDADES)[number])) {
        return { ok: false, error: "El lugar sugerido necesita una localidad del corredor." };
      }
      const kind = TIPOS_LUGAR.some((tipo) => tipo.id === horario.kind) ? horario.kind : "consultorio";
      const place = await prisma.place.create({
        data: {
          name: horario.placeName.trim(),
          kind,
          locality: horario.locality,
          address: horario.address.trim().slice(0, 200),
          published: false,
          suggestedById: user.id,
          suggestionNote: "Sugerido desde la ficha del profesional.",
        },
      });
      placeId = place.id;
    } else if (!placeId && horario.placeId) {
      const lugar = await prisma.place.findUnique({ where: { id: horario.placeId } });
      if (!lugar) return { ok: false, error: "Ese lugar ya no está." };
      const propio = lugar.suggestedById === user.id;
      if (!modoAdmin && !lugar.published && !propio && !editores.has(lugar.id)) {
        return { ok: false, error: "Ese lugar todavía no está publicado." };
      }
      placeId = lugar.id;
    } else if (placeId && horario.placeId && horario.placeId !== placeId) {
      const lugar = await prisma.place.findUnique({ where: { id: horario.placeId } });
      if (
        !lugar ||
        (!modoAdmin && !lugar.published && lugar.suggestedById !== user.id && !editores.has(lugar.id))
      ) {
        return { ok: false, error: "No podés cambiar a ese lugar." };
      }
      placeId = lugar.id;
    }

    if (!placeId) continue;

    const schedule = horarioLugarParaGuardar(horario.schedule);
    const errorHorario = validarHorarioLugar(schedule);
    if (errorHorario) return { ok: false, error: errorHorario };

    if (horario.sugerido) {
      const sugerido = await prisma.place.findUnique({ where: { id: placeId } });
      if (sugerido && !sugerido.published && sugerido.suggestedById === user.id) {
        const kind = TIPOS_LUGAR.some((tipo) => tipo.id === horario.kind) ? horario.kind : sugerido.kind;
        await prisma.place.update({
          where: { id: placeId },
          data: {
            name: horario.placeName.trim() || sugerido.name,
            kind,
            locality: LOCALIDADES.includes(horario.locality as (typeof LOCALIDADES)[number])
              ? horario.locality
              : sugerido.locality,
            address: horario.address.trim().slice(0, 200),
          },
        });
      }
    }

    const esEditor = editores.has(placeId);
    const nota = notaHorarioParaGuardar(schedule, horario.scheduleLegacy);
    const legacy = camposLegacyDesdeHorario(schedule);

    const dataProfesional = {
      placeId,
      professionalDays: legacy.days,
      professionalTime: legacy.time.trim().slice(0, 80),
      professionalShift: legacy.shift,
      professionalScheduleNote: nota,
      professionalUpdatedAt: ahora,
      ...(esEditor
        ? {
            placeDays: legacy.days,
            placeTime: legacy.time.trim().slice(0, 80),
            placeShift: legacy.shift,
            placeUpdatedAt: ahora,
          }
        : {}),
    };

    if (existente) {
      await prisma.attendance.update({ where: { id: existente.id }, data: dataProfesional });
      conservados.add(existente.id);
      rows.push({ key: horario.key, id: existente.id, placeId });
    } else {
      const creado = await prisma.attendance.create({
        data: { professionalId: professional.id, ...dataProfesional },
      });
      conservados.add(creado.id);
      rows.push({ key: horario.key, id: creado.id, placeId });
    }
  }

  for (const item of actuales) {
    if (conservados.has(item.id)) continue;
    const lugarTieneDatos = Boolean(item.placeDays || item.placeTime || item.placeShift);
    if (lugarTieneDatos) {
      await prisma.attendance.update({
        where: { id: item.id },
        data: {
          professionalDays: "",
          professionalTime: "",
          professionalShift: "",
          professionalScheduleNote: "",
          professionalUpdatedAt: ahora,
        },
      });
    } else {
      await prisma.attendance.delete({ where: { id: item.id } });
    }
  }

  revalidatePath("/panel/profesional");
  revalidatePath(`/profesional/${professional.id}`);
  revalidatePath("/buscar");
  if (modoAdmin) {
    revalidatePath("/panel/admin");
    revalidatePath(`/panel/admin/profesional/${professional.id}`);
  }

  return { ok: true, rows };
}

const FOTO_MAX_BYTES = 2 * 1024 * 1024;
const FOTO_TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionFoto(tipo: string) {
  if (tipo === "image/jpeg") return "jpg";
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  if (tipo === "image/gif") return "gif";
  return null;
}

async function puedeEditarProfesional(
  user: NonNullable<Awaited<ReturnType<typeof usuarioActual>>>,
  professionalId: string,
) {
  if (esAdmin(user)) return true;
  return user.professional?.id === professionalId;
}

async function borrarArchivosFoto(professionalId: string) {
  const dir = path.join(process.cwd(), "public", "uploads", "profesionales");
  try {
    const archivos = await readdir(dir);
    for (const nombre of archivos) {
      if (nombre.startsWith(`${professionalId}.`)) {
        await unlink(path.join(dir, nombre));
      }
    }
  } catch {
    /* carpeta vacía */
  }
}

export async function subirFotoProfesional(
  professionalId: string,
  formData: FormData,
): Promise<{ ok: true; photoUrl: string } | { ok: false; error: string }> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  if (!(await puedeEditarProfesional(user, professionalId))) {
    return { ok: false, error: "Esta ficha no está en tu cuenta." };
  }
  const archivo = formData.get("foto");
  if (!archivo || !(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, error: "Elegí una imagen." };
  }
  if (!FOTO_TIPOS.has(archivo.type)) {
    return { ok: false, error: "Usá JPG, PNG, WebP o GIF." };
  }
  if (archivo.size > FOTO_MAX_BYTES) {
    return { ok: false, error: "La imagen no puede pesar más de 2 MB." };
  }
  const extension = extensionFoto(archivo.type);
  if (!extension) return { ok: false, error: "Formato de imagen no admitido." };

  const dir = path.join(process.cwd(), "public", "uploads", "profesionales");
  await mkdir(dir, { recursive: true });
  await borrarArchivosFoto(professionalId);
  const nombre = `${professionalId}.${extension}`;
  await writeFile(path.join(dir, nombre), Buffer.from(await archivo.arrayBuffer()));
  const photoUrl = `/uploads/profesionales/${nombre}?v=${Date.now()}`;
  await prisma.professional.update({ where: { id: professionalId }, data: { photoUrl } });
  revalidatePath("/panel/profesional");
  revalidatePath(`/profesional/${professionalId}`);
  return { ok: true, photoUrl };
}

export async function quitarFotoProfesional(
  professionalId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  if (!(await puedeEditarProfesional(user, professionalId))) {
    return { ok: false, error: "Esta ficha no está en tu cuenta." };
  }
  await borrarArchivosFoto(professionalId);
  await prisma.professional.update({ where: { id: professionalId }, data: { photoUrl: "" } });
  revalidatePath("/panel/profesional");
  revalidatePath(`/profesional/${professionalId}`);
  return { ok: true };
}
