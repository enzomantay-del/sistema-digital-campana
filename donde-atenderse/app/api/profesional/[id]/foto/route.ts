import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { guardarImagenEntidad, quitarImagenesEntidad } from "@/lib/almacenamientoImagen";
import { puedeEditarProfesional } from "@/lib/permisosProfesional";
import { usuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FOTO_MAX_BYTES, tipoYExtensionFoto } from "@/lib/validarFoto";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: professionalId } = await context.params;
  const user = await usuarioActual();
  if (!user) return NextResponse.json({ ok: false, error: "Tenés que entrar de nuevo." }, { status: 401 });
  const formData = await request.formData();
  const placeIdEnfoque = String(formData.get("placeIdEnfoque") ?? "").trim() || undefined;
  if (
    !(await puedeEditarProfesional(user, professionalId, {
      placeIdsEnCarga: placeIdEnfoque ? [placeIdEnfoque] : undefined,
    }))
  ) {
    return NextResponse.json({ ok: false, error: "Esta ficha no está en tu cuenta." }, { status: 403 });
  }
  const archivo = formData.get("foto");
  if (!archivo || !(archivo instanceof File) || archivo.size === 0) {
    return NextResponse.json({ ok: false, error: "Elegí una imagen." }, { status: 400 });
  }
  if (archivo.size > FOTO_MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "La imagen no puede pesar más de 2 MB." }, { status: 400 });
  }
  const formato = tipoYExtensionFoto(archivo);
  if (!formato) {
    return NextResponse.json({ ok: false, error: "Usá JPG, JPEG, JFIF, PNG, WebP o GIF." }, { status: 400 });
  }

  try {
    const photoUrl = await guardarImagenEntidad(
      "profesionales",
      professionalId,
      Buffer.from(await archivo.arrayBuffer()),
      formato.tipoMime,
      formato.extension,
    );
    await prisma.professional.update({ where: { id: professionalId }, data: { photoUrl } });
    revalidatePath("/panel/profesional");
    revalidatePath(`/profesional/${professionalId}`);
    revalidatePath("/panel/cargas");
    return NextResponse.json({ ok: true, photoUrl });
  } catch (error) {
    console.error("api/profesional/foto:", error);
    return NextResponse.json({ ok: false, error: "No se pudo guardar la imagen." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: professionalId } = await context.params;
  const user = await usuarioActual();
  if (!user) return NextResponse.json({ ok: false, error: "Tenés que entrar de nuevo." }, { status: 401 });
  const url = new URL(request.url);
  const placeIdEnfoque = url.searchParams.get("placeIdEnfoque")?.trim() || undefined;
  if (
    !(await puedeEditarProfesional(user, professionalId, {
      placeIdsEnCarga: placeIdEnfoque ? [placeIdEnfoque] : undefined,
    }))
  ) {
    return NextResponse.json({ ok: false, error: "Esta ficha no está en tu cuenta." }, { status: 403 });
  }
  await quitarImagenesEntidad("profesionales", professionalId);
  await prisma.professional.update({ where: { id: professionalId }, data: { photoUrl: "" } });
  revalidatePath("/panel/profesional");
  revalidatePath(`/profesional/${professionalId}`);
  return NextResponse.json({ ok: true });
}