"use server";

import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";
import { MODOS_OBRAS_LUGAR, obrasModoDefault, obrasModoEfectivo } from "@/lib/placeObras";
import { horarioLugarParaGuardar, notaHorarioParaGuardar, validarHorarioLugar } from "@/lib/placeSchedule";
import type { BorradorLugar } from "@/lib/draft";

export type GuardadoLugar =
  | {
      ok: true;
      horarios: { key: string; id: string; professionalId: string }[];
      studies: { key: string; id: string }[];
    }
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

async function puedeEditarLugar(user: NonNullable<Awaited<ReturnType<typeof usuarioActual>>>, placeId: string) {
  if (esAdmin(user)) return true;
  return user.places.some((item) => item.placeId === placeId);
}

export async function crearLugar(formData: FormData) {
  const user = await usuarioActual();
  if (!user) redirect("/entrar");
  if (!esAdmin(user)) redirect("/panel");

  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const locality = String(formData.get("locality") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  if (name.length < 2) redirect("/panel/lugar/nuevo?error=nombre");
  if (!TIPOS_LUGAR.some((tipo) => tipo.id === kind)) redirect("/panel/lugar/nuevo?error=tipo");
  if (!LOCALIDADES.includes(locality as (typeof LOCALIDADES)[number])) redirect("/panel/lugar/nuevo?error=localidad");

  const place = await prisma.place.create({
    data: { name, kind, locality, address, published: true, obrasMode: obrasModoDefault(kind) },
  });
  redirect(`/panel/lugar/${place.id}`);
}

export async function guardarLugar(placeId: string, borrador: BorradorLugar): Promise<GuardadoLugar> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  if (!(await puedeEditarLugar(user, placeId))) {
    return { ok: false, error: "Esta ficha no está en tu cuenta." };
  }

  const schedule = horarioLugarParaGuardar(borrador.schedule);
  const borradorLimpio = { ...borrador, schedule };
  if (borradorLimpio.name.trim().length < 2) return { ok: false, error: "Escribí el nombre del lugar." };
  if (!TIPOS_LUGAR.some((tipo) => tipo.id === borradorLimpio.kind)) return { ok: false, error: "Elegí el tipo de lugar." };
  if (!LOCALIDADES.includes(borradorLimpio.locality as (typeof LOCALIDADES)[number])) {
    return { ok: false, error: "Elegí una localidad del corredor." };
  }

  const errorHorario = validarHorarioLugar(borradorLimpio.schedule);
  if (errorHorario) return { ok: false, error: errorHorario };

  const lugar = await prisma.place.findUnique({ where: { id: placeId } });
  if (!lugar) return { ok: false, error: "Ese lugar ya no está." };

  await prisma.place.update({
    where: { id: placeId },
    data: {
      name: borradorLimpio.name.trim(),
      kind: borradorLimpio.kind,
      locality: borradorLimpio.locality,
      address: borradorLimpio.address.trim(),
      whatsapp: borradorLimpio.whatsapp.trim(),
      phone: borradorLimpio.phone.trim(),
      scheduleNote: notaHorarioParaGuardar(borradorLimpio.schedule, borradorLimpio.scheduleLegacy),
      obrasMode: MODOS_OBRAS_LUGAR.some((item) => item.id === borradorLimpio.obrasMode)
        ? borradorLimpio.obrasMode
        : obrasModoEfectivo(borradorLimpio.kind, lugar.obrasMode),
      published: esAdmin(user) ? lugar.published : lugar.published,
    },
  });

  const modo = obrasModoEfectivo(borradorLimpio.kind, borradorLimpio.obrasMode);
  if (modo === "por_profesional") {
    await prisma.placeObra.deleteMany({ where: { placeId } });
  } else {
    const nombres = [...borradorLimpio.obras, borradorLimpio.otraObra].map((item) => item.trim()).filter(Boolean);
    const ids = (await Promise.all(nombres.map(obraId))).filter((id): id is string => Boolean(id));
    await prisma.placeObra.deleteMany({ where: { placeId } });
    if (ids.length) {
      await prisma.placeObra.createMany({ data: ids.map((id) => ({ placeId, obraId: id })) });
    }
  }

  const estudiosActuales = await prisma.study.findMany({ where: { placeId } });
  const estudiosConservados = new Set<string>();
  const studies: { key: string; id: string }[] = [];
  for (const estudio of borradorLimpio.studies) {
    if (!estudio.name.trim()) continue;
    const data = { name: estudio.name.trim(), preparation: estudio.preparation.trim(), attention: estudio.attention };
    const existente = estudio.id ? estudiosActuales.find((item) => item.id === estudio.id) : undefined;
    if (existente) {
      await prisma.study.update({ where: { id: existente.id }, data });
      estudiosConservados.add(existente.id);
      studies.push({ key: estudio.key, id: existente.id });
    } else {
      const creado = await prisma.study.create({ data: { placeId, ...data } });
      estudiosConservados.add(creado.id);
      studies.push({ key: estudio.key, id: creado.id });
    }
  }
  if (estudiosConservados.size === 0) {
    await prisma.study.deleteMany({ where: { placeId } });
  } else {
    await prisma.study.deleteMany({ where: { placeId, id: { notIn: [...estudiosConservados] } } });
  }

  if (borradorLimpio.kind === "farmacia" && borradorLimpio.dutyStart && borradorLimpio.dutyEnd) {
    const startsOn = new Date(`${borradorLimpio.dutyStart}T00:00:00-03:00`);
    const endsOn = new Date(`${borradorLimpio.dutyEnd}T23:59:00-03:00`);
    if (Number.isNaN(startsOn.getTime()) || Number.isNaN(endsOn.getTime()) || endsOn < startsOn) {
      return { ok: false, error: "Revisá las fechas del turno." };
    }
    const previo = await prisma.pharmacyDuty.findFirst({ where: { placeId }, orderBy: { endsOn: "desc" } });
    if (previo) {
      await prisma.pharmacyDuty.update({
        where: { id: previo.id },
        data: { startsOn, endsOn, source: borradorLimpio.dutySource.trim() },
      });
    } else {
      await prisma.pharmacyDuty.create({
        data: { placeId, startsOn, endsOn, source: borrador.dutySource.trim() },
      });
    }
  }

  return { ok: true, horarios: [], studies };
}

