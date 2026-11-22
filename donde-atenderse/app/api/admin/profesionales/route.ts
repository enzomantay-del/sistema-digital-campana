import { esAdmin, usuarioActual } from "@/lib/auth";
import {
  ejecutarAccionProfesional,
  idsDesdeFormulario,
  type AccionAdminProfesional,
} from "@/lib/adminOperaciones";
import { redirigirSolicitud } from "@/lib/urlSolicitud";

function esAccion(valor: string): valor is AccionAdminProfesional {
  return valor === "publicar" || valor === "bajar" || valor === "eliminar";
}

export async function POST(request: Request) {
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) {
    return redirigirSolicitud(request, "/entrar");
  }
  const formData = await request.formData();
  const accion = String(formData.get("accion") ?? "");
  const ids = idsDesdeFormulario(formData);
  if (!esAccion(accion) || ids.length === 0) {
    return redirigirSolicitud(request, "/panel/admin");
  }
  try {
    await ejecutarAccionProfesional(accion, ids);
  } catch (error) {
    console.error("api/admin/profesionales:", error);
    return redirigirSolicitud(request, "/panel/admin?error=accion");
  }
  return redirigirSolicitud(request, `/panel/admin?ok=${accion}`);
}