import { cerrarSesion } from "@/lib/auth";
import { redirigirSolicitud } from "@/lib/urlSolicitud";

export async function POST(request: Request) {
  try {
    await cerrarSesion();
    return redirigirSolicitud(request, "/entrar");
  } catch (error) {
    console.error("api/salir:", error);
    return redirigirSolicitud(
      request,
      `/entrar?error=${encodeURIComponent("No pudimos cerrar la sesión. Probá recargar la página o borrar las cookies de este sitio.")}`,
    );
  }
}