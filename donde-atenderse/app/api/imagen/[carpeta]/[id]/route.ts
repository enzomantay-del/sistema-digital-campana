import { NextResponse } from "next/server";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { mostrarDatosEjemplo } from "@/lib/config";
import type { CarpetaImagen } from "@/lib/almacenamientoImagen";
import { puedeEditarProfesional } from "@/lib/permisosProfesional";
import { prisma } from "@/lib/prisma";

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

  if (carpeta === "profesionales") {
    const persona = await prisma.professional.findUnique({
      where: { id },
      select: { published: true, example: true },
    });
    if (!persona) {
      return new NextResponse(null, { status: 404 });
    }
    const visibleEnWeb = persona.published && (!persona.example || mostrarDatosEjemplo());
    if (!visibleEnWeb) {
      const user = await usuarioActual();
      if (!user || !(await puedeEditarProfesional(user, id))) {
        return new NextResponse(null, { status: 404 });
      }
    }
  }

  if (carpeta === "logos") {
    const lugar = await prisma.place.findUnique({
      where: { id },
      select: { published: true },
    });
    if (!lugar?.published) {
      const user = await usuarioActual();
      const puede =
        user &&
        (esAdmin(user) || user.places.some((item) => item.placeId === id) || (await puedeEditarLugarBorrador(user, id)));
      if (!puede) {
        return new NextResponse(null, { status: 404 });
      }
    }
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

async function puedeEditarLugarBorrador(user: NonNullable<Awaited<ReturnType<typeof usuarioActual>>>, placeId: string) {
  const lugar = await prisma.place.findUnique({
    where: { id: placeId },
    select: { suggestedById: true, published: true },
  });
  return Boolean(lugar && !lugar.published && lugar.suggestedById === user.id);
}