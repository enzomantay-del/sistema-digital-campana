import { headers } from "next/headers";

/** IP para rate limit. No confiamos en X-Forwarded-For (el cliente puede falsificarlo). */
export async function ipCliente() {
  const h = await headers();
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  return "desconocido";
}