"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { usuarioActual } from "@/lib/auth";
import { AREAS, LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";
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

export async function crearLugar(formData: FormData) {
  const user = await usuarioActual();
  if (!user) redirect("/entrar");
  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const locality = String(formData.get("locality") ?? "");
  if (name.length < 2) redirect("/panel/lugar/nuevo?error=nombre");
  if (!TIPOS_LUGAR.some((tipo) => tipo.id === kind)) redirect("/panel/lugar/nuevo?error=tipo");
  if (!LOCALIDADES.includes(locality as (typeof LOCALIDADES)[number])) redirect("/panel/lugar/nuevo?error=localidad");
  const place = await prisma.place.create({ data: { name, kind, locality, published: true } });
  await prisma.placeEditor.create({ data: { userId: user.id, placeId: place.id } });
  redirect(`/panel/lugar/${place.id}`);
}

export async function guardarLugar(placeId: string, borrador: BorradorLugar): Promise<GuardadoLugar> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  const editor = user.places.find((item) => item.placeId === placeId);
  if (!editor) return { ok: false, error: "Esta ficha no está en tu cuenta." };

  if (borrador.name.trim().length < 2) return { ok: false, error: "Escribí el nombre del lugar." };
  if (!TIPOS_LUGAR.some((tipo) => tipo.id === borrador.kind)) return { ok: false, error: "Elegí el tipo de lugar." };
  if (!LOCALIDADES.includes(borrador.locality as (typeof LOCALIDADES)[number])) {
    return { ok: false, error: "Elegí una localidad del corredor." };
  }

  await prisma.place.update({
    where: { id: placeId },
    data: {
      name: borrador.name.trim(),
      kind: borrador.kind,
      locality: borrador.locality,
      address: borrador.address.trim(),
      whatsapp: borrador.whatsapp.trim(),
      phone: borrador.phone.trim(),
      scheduleNote: borrador.scheduleNote.trim(),
      published: true,
    },
  });

  const nombres = [...borrador.obras, borrador.otraObra].map((item) => item.trim()).filter(Boolean);
  const ids = (await Promise.all(nombres.map(obraId))).filter((id): id is string => Boolean(id));
  await prisma.placeObra.deleteMany({ where: { placeId } });
  if (ids.length) {
    await prisma.placeObra.createMany({ data: ids.map((id) => ({ placeId, obraId: id })) });
  }

  const estudiosActuales = await prisma.study.findMany({ where: { placeId } });
  const estudiosConservados = new Set<string>();
  const studies: { key: string; id: string }[] = [];
  for (const estudio of borrador.studies) {
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

  if (borrador.kind === "farmacia" && borrador.dutyStart && borrador.dutyEnd) {
    const startsOn = new Date(`${borrador.dutyStart}T00:00:00-03:00`);
    const endsOn = new Date(`${borrador.dutyEnd}T23:59:00-03:00`);
    if (Number.isNaN(startsOn.getTime()) || Number.isNaN(endsOn.getTime()) || endsOn < startsOn) {
      return { ok: false, error: "Revisá las fechas del turno." };
    }
    const previo = await prisma.pharmacyDuty.findFirst({ where: { placeId }, orderBy: { endsOn: "desc" } });
    if (previo) {
      await prisma.pharmacyDuty.update({
        where: { id: previo.id },
        data: { startsOn, endsOn, source: borrador.dutySource.trim() },
      });
    } else {
      await prisma.pharmacyDuty.create({
        data: { placeId, startsOn, endsOn, source: borrador.dutySource.trim() },
      });
    }
  }

  const actuales = await prisma.attendance.findMany({ where: { placeId } });
  const conservados = new Set<string>();
  const horarios: { key: string; id: string; professionalId: string }[] = [];
  const ahora = new Date();

  for (const horario of borrador.horarios) {
    if (!horario.professionalId && horario.professionalName.trim().length < 2) continue;
    let professionalId = horario.professionalId;
    if (!professionalId) {
      if (!AREAS.some((area) => area.id === horario.area)) {
        return { ok: false, error: "Elegí el área de la persona que agregaste." };
      }
      const creado = await prisma.professional.create({
        data: {
          fullName: horario.professionalName.trim(),
          specialty: horario.specialty.trim(),
          area: horario.area || "cuerpo",
          license: horario.license.trim(),
          published: true,
        },
      });
      professionalId = creado.id;
    }
    const dataLugar = {
      placeDays: horario.days.join(","),
      placeTime: horario.time.trim(),
      placeShift: horario.shift,
      placeUpdatedAt: ahora,
    };
    const existente = horario.id ? actuales.find((item) => item.id === horario.id) : undefined;
    if (existente && existente.placeId === placeId) {
      await prisma.attendance.update({ where: { id: existente.id }, data: dataLugar });
      conservados.add(existente.id);
      horarios.push({ key: horario.key, id: existente.id, professionalId });
    } else {
      const creado = await prisma.attendance.create({
        data: { placeId, professionalId, ...dataLugar },
      });
      conservados.add(creado.id);
      horarios.push({ key: horario.key, id: creado.id, professionalId });
    }
  }

  for (const item of actuales) {
    if (conservados.has(item.id)) continue;
    const personaTieneDatos = Boolean(item.professionalDays || item.professionalTime || item.professionalShift);
    if (personaTieneDatos) {
      await prisma.attendance.update({
        where: { id: item.id },
        data: { placeDays: "", placeTime: "", placeShift: "", placeUpdatedAt: ahora },
      });
    } else {
      await prisma.attendance.delete({ where: { id: item.id } });
    }
  }

  return { ok: true, horarios, studies };
}
