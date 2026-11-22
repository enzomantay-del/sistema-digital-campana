import { NextResponse } from "next/server";
import { guardarImagenEntidad, quitarImagenesEntidad } from "@/lib/almacenamientoImagen";
import { usuarioActual } from "@/lib/auth";
import { esAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LOGO_MAX_BYTES = 2 * 1024 * 1024;

function tipoLogo(archivo: File): { mime: string; extension: string } | null {
  const tipos: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/jfif": "jpg",
    "image/pjpeg": "jpg",
  };
  if (tipos[archivo.type]) return { mime: archivo.type === "image/jfif" || archivo.type === "image/pjpeg" ? "image/jpeg" : archivo.type, extension: tipos[archivo.type] };
  const nombre = archivo.name.toLowerCase();
  if (nombre.endsWith(".jfif") || nombre.endsWith(".jpe") || nombre.endsWith(".jpg") || nombre.endsWith(".jpeg")) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (nombre.endsWith(".png")) return { mime: "image/png", extension: "png" };
  if (nombre.endsWith(".webp")) return { mime: "image/webp", extension: "webp" };
  if (nombre.endsWith(".gif")) return { mime: "image/gif", extension: "gif" };
  return null;
}

async function puedeEditar(placeId: string, user: NonNullable<Awaited<ReturnType<typeof usuarioActual>>>) {
  if (esAdmin(user)) return true;
  return user.places.some((item) => item.placeId === placeId);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: placeId } = await context.params;
  const user = await usuarioActual();
  if (!user) return NextResponse.json({ ok: false, error: "Tenés que entrar de nuevo." }, { status: 401 });
  if (!(await puedeEditar(placeId, user))) {
    return NextResponse.json({ ok: false, error: "Esta ficha no está en tu cuenta." }, { status: 403 });
  }

  const formData = await request.formData();
  const archivo = formData.get("logo");
  if (!archivo || !(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json({ ok: false, error: "Elegí una imagen." }, { status: 400 });
  }
  const formato = tipoLogo(archivo);
  if (!formato) return NextResponse.json({ ok: false, error: "Usá JPG, PNG, WebP, GIF o JFIF." }, { status: 400 });
  if (archivo.size > LOGO_MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "La imagen no puede pesar más de 2 MB." }, { status: 400 });
  }

  try {
    const logoUrl = await guardarImagenEntidad(
      "logos",
      placeId,
      Buffer.from(await archivo.arrayBuffer()),
      formato.mime,
      formato.extension,
    );
    await prisma.place.update({ where: { id: placeId }, data: { logoUrl } });
    return NextResponse.json({ ok: true, logoUrl });
  } catch (error) {
    console.error("api/lugar/logo:", error);
    return NextResponse.json({ ok: false, error: "No se pudo guardar la imagen." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: placeId } = await context.params;
  const user = await usuarioActual();
  if (!user) return NextResponse.json({ ok: false, error: "Tenés que entrar de nuevo." }, { status: 401 });
  if (!(await puedeEditar(placeId, user))) {
    return NextResponse.json({ ok: false, error: "Esta ficha no está en tu cuenta." }, { status: 403 });
  }
  await quitarImagenesEntidad("logos", placeId);
  await prisma.place.update({ where: { id: placeId }, data: { logoUrl: "" } });
  return NextResponse.json({ ok: true });
}