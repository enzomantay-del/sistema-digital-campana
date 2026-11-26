import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const COOKIE = "sesion";

export type UsuarioSesion = NonNullable<Awaited<ReturnType<typeof usuarioActual>>>;

function claveSesion() {
  const valor = process.env.AUTH_SECRET?.trim() ?? "";
  if (valor.length < 32) return null;
  if (process.env.NODE_ENV === "production" && valor === "cambia-esta-frase-por-una-larga-y-minima-de-32-caracteres") {
    return null;
  }
  return new TextEncoder().encode(valor);
}

export function cuentasDisponibles() {
  return claveSesion() !== null;
}

export function esAdmin(usuario: { role: string } | null | undefined) {
  return usuario?.role === "admin";
}

export function esSecretaria(usuario: { role: string } | null | undefined) {
  return usuario?.role === "secretaria";
}

export function esProfesional(usuario: { role: string } | null | undefined) {
  return usuario?.role === "profesional";
}

export function destinoPanelTrasLogin(usuario: { role: string }) {
  if (esAdmin(usuario)) return "/panel/admin";
  if (esSecretaria(usuario)) return "/panel/cargas";
  return "/panel/profesional";
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
  jar.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  });
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
    return await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        professional: true,
        places: { include: { place: true }, orderBy: { place: { name: "asc" } } },
      },
    });
  } catch (error) {
    console.error("usuarioActual:", error);
    return null;
  }
}

export async function requiereUsuario() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  return usuario;
}

export async function requiereAdmin() {
  const usuario = await requiereUsuario();
  if (!esAdmin(usuario)) redirect("/panel");
  return usuario;
}
