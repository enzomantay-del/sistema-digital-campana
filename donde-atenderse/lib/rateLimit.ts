import { prisma } from "./prisma";

type Opciones = { max: number; windowMs: number };

async function conPrisma<T>(fallback: T, operacion: () => Promise<T>): Promise<T> {
  try {
    return await operacion();
  } catch (error) {
    console.error("Rate limit (se omite):", error);
    return fallback;
  }
}

export async function bloqueoAuthActivo(key: string, opciones: Opciones): Promise<number | null> {
  return conPrisma(null, async () => {
    const ahora = new Date();
    const bucket = await prisma.authRateLimit.findUnique({ where: { key } });
    if (!bucket || bucket.resetAt <= ahora) return null;
    if (bucket.attempts < opciones.max) return null;
    return Math.max(1, Math.ceil((bucket.resetAt.getTime() - ahora.getTime()) / 60_000));
  });
}

export async function registrarFalloAuth(key: string, opciones: Opciones) {
  await conPrisma(undefined, async () => {
    const ahora = new Date();
    const resetAt = new Date(ahora.getTime() + opciones.windowMs);
    const bucket = await prisma.authRateLimit.findUnique({ where: { key } });
    if (!bucket || bucket.resetAt <= ahora) {
      await prisma.authRateLimit.upsert({
        where: { key },
        create: { key, attempts: 1, resetAt },
        update: { attempts: 1, resetAt },
      });
      return;
    }
    await prisma.authRateLimit.update({
      where: { key },
      data: { attempts: bucket.attempts + 1 },
    });
  });
}

export async function limpiarFallosAuth(key: string) {
  await conPrisma(undefined, async () => {
    await prisma.authRateLimit.deleteMany({ where: { key } });
  });
}