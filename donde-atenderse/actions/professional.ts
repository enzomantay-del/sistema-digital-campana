"use server";

import { prisma } from "@/lib/prisma";
import { usuarioActual } from "@/lib/auth";
import { LOCALIDADES } from "@/lib/constants";
import type { BorradorProfesional } from "@/lib/draft";

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

  let professional = user.professional;
  if (!professional) {
    professional = await prisma.professional.create({
      data: { userId: user.id, fullName: user.name, published: true },
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
      published: true,
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

    if (!placeId && !horario.placeId && horario.ownsPlace) {
      if (horario.placeName.trim().length < 2) continue;
      if (!LOCALIDADES.includes(horario.locality as (typeof LOCALIDADES)[number])) {
        return { ok: false, error: "El consultorio necesita una localidad del corredor." };
      }
      const place = await prisma.place.create({
        data: {
          name: horario.placeName.trim(),
          kind: "consultorio",
          locality: horario.locality,
          address: horario.address.trim().slice(0, 200),
          published: true,
        },
      });
      await prisma.placeEditor.create({ data: { userId: user.id, placeId: place.id } });
      editores.add(place.id);
      placeId = place.id;
    } else if (!placeId && horario.placeId && editores.has(horario.placeId)) {
      placeId = horario.placeId;
    }

    if (!placeId) continue;
    const esEditor = editores.has(placeId);
    const mismaFicha = !existente || !horario.placeId || horario.placeId === existente.placeId;

    if (esEditor && horario.ownsPlace && mismaFicha) {
      await prisma.place.update({
        where: { id: placeId },
        data: {
          name: horario.placeName.trim() || undefined,
          locality: LOCALIDADES.includes(horario.locality as (typeof LOCALIDADES)[number])
            ? horario.locality
            : undefined,
          address: horario.address.trim().slice(0, 200),
        },
      });
    }

    const dataProfesional = {
      professionalDays: horario.days.join(","),
      professionalTime: horario.time.trim().slice(0, 80),
      professionalShift: horario.shift,
      professionalUpdatedAt: ahora,
      ...(esEditor
        ? {
            placeDays: horario.days.join(","),
            placeTime: horario.time.trim().slice(0, 80),
            placeShift: horario.shift,
            placeUpdatedAt: ahora,
          }
        : {}),
    };

    if (existente) {
      await prisma.attendance.update({ where: { id: existente.id }, data: dataProfesional });
      conservados.add(existente.id);
      rows.push({ key: horario.key, id: existente.id, placeId });
    } else if (esEditor) {
      const creado = await prisma.attendance.create({
        data: { professionalId: professional.id, placeId, ...dataProfesional },
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
          professionalUpdatedAt: ahora,
        },
      });
    } else {
      await prisma.attendance.delete({ where: { id: item.id } });
    }
  }

  return { ok: true, rows };
}
