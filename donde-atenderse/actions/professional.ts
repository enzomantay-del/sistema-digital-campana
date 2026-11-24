"use server";

import { guardarImagenEntidad, quitarImagenesEntidad } from "@/lib/almacenamientoImagen";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { esAdmin, esSecretaria, usuarioActual } from "@/lib/auth";
import type { BorradorProfesional } from "@/lib/draft";
import { campoDesdeEspecialidades } from "@/lib/especialidades";
import { claveMatricula } from "@/lib/matricula";
import { camposLegacyDesdeHorario } from "@/lib/professionalSchedule";
import { horarioLugarParaGuardar, notaHorarioParaGuardar, validarHorarioLugar } from "@/lib/placeSchedule";
import { validarBorradorProfesional } from "@/lib/validarProfesional";

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
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  if (esSecretaria(user)) return { ok: false, error: "Las secretarias cargan desde el panel de su lugar." };
  return guardarProfesionalInterno(user, borrador, null, "propio");
}

export async function guardarProfesionalAdmin(
  professionalId: string,
  borrador: BorradorProfesional,
): Promise<GuardadoProfesional> {
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) return { ok: false, error: "Solo administración puede editar otra ficha." };
  return guardarProfesionalInterno(user, borrador, professionalId, "admin");
}

export async function guardarProfesionalSecretaria(
  professionalId: string | null,
  borrador: BorradorProfesional,
): Promise<GuardadoProfesional> {
  const user = await usuarioActual();
  if (!user || !esSecretaria(user)) return { ok: false, error: "Solo secretarias con lugar asignado." };
  if (user.places.length === 0) return { ok: false, error: "No tenés un lugar asignado." };
  return guardarProfesionalInterno(user, borrador, professionalId, "secretaria");
}

async function guardarProfesionalInterno(
  user: NonNullable<Awaited<ReturnType<typeof usuarioActual>>>,
  borrador: BorradorProfesional,
  professionalId: string | null,
  modo: ModoGuardado,
): Promise<GuardadoProfesional> {
  const modoAdmin = modo === "admin";
  const modoSecretaria = modo === "secretaria";
  const lugaresPermitidos = new Set(
    modoSecretaria ? user.places.map((item) => item.placeId) : user.places.map((item) => item.placeId),
  );

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
        error: `Ya existe la ficha de ${duplicado.fullName} con esa matrícula. Buscá por matrícula y cargá solo el horario en tu lugar.`,
      };
    }
  }

  const listaEspecialidades = [
    ...(borrador.specialties ?? []),
    ...(borrador.specialty.trim() ? [borrador.specialty.trim()] : []),
  ].filter(Boolean);
  const specialtiesCampo = campoDesdeEspecialidades(listaEspecialidades);
  const specialtyPrincipal = listaEspecialidades[0] ?? "";

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
  const conservados = new Set<string>();
  const rows: { key: string; id: string; placeId: string }[] = [];
  const ahora = new Date();

  for (const horario of borrador.horarios) {
    if (horario.sugerido) {
      return { ok: false, error: "Los lugares los carga solo la administración. Elegí un lugar ya publicado." };
    }

    let placeId = horario.placeId;
    if (!placeId) continue;

    const lugar = await prisma.place.findUnique({ where: { id: placeId } });
    if (!lugar) return { ok: false, error: "Ese lugar ya no está." };

    if (modoSecretaria && !lugaresPermitidos.has(placeId)) {
      return { ok: false, error: "Solo podés cargar horarios en los lugares que te asignó la administración." };
    }
    if (!modoAdmin && !lugar.published) {
      return { ok: false, error: "Ese lugar todavía no está publicado." };
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
  if (user.professional?.id === professionalId) return true;
  if (esSecretaria(user)) {
    const atiende = await prisma.attendance.findFirst({
      where: {
        professionalId,
        placeId: { in: user.places.map((item) => item.placeId) },
      },
    });
    if (atiende) return true;
    const recien = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { createdAt: true, attendances: { select: { placeId: true } } },
    });
    if (!recien) return false;
    const sinAtenciones = recien.attendances.length === 0;
    const hacePoco = Date.now() - recien.createdAt.getTime() < 2 * 60 * 60 * 1000;
    return sinAtenciones && hacePoco;
  }
  return false;
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

  let photoUrl: string;
  try {
    photoUrl = await guardarImagenEntidad(
      "profesionales",
      professionalId,
      Buffer.from(await archivo.arrayBuffer()),
      archivo.type,
      extension,
    );
  } catch {
    return { ok: false, error: "No se pudo guardar la imagen. Revisá el almacenamiento en la nube." };
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