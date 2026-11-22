"use server";

import { revalidatePath } from "next/cache";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { importarTurneroFarmacia, type ResultadoImportarTurnero } from "@/lib/turneroFarmacia";

export type { ResultadoImportarTurnero };

export async function importarTurnero(
  _estado: ResultadoImportarTurnero | null,
  formData: FormData,
): Promise<ResultadoImportarTurnero> {
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) return { ok: false, error: "Solo la administración puede cargar el turnero." };

  const archivo = formData.get("archivo");
  const pegado = String(formData.get("texto") ?? "").trim();
  let texto = pegado;
  if (archivo instanceof File && archivo.size > 0) {
    texto = await archivo.text();
  }
  if (!texto.trim()) return { ok: false, error: "Pegá el turnero o subí el archivo." };

  const resultado = await importarTurneroFarmacia(texto);
  if (resultado.ok) {
    revalidatePath("/farmacia");
    revalidatePath("/");
  }
  return resultado;
}