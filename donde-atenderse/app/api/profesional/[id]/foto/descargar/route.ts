import { NextResponse } from "next/server";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { leerImagenEntidad } from "@/lib/almacenamientoImagen";
import { nombreArchivoFotoDescarga } from "@/lib/nombreArchivoFoto";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: professionalId } = await context.params;
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) {
    return new NextResponse(null, { status: 404 });
  }

  const persona = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { fullName: true, photoUrl: true },
  });
  if (!persona?.photoUrl?.trim()) {
    return new NextResponse(null, { status: 404 });
  }

  const imagen = await leerImagenEntidad("profesionales", professionalId);
  if (!imagen) {
    return new NextResponse(null, { status: 404 });
  }

  const nombre = nombreArchivoFotoDescarga(persona.fullName, imagen.extension);
  return new NextResponse(new Uint8Array(imagen.contenido), {
    headers: {
      "Content-Type": imagen.tipoMime,
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "private, no-store",
    },
  });
}