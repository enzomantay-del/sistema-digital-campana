import { headers } from "next/headers";

export async function ipCliente() {
  const h = await headers();
  const reenviada = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return reenviada || h.get("x-real-ip")?.trim() || "desconocido";
}