const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionLogo(tipo: string) {
  if (tipo === "image/jpeg") return "jpg";
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  if (tipo === "image/gif") return "gif";
  return null;
}

async function borrarArchivosLogo(placeId: string) {
  const dir = path.join(process.cwd(), "public", "uploads", "logos");
  try {
    const archivos = await readdir(dir);
    for (const nombre of archivos) {
      if (nombre.startsWith(`${placeId}.`)) {
        await unlink(path.join(dir, nombre));
      }
    }
  } catch {
    /* carpeta vacía */
  }
}

export async function subirLogoLugar(
  placeId: string,
  formData: FormData,
): Promise<{ ok: true; logoUrl: string } | { ok: false; error: string }> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  if (!(await puedeEditarLugar(user, placeId))) {
    return { ok: false, error: "Esta ficha no está en tu cuenta." };
  }
  const archivo = formData.get("logo");
  if (!archivo || !(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, error: "Elegí una imagen." };
  }
  if (!LOGO_TIPOS.has(archivo.type)) {
    return { ok: false, error: "Usá JPG, PNG, WebP o GIF." };
  }
  if (archivo.size > LOGO_MAX_BYTES) {
    return { ok: false, error: "La imagen no puede pesar más de 2 MB." };
  }
  const extension = extensionLogo(archivo.type);
  if (!extension) return { ok: false, error: "Formato de imagen no admitido." };

  const dir = path.join(process.cwd(), "public", "uploads", "logos");
  await mkdir(dir, { recursive: true });
  await borrarArchivosLogo(placeId);
  const nombre = `${placeId}.${extension}`;
  await writeFile(path.join(dir, nombre), Buffer.from(await archivo.arrayBuffer()));
  const logoUrl = `/uploads/logos/${nombre}?v=${Date.now()}`;
  await prisma.place.update({ where: { id: placeId }, data: { logoUrl } });
  return { ok: true, logoUrl };
}

export async function quitarLogoLugar(placeId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  if (!(await puedeEditarLugar(user, placeId))) {
    return { ok: false, error: "Esta ficha no está en tu cuenta." };
  }
  await borrarArchivosLogo(placeId);
  await prisma.place.update({ where: { id: placeId }, data: { logoUrl: "" } });
  return { ok: true };
}
