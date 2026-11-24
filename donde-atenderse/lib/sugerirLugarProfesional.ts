import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";
import { obrasModoDefault } from "@/lib/placeObras";
import { lugarPermiteCargaSecretaria } from "@/lib/lugarAsignacion";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { esProfesional, usuarioActual } from "@/lib/auth";

export type ResultadoSugerenciaLugar =
  | { ok: true; placeId: string; name: string; locality: string; kind: string }
  | { ok: false; error: string };

export async function sugerirLugarProfesional(input: {
  name: string;
  kind: string;
  locality: string;
  address?: string;
}): Promise<ResultadoSugerenciaLugar> {
  const user = await usuarioActual();
  if (!user) return { ok: false, error: "Tenés que entrar de nuevo." };
  if (!esProfesional(user) && !user.professional) {
    return { ok: false, error: "Solo los profesionales pueden sugerir un lugar nuevo." };
  }

  const name = input.name.trim();
  const kind = input.kind.trim();
  const locality = input.locality.trim();
  const address = (input.address ?? "").trim();

  if (name.length < 2) return { ok: false, error: "Escribí el nombre del lugar." };
  if (!TIPOS_LUGAR.some((tipo) => tipo.id === kind)) return { ok: false, error: "Elegí un tipo de lugar." };
  if (!LOCALIDADES.includes(locality as (typeof LOCALIDADES)[number])) {
    return { ok: false, error: "Elegí una localidad del corredor." };
  }
  if (!lugarPermiteCargaSecretaria(kind)) {
    return { ok: false, error: "Las farmacias las carga la administración." };
  }

  const duplicado = await prisma.place.findFirst({
    where: {
      published: true,
      name: { equals: name },
      locality,
    },
    select: { id: true, name: true },
  });
  if (duplicado) {
    return {
      ok: false,
      error: `«${duplicado.name}» ya está publicado en ${locality}. Buscálo en la lista de lugares.`,
    };
  }

  try {
    const place = await prisma.place.create({
      data: {
        name,
        kind,
        locality,
        address,
        published: false,
        suggestedById: user.id,
        obrasMode: obrasModoDefault(kind),
      },
    });
    revalidatePath("/panel/profesional");
    revalidatePath("/panel/admin");
    return { ok: true, placeId: place.id, name: place.name, locality: place.locality, kind: place.kind };
  } catch (error) {
    console.error("sugerirLugarProfesional:", error);
    return { ok: false, error: "No se pudo registrar la sugerencia. Probá de nuevo." };
  }
}