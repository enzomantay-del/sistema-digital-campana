import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const COOKIE = "sesion";

function claveSesion() {
  const valor = process.env.AUTH_SECRET?.trim() ?? "";
  if (valor.length < 32) return null;
  return new TextEncoder().encode(valor);
}

export function cuentasDisponibles() {
  return claveSesion() !== null;
}

export async function crearSesion(userId: string) {
  const clave = claveSesion();
  if (!clave) return false;
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(clave);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function cerrarSesion() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function usuarioActual() {
  const clave = claveSesion();
  if (!clave) return null;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, clave);
    if (!payload.sub) return null;
    return prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        professional: true,
        places: { include: { place: true }, orderBy: { place: { name: "asc" } } },
      },
    });
  } catch {
    return null;
  }
}
