import { procesarEntrada } from "@/lib/login";
import { redirigirSolicitud } from "@/lib/urlSolicitud";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = await procesarEntrada(formData);
    if (!resultado.ok) {
      return redirigirSolicitud(request, `/entrar?error=${encodeURIComponent(resultado.error)}`);
    }
    return redirigirSolicitud(request, resultado.irA);
  } catch (error) {
    console.error("api/login:", error);
    return redirigirSolicitud(
      request,
      `/entrar?error=${encodeURIComponent("No pudimos completar el ingreso. Probá de nuevo en un minuto.")}`,
    );
  }
}