import { destinoErrorNuevoLugar, procesarNuevoLugar } from "@/lib/nuevoLugar";
import { origenSolicitud, redirigirSolicitud } from "@/lib/urlSolicitud";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = await procesarNuevoLugar(formData);
    if (!resultado.ok) {
      const destino = destinoErrorNuevoLugar(resultado.codigo, origenSolicitud(request));
      return redirigirSolicitud(request, `${destino.pathname}${destino.search}`);
    }
    return redirigirSolicitud(request, `/panel/lugar/${resultado.placeId}`);
  } catch (error) {
    console.error("api/lugar/crear:", error);
    return redirigirSolicitud(request, "/panel/lugar/nuevo?error=servidor");
  }
}