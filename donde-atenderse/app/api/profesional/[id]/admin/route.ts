import { esAdmin, usuarioActual } from "@/lib/auth";
import { ejecutarAccionProfesional, type AccionAdminProfesional } from "@/lib/adminOperaciones";
import { redirigirSolicitud } from "@/lib/urlSolicitud";

function esAccion(valor: string): valor is AccionAdminProfesional {
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
    return redirigirSolicitud(request, `/panel/admin/profesional/${id}`);
  }
  try {
    await ejecutarAccionProfesional(accion, [id]);
  } catch (error) {
    console.error("api/profesional/admin:", error);
    return redirigirSolicitud(request, `/panel/admin/profesional/${id}?error=accion`);
  }
  const destino = accion === "eliminar" ? "/panel/admin" : `/panel/admin/profesional/${id}?ok=${accion}`;
  return redirigirSolicitud(request, destino);
}