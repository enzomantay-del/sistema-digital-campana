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
  const conservados = new Set<string>();
  const rows: { key: string; id: string; placeId: string }[] = [];
  const ahora = new Date();

  for (const horario of borrador.horarios) {
    let placeId = horario.placeId;
    if (!placeId && horario.ownsPlace) {
      if (horario.placeName.trim().length < 2) continue;
      if (!LOCALIDADES.includes(horario.locality as (typeof LOCALIDADES)[number])) {
        return { ok: false, error: "El consultorio necesita una localidad del corredor." };
      }
      const place = await prisma.place.create({
        data: {
          name: horario.placeName.trim(),
          kind: "consultorio",
          locality: horario.locality,
          address: horario.address.trim(),
          published: true,
        },
      });
      await prisma.placeEditor.create({ data: { userId: user.id, placeId: place.id } });
      placeId = place.id;
    }
    if (!placeId) continue;

    const editor = await prisma.placeEditor.findUnique({
      where: { userId_placeId: { userId: user.id, placeId } },
    });
    if (editor && horario.ownsPlace) {
      await prisma.place.update({
        where: { id: placeId },
        data: {
          name: horario.placeName.trim() || undefined,
          locality: horario.locality,
          address: horario.address.trim(),
        },
      });
    }

    const dataProfesional = {
      professionalDays: horario.days.join(","),
      professionalTime: horario.time.trim(),
      professionalShift: horario.shift,
      professionalUpdatedAt: ahora,
      ...(editor
        ? {
            placeDays: horario.days.join(","),
            placeTime: horario.time.trim(),
            placeShift: horario.shift,
            placeUpdatedAt: ahora,
          }
        : {}),
    };

    const existente = horario.id ? actuales.find((item) => item.id === horario.id) : undefined;
    if (existente && existente.professionalId === professional.id) {
      await prisma.attendance.update({ where: { id: existente.id }, data: dataProfesional });
      conservados.add(existente.id);
      rows.push({ key: horario.key, id: existente.id, placeId });
    } else {
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
