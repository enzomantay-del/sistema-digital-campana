import { esAdmin, usuarioActual } from "@/lib/auth";
import { ejecutarAccionLugar, type AccionAdminLugar } from "@/lib/adminOperaciones";
import { prisma } from "@/lib/prisma";
import { redirigirSolicitud } from "@/lib/urlSolicitud";

function esAccion(valor: string): valor is AccionAdminLugar {
  return valor === "publicar" || valor === "bajar" || valor === "eliminar";
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) {
    return redirigirSolicitud(request, "/entrar");
  }
  const formData = await request.formData();
  const accion = String(formData.get("accion") ?? "");
  if (!esAccion(accion)) {
    return redirigirSolicitud(request, `/panel/lugar/${id}?error=accion`);
  }
  try {
    await ejecutarAccionLugar(accion, [id]);
  } catch (error) {
    console.error("api/lugar/admin:", error);
    return redirigirSolicitud(request, `/panel/lugar/${id}?error=accion`);
  }
  if (accion === "eliminar") {
    return redirigirSolicitud(request, "/panel/admin");
  }
  if (accion === "publicar") {
    const lugar = await prisma.place.findUnique({ where: { id }, select: { name: true } });
    const params = new URLSearchParams({ ok: "publicado", nombre: lugar?.name ?? "" });
    return redirigirSolicitud(request, `/panel/lugar/nuevo?${params.toString()}`);
  }
  return redirigirSolicitud(request, `/panel/lugar/${id}?ok=${accion}`);
}