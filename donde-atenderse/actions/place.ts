"use server";

import { guardarImagenEntidad, quitarImagenesEntidad } from "@/lib/almacenamientoImagen";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { esAdmin, usuarioActual } from "@/lib/auth";
import type { BorradorLugar } from "@/lib/draft";
import { guardarLugarCore, type GuardadoLugar } from "@/lib/guardarLugarCore";

export type { GuardadoLugar };

async function puedeEditarLugar(user: NonNullable<Awaited<ReturnType<typeof usuarioActual>>>, placeId: string) {
  if (esAdmin(user)) return true;
  return user.places.some((item) => item.placeId === placeId);
}

/** @deprecated Usar POST /api/lugar/crear (formulario en /panel/lugar/nuevo). */
export async function crearLugar(formData: FormData) {
  const { procesarNuevoLugar } = await import("@/lib/nuevoLugar");
  const resultado = await procesarNuevoLugar(formData);
  if (!resultado.ok) {
    const errores: Record<string, string> = {
      sesion: "/entrar",
      permiso: "/panel",
      nombre: "/panel/lugar/nuevo?error=nombre",
      tipo: "/panel/lugar/nuevo?error=tipo",
      localidad: "/panel/lugar/nuevo?error=localidad",
      servidor: "/panel/lugar/nuevo?error=servidor",
    };
    redirect(errores[resultado.codigo] ?? "/panel/lugar/nuevo?error=servidor");
  }
  redirect(`/panel/lugar/${resultado.placeId}`);
}

export async function guardarLugar(placeId: string, borrador: BorradorLugar): Promise<GuardadoLugar> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  return guardarLugarCore(placeId, borrador, user);
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
  const esJfif = archivo.name.toLowerCase().endsWith(".jfif") || archivo.type === "image/jfif";
  if (!LOGO_TIPOS.has(archivo.type) && !esJfif && archivo.type !== "image/pjpeg") {
    return { ok: false, error: "Usá JPG, PNG, WebP, GIF o JFIF." };
  }
  if (archivo.size > LOGO_MAX_BYTES) {
    return { ok: false, error: "La imagen no puede pesar más de 2 MB." };
  }
  let mime = archivo.type;
  let extension = extensionLogo(archivo.type);
  if (esJfif || archivo.type === "image/pjpeg" || archivo.type === "image/jfif") {
    mime = "image/jpeg";
    extension = "jpg";
  }
  if (!extension) return { ok: false, error: "Formato de imagen no admitido." };

  let logoUrl: string;
  try {
    logoUrl = await guardarImagenEntidad(
      "logos",
      placeId,
      Buffer.from(await archivo.arrayBuffer()),
      mime,
      extension,
    );
  } catch {
    return { ok: false, error: "No se pudo guardar la imagen. Revisá el almacenamiento en la nube." };
  }
  await prisma.place.update({ where: { id: placeId }, data: { logoUrl } });
  return { ok: true, logoUrl };
}

export async function quitarLogoLugar(placeId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  if (!(await puedeEditarLugar(user, placeId))) {
    return { ok: false, error: "Esta ficha no está en tu cuenta." };
  }
  await quitarImagenesEntidad("logos", placeId);
  await prisma.place.update({ where: { id: placeId }, data: { logoUrl: "" } });
  return { ok: true };
}
