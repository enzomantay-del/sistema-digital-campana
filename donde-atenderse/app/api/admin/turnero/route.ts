import { revalidatePath } from "next/cache";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { importarTurneroFarmacia } from "@/lib/turneroFarmacia";
import { redirigirSolicitud } from "@/lib/urlSolicitud";

export async function POST(request: Request) {
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) {
    return redirigirSolicitud(request, "/entrar");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("api/admin/turnero: formData", error);
    return redirigirSolicitud(request, "/panel/admin?turnero_error=formulario");
  }

  const archivo = formData.get("archivo");
  const pegado = String(formData.get("texto") ?? "").trim();
  let texto = pegado;
  if (archivo instanceof File && archivo.size > 0) {
    try {
      texto = await archivo.text();
    } catch (error) {
      console.error("api/admin/turnero: leer archivo", error);
      return redirigirSolicitud(request, "/panel/admin?turnero_error=archivo");
    }
  }
  if (!texto.trim()) {
    return redirigirSolicitud(request, "/panel/admin?turnero_error=vacio");
  }

  try {
    const resultado = await importarTurneroFarmacia(texto);
    if (!resultado.ok) {
      return redirigirSolicitud(
        request,
        `/panel/admin?turnero_error=${encodeURIComponent(resultado.error.slice(0, 200))}`,
      );
    }
    revalidatePath("/farmacia");
    revalidatePath("/");
    revalidatePath("/panel/admin");
    const params = new URLSearchParams({
      turnero_ok: "1",
      cargados: String(resultado.cargados),
    });
    if (resultado.sinCoincidencia.length > 0) {
      params.set("turnero_sin", resultado.sinCoincidencia.slice(0, 12).join("|"));
    }
    if (resultado.invalidas.length > 0) {
      params.set("turnero_invalidas", resultado.invalidas.slice(0, 5).join("|"));
    }
    return redirigirSolicitud(request, `/panel/admin?${params.toString()}`);
  } catch (error) {
    console.error("api/admin/turnero:", error);
    return redirigirSolicitud(request, "/panel/admin?turnero_error=servidor");
  }
}