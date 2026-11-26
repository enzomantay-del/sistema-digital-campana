import { prisma } from "@/lib/prisma";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";
import { obrasModoDefault } from "@/lib/placeObras";

export type ResultadoNuevoLugar =
  | { ok: true; placeId: string }
  | { ok: false; codigo: "sesion" | "permiso" | "nombre" | "tipo" | "localidad" | "servidor" };

export async function procesarNuevoLugar(formData: FormData): Promise<ResultadoNuevoLugar> {
  const user = await usuarioActual();
  if (!user) return { ok: false, codigo: "sesion" };
  if (!esAdmin(user)) return { ok: false, codigo: "permiso" };

  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const locality = String(formData.get("locality") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (name.length < 2) return { ok: false, codigo: "nombre" };
  if (!TIPOS_LUGAR.some((tipo) => tipo.id === kind)) return { ok: false, codigo: "tipo" };
  if (!LOCALIDADES.includes(locality as (typeof LOCALIDADES)[number])) return { ok: false, codigo: "localidad" };

  try {
    const place = await prisma.place.create({
      data: { name, kind, locality, address, published: true, obrasMode: obrasModoDefault(kind) },
    });
    return { ok: true, placeId: place.id };
  } catch (error) {
    console.error("procesarNuevoLugar:", error);
    return { ok: false, codigo: "servidor" };
  }
}

export function destinoErrorNuevoLugar(
  codigo: Exclude<ResultadoNuevoLugar, { ok: true }>["codigo"],
  origin: string,
) {
  const destinos: Record<string, string> = {
    sesion: "/entrar",
    permiso: "/panel",
    nombre: "/panel/lugar/nuevo?error=nombre",
    tipo: "/panel/lugar/nuevo?error=tipo",
    localidad: "/panel/lugar/nuevo?error=localidad",
    servidor: "/panel/lugar/nuevo?error=servidor",
  };
  return new URL(destinos[codigo] ?? "/panel/lugar/nuevo?error=servidor", origin);
}