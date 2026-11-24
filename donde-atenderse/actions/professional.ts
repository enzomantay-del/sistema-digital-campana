"use server";

import { guardarImagenEntidad, quitarImagenesEntidad } from "@/lib/almacenamientoImagen";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { esAdmin, esSecretaria, usuarioActual } from "@/lib/auth";
import type { BorradorProfesional } from "@/lib/draft";
import { campoDesdeEspecialidades } from "@/lib/especialidades";
import { claveMatricula } from "@/lib/matricula";
import { camposLegacyDesdeHorario } from "@/lib/professionalSchedule";
import {
  horarioLugarParaGuardar,
  horarioLugarVacio,
  notaHorarioParaGuardar,
  validarHorarioLugar,
} from "@/lib/placeSchedule";
import { puedeEditarProfesional, secretariaPuedeGuardarFicha } from "@/lib/permisosProfesional";
import { validarBorradorProfesional } from "@/lib/validarProfesional";
import { FOTO_MAX_BYTES, tipoYExtensionFoto } from "@/lib/validarFoto";

export type GuardadoProfesional =
  | { ok: true; rows: { key: string; id: string; placeId: string }[]; professionalId: string }
  | { ok: false; error: string };

type ModoGuardado = "propio" | "admin" | "secretaria";

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

export async function buscarProfesionalPorMatricula(
  license: string,
): Promise<{ ok: true; id: string; fullName: string } | { ok: false; error: string }> {
  const user = await usuarioActual();
  if (!user || (!esAdmin(user) && !esSecretaria(user))) {
    return { ok: false, error: "Sin permiso." };
  }
  const clave = claveMatricula(license);
  if (!clave) return { ok: false, error: "Escribí la matrícula completa." };
  const persona = await prisma.professional.findFirst({
    where: { licenseKey: clave },
    select: { id: true, fullName: true },
  });
  if (!persona) return { ok: false, error: "No hay ninguna ficha con esa matrícula. Podés crear una nueva." };
  return { ok: true, id: persona.id, fullName: persona.fullName };
}

export async function guardarProfesional(borrador: BorradorProfesional): Promise<GuardadoProfesional> {
  try {
    const user = await usuarioActual();
    if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
    if (esSecretaria(user)) return { ok: false, error: "Las secretarias cargan desde el panel de su lugar." };
    return await guardarProfesionalInterno(user, borrador, null, "propio");
  } catch {
    return { ok: false, error: "No se pudo guardar la ficha. Probá de nuevo en unos minutos." };
  }
}

export async function guardarProfesionalAdmin(
  professionalId: string,
  borrador: BorradorProfesional,
): Promise<GuardadoProfesional> {
  try {
    const user = await usuarioActual();
    if (!user || !esAdmin(user)) return { ok: false, error: "Solo administración puede editar otra ficha." };
    return await guardarProfesionalInterno(user, borrador, professionalId, "admin");
  } catch {
    return { ok: false, error: "No se pudo guardar la ficha. Probá de nuevo en unos minutos." };
  }
}

export async function guardarProfesionalSecretaria(
  professionalId: string | null,
  borrador: BorradorProfesional,
): Promise<GuardadoProfesional> {
  try {
    const user = await usuarioActual();
    if (!user || !esSecretaria(user)) return { ok: false, error: "Solo secretarias con lugar asignado." };
    if (user.places.length === 0) return { ok: false, error: "No tenés un lugar asignado." };
    return await guardarProfesionalInterno(user, borrador, professionalId, "secretaria");
  } catch {
    return { ok: false, error: "No se pudo guardar la ficha. Probá de nuevo en unos minutos." };
  }
}

function normalizarBorradorProfesional(borrador: BorradorProfesional): BorradorProfesional {
  return {
    ...borrador,
    fullName: borrador.fullName ?? "",
    license: borrador.license ?? "",
    specialty: borrador.specialty ?? "",
    specialties: borrador.specialties ?? [],
    photoUrl: borrador.photoUrl ?? "",
    whatsapp: borrador.whatsapp ?? "",
    phone: borrador.phone ?? "",
    agendaWhatsapp: borrador.agendaWhatsapp ?? "",
    agendaPhone: borrador.agendaPhone ?? "",
    price: borrador.price ?? "",
    obras: borrador.obras ?? [],
    otraObra: borrador.otraObra ?? "",
    horarios: (borrador.horarios ?? []).map((horario) => ({
      ...horario,
      obras: horario.obras ?? [],
      otraObra: horario.otraObra ?? "",
      schedule:
        horario.schedule && Array.isArray(horario.schedule.franjas)
          ? horario.schedule
          : horarioLugarVacio(),
    })),
  };
}

async function guardarProfesionalInterno(
  user: NonNullable<Awaited<ReturnType<typeof usuarioActual>>>,
  borradorEntrada: BorradorProfesional,
  professionalId: string | null,
  modo: ModoGuardado,
): Promise<GuardadoProfesional> {
  const borrador = normalizarBorradorProfesional(borradorEntrada);
  const modoAdmin = modo === "admin";
  const modoSecretaria = modo === "secretaria";
  const lugaresPermitidos = new Set(
    modoSecretaria ? user.places.map((item) => item.placeId) : user.places.map((item) => item.placeId),
  );
  const placeIdsEnCarga = borrador.horarios
    .map((h) => h.placeId)
    .filter((id): id is string => Boolean(id));

  let professional =
    modoAdmin || modoSecretaria
      ? professionalId
        ? await prisma.professional.findUnique({ where: { id: professionalId } })
        : null
      : user.professional;

  const creando = !professional;
  if ((modoAdmin || modoSecretaria) && professionalId && !professional) {
    return { ok: false, error: "Esa ficha ya no está." };
  }

  let editarDatosGlobales = !modoSecretaria;
  if (modoSecretaria && professional) {
    for (const placeId of placeIdsEnCarga) {
      if (!lugaresPermitidos.has(placeId)) {
        return { ok: false, error: "Solo podés cargar horarios en los lugares que te asignó la administración." };
      }
    }
    if (!(await secretariaPuedeGuardarFicha(user, professional.id, placeIdsEnCarga))) {
      return {
        ok: false,
        error: "Solo podés editar profesionales que atienden en tu lugar o que estás cargando por primera vez ahí.",
      };
    }
    const asistenciasPrevias = await prisma.attendance.count({ where: { professionalId: professional.id } });
    editarDatosGlobales =
      (await puedeEditarProfesional(user, professional.id)) || asistenciasPrevias === 0;
  }

  if (!professional) {
    professional = await prisma.professional.create({
      data: {
        userId: modo === "propio" ? user.id : null,
        fullName: borrador.fullName.trim() || user.name,
        published: false,
        reviewed: false,
      },
    });
  }

  const errorValidacion = validarBorradorProfesional(borrador, {
    exigeHorario: true,
    tieneFoto: Boolean(borrador.photoUrl?.trim() || professional.photoUrl?.trim()),
  });
  if (errorValidacion) return { ok: false, error: errorValidacion };

  const license = borrador.license.trim();
  const licenseKey = claveMatricula(license);
  if (licenseKey) {
    const duplicado = await prisma.professional.findFirst({
      where: { licenseKey, NOT: { id: professional.id } },
      select: { id: true, fullName: true },
    });
    if (duplicado) {
      return {
        ok: false,
        error: modoSecretaria
          ? `Ya existe la ficha de ${duplicado.fullName} con esa matrícula. Usá «Buscar por matrícula» y cargá solo el horario en este lugar; no crees otra ficha.`
          : modo === "propio"
            ? `Ya existe la ficha de ${duplicado.fullName} con esa matrícula. Pedí a administración que vincule tu cuenta o escribinos por contacto.`
            : `Ya existe la ficha de ${duplicado.fullName} con esa matrícula.`,
      };
    }
  }

  const listaEspecialidades = [
    ...(borrador.specialties ?? []),
    ...(borrador.specialty.trim() ? [borrador.specialty.trim()] : []),
  ].filter(Boolean);
  const specialtiesCampo = campoDesdeEspecialidades(listaEspecialidades);
  const specialtyPrincipal = listaEspecialidades[0] ?? "";

  if (editarDatosGlobales) {
    const price = borrador.price.trim();
    const precioCambio = price !== professional.price;
    await prisma.professional.update({
      where: { id: professional.id },
      data: {
        fullName: borrador.fullName.trim(),
        license,
        licenseKey,
        area: borrador.area || "cuerpo",
        specialty: specialtyPrincipal,
        specialties: specialtiesCampo,
        whatsapp: borrador.whatsapp.trim(),
        phone: borrador.phone.trim(),
        agendaWhatsapp: borrador.agendaWhatsapp.trim(),
        agendaPhone: borrador.agendaPhone.trim(),
        price,
        priceUpdatedAt: precioCambio ? new Date() : professional.priceUpdatedAt,
      },
    });
  }

  const actuales = await prisma.attendance.findMany({
    where: { professionalId: professional.id },
    include: { obras: true },
  });
  const obrasProfesional = new Set<string>();
  const conservados = new Set<string>();
  const rows: { key: string; id: string; placeId: string }[] = [];
  const ahora = new Date();

  for (const horario of borrador.horarios) {
    let placeId = horario.placeId;
    if (!placeId) continue;

    const lugar = await prisma.place.findUnique({ where: { id: placeId } });
    if (!lugar) return { ok: false, error: "Ese lugar ya no está." };

    if (modoSecretaria && !lugaresPermitidos.has(placeId)) {
      return { ok: false, error: "Solo podés cargar horarios en los lugares que te asignó la administración." };
    }
    if (!modoAdmin && !lugar.published) {
      const propioSugerido = modo === "propio" && lugar.suggestedById === user.id;
      const secretariaDelLugar = modoSecretaria && lugaresPermitidos.has(placeId);
      if (!propioSugerido && !secretariaDelLugar) {
        return {
          ok: false,
          error: modoSecretaria
            ? "Ese lugar todavía no está publicado. Elegí solo lugares confirmados por Cercalud."
            : "Ese lugar todavía no está publicado. Si lo sugeriste vos, esperá la revisión o elegí uno ya publicado.",
        };
      }
    }

    const existente = horario.id
      ? actuales.find((item) => item.id === horario.id && item.professionalId === professional!.id)
      : actuales.find((item) => item.placeId === placeId);

    const schedule = horarioLugarParaGuardar(horario.schedule);
    const errorHorario = validarHorarioLugar(schedule);
    if (errorHorario) return { ok: false, error: errorHorario };

    const esEditorLugar = lugaresPermitidos.has(placeId);
    const nota = notaHorarioParaGuardar(schedule, horario.scheduleLegacy);
    const legacy = camposLegacyDesdeHorario(schedule);

    const dataProfesional = {
      placeId,
      professionalDays: legacy.days,
      professionalTime: legacy.time.trim().slice(0, 80),
      professionalShift: legacy.shift,
      professionalScheduleNote: nota,
      professionalUpdatedAt: ahora,
      ...(esEditorLugar
        ? {
            placeDays: legacy.days,
            placeTime: legacy.time.trim().slice(0, 80),
            placeShift: legacy.shift,
            placeUpdatedAt: ahora,
          }
        : {}),
    };

    const attendanceId = existente
      ? existente.id
      : (
          await prisma.attendance.create({
            data: { professionalId: professional.id, ...dataProfesional },
          })
        ).id;

    if (existente) {
      await prisma.attendance.update({ where: { id: attendanceId }, data: dataProfesional });
    }

    const nombresObra = [...(horario.obras ?? []), horario.otraObra ?? ""].map((item) => item.trim()).filter(Boolean);
    const idsObra = [...new Set((await Promise.all(nombresObra.map(obraId))).filter((id): id is string => Boolean(id)))];
    nombresObra.forEach((nombre) => obrasProfesional.add(nombre));
    await prisma.attendanceObra.deleteMany({ where: { attendanceId } });
    if (idsObra.length) {
      await prisma.attendanceObra.createMany({
        data: idsObra.map((obraIdItem) => ({ attendanceId, obraId: obraIdItem })),
      });
    }

    conservados.add(attendanceId);
    rows.push({ key: horario.key, id: attendanceId, placeId });
  }

  const idsUnion = [
    ...new Set((await Promise.all([...obrasProfesional].map(obraId))).filter((id): id is string => Boolean(id))),
  ];
  await prisma.professionalObra.deleteMany({ where: { professionalId: professional.id } });
  if (idsUnion.length) {
    await prisma.professionalObra.createMany({
      data: idsUnion.map((id) => ({ professionalId: professional.id, obraId: id })),
    });
  }

  for (const item of actuales) {
    if (conservados.has(item.id)) continue;
    if (modoSecretaria && !lugaresPermitidos.has(item.placeId)) continue;
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
  revalidatePath("/panel/cargas");
  revalidatePath(`/profesional/${professional.id}`);
  revalidatePath("/buscar");
  if (modoAdmin) {
    revalidatePath("/panel/admin");
    revalidatePath(`/panel/admin/profesional/${professional.id}`);
  }
  if (modoSecretaria) {
    for (const lugar of user.places) {
      revalidatePath(`/panel/cargas/${lugar.placeId}`);
    }
  }

  return { ok: true, rows, professionalId: professional.id };
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
  if (archivo.size > FOTO_MAX_BYTES) {
    return { ok: false, error: "La imagen no puede pesar más de 2 MB." };
  }
  const formato = tipoYExtensionFoto(archivo);
  if (!formato) {
    return { ok: false, error: "Usá JPG, JPEG, JFIF, PNG, WebP o GIF." };
  }

  let photoUrl: string;
  try {
    photoUrl = await guardarImagenEntidad(
      "profesionales",
      professionalId,
      Buffer.from(await archivo.arrayBuffer()),
      formato.tipoMime,
      formato.extension,
    );
  } catch {
    return { ok: false, error: "No se pudo guardar la imagen. Probá con otro archivo o más chico." };
  }
  await prisma.professional.update({ where: { id: professionalId }, data: { photoUrl } });
  revalidatePath("/panel/profesional");
  revalidatePath(`/profesional/${professionalId}`);
  revalidatePath("/panel/cargas");
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
  await quitarImagenesEntidad("profesionales", professionalId);
  await prisma.professional.update({ where: { id: professionalId }, data: { photoUrl: "" } });
  revalidatePath("/panel/profesional");
  revalidatePath(`/profesional/${professionalId}`);
  return { ok: true };
}