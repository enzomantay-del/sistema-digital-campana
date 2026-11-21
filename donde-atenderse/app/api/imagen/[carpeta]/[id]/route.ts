import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CarpetaImagen } from "@/lib/almacenamientoImagen";

function carpetaValida(valor: string): valor is CarpetaImagen {
  return valor === "logos" || valor === "profesionales";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ carpeta: string; id: string }> },
) {
  const { carpeta, id } = await params;
  if (!carpetaValida(carpeta) || !id || id.length > 64) {
    return new NextResponse(null, { status: 404 });
  }
  const fila = await prisma.imagenAlmacenada.findUnique({
    where: { carpeta_entidadId: { carpeta, entidadId: id } },
  });
  if (!fila) {
    return new NextResponse(null, { status: 404 });
  }
  const bytes = fila.datos instanceof Buffer ? fila.datos : Buffer.from(fila.datos);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": fila.tipoMime,
      "Cache-Control": "public, max-age=86400",
    },
  });
}