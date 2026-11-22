import { esAdmin, usuarioActual } from "@/lib/auth";
import {
  ejecutarAccionLugar,
  idsDesdeFormulario,
  type AccionAdminLugar,
} from "@/lib/adminOperaciones";
import { redirigirSolicitud } from "@/lib/urlSolicitud";

function esAccion(valor: string): valor is AccionAdminLugar {
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
    await ejecutarAccionLugar(accion, ids);
  } catch (error) {
    console.error("api/admin/lugares:", error);
    return redirigirSolicitud(request, "/panel/admin?error=accion");
  }
  if (accion === "publicar") {
    const params = new URLSearchParams({ ok: "publicado", n: String(ids.length) });
    return redirigirSolicitud(request, `/panel/lugar/nuevo?${params.toString()}`);
  }
  if (accion === "eliminar") {
    return redirigirSolicitud(request, "/panel/admin?ok=eliminar");
  }
  return redirigirSolicitud(request, "/panel/admin?ok=bajar");
}