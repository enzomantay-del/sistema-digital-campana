import { prisma } from "@/lib/prisma";
import type { UsuarioSesion } from "@/lib/auth";
import { esAdmin } from "@/lib/auth";
import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";
import type { BorradorLugar } from "@/lib/draft";
import { MODOS_OBRAS_LUGAR, obrasModoEfectivo } from "@/lib/placeObras";
import { serviciosCampoDesdeIds } from "@/lib/placeServices";
import { horarioLugarParaGuardar, notaHorarioParaGuardar, validarHorarioLugar } from "@/lib/placeSchedule";

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

function puedeEditarLugar(user: UsuarioSesion, placeId: string) {
  if (esAdmin(user)) return true;
  return user.places.some((item) => item.placeId === placeId);
}

export async function guardarLugarCore(placeId: string, borrador: BorradorLugar, user: UsuarioSesion): Promise<GuardadoLugar> {
  if (!puedeEditarLugar(user, placeId)) {
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

  try {
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
        services: serviciosCampoDesdeIds(borradorLimpio.servicios ?? []),
        obrasMode: MODOS_OBRAS_LUGAR.some((item) => item.id === borradorLimpio.obrasMode)
          ? borradorLimpio.obrasMode
          : obrasModoEfectivo(borradorLimpio.kind, lugar.obrasMode),
        published: lugar.published,
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

    return { ok: true, horarios: [], studies };
  } catch (error) {
    console.error("guardarLugarCore:", error);
    return { ok: false, error: "No se pudo guardar en la base. Probá de nuevo en un momento." };
  }
}