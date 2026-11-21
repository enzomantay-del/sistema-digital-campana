"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cerrarSesion, crearSesion, cuentasDisponibles, esAdmin } from "@/lib/auth";
import { ipCliente } from "@/lib/cliente";
import { correoReservadoParaAdmin } from "@/lib/config";
import { bloqueoAuthActivo, limpiarFallosAuth, registrarFalloAuth } from "@/lib/rateLimit";

export type Resultado = { ok: true; irA?: string } | { ok: false; error: string };

const LIMITE_LOGIN = { max: 8, windowMs: 15 * 60 * 1000 };
const LIMITE_REGISTRO_IP = { max: 5, windowMs: 60 * 60 * 1000 };

function correo(valor: FormDataEntryValue | null) {
  return String(valor ?? "").trim().toLowerCase();
}

function soloDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export async function entrar(_estado: Resultado | null, formData: FormData): Promise<Resultado> {
  try {
    return await entrarInterno(formData);
  } catch (error) {
    console.error("entrar:", error);
    return { ok: false, error: "No pudimos completar el ingreso. Si acaba de publicarse el sitio, esperá un minuto y volvé a probar." };
  }
}

async function entrarInterno(formData: FormData): Promise<Resultado> {
  if (!cuentasDisponibles()) {
    return { ok: false, error: "En este momento no se pueden usar las cuentas." };
  }
  const email = correo(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  const bloqueoCorreo = await bloqueoAuthActivo(`login:${email}`, LIMITE_LOGIN);
  const ip = await ipCliente();
  const bloqueoIp = await bloqueoAuthActivo(`login-ip:${ip}`, { max: 30, windowMs: 15 * 60 * 1000 });
  const minutos = bloqueoCorreo ?? bloqueoIp;
  if (minutos) {
    return {
      ok: false,
      error: `Demasiados intentos. Probá de nuevo en ${minutos} minuto${minutos === 1 ? "" : "s"}.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    await registrarFalloAuth(`login:${email}`, LIMITE_LOGIN);
    await registrarFalloAuth(`login-ip:${ip}`, { max: 30, windowMs: 15 * 60 * 1000 });
    return { ok: false, error: "El correo o la contraseña no coinciden." };
  }
  await limpiarFallosAuth(`login:${email}`);

  const sesion = await crearSesion(user.id);
  if (!sesion) return { ok: false, error: "En este momento no se pueden usar las cuentas." };
  return { ok: true, irA: esAdmin(user) ? "/panel/admin" : "/panel" };
}

export async function crearCuenta(_estado: Resultado | null, formData: FormData): Promise<Resultado> {
  const name = String(formData.get("name") ?? "").trim();
  const email = correo(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const license = String(formData.get("license") ?? "").trim().slice(0, 40);
  const whatsapp = soloDigitos(String(formData.get("whatsapp") ?? ""));
  const aceptaTerminos = formData.get("aceptaTerminos") === "on";

  if (!cuentasDisponibles()) {
    return { ok: false, error: "En este momento no se pueden usar las cuentas." };
  }

  const ip = await ipCliente();
  const bloqueoRegistro = await bloqueoAuthActivo(`registro:${ip}`, LIMITE_REGISTRO_IP);
  if (bloqueoRegistro) {
    return {
      ok: false,
      error: `Demasiados registros desde esta conexión. Probá en ${bloqueoRegistro} minuto${bloqueoRegistro === 1 ? "" : "s"}.`,
    };
  }

  if (name.length < 2) return { ok: false, error: "Escribí tu nombre." };
  if (!email.includes("@")) return { ok: false, error: "El correo no parece válido." };
  if (correoReservadoParaAdmin(email)) {
    return { ok: false, error: "Ese correo está reservado para la administración." };
  }
  if (password.length < 8) return { ok: false, error: "La contraseña necesita al menos 8 caracteres." };
  if (license.length < 3) return { ok: false, error: "Indicá tu matrícula." };
  if (whatsapp.length < 10) return { ok: false, error: "Indicá un WhatsApp con código de área." };
  if (!aceptaTerminos) return { ok: false, error: "Tenés que aceptar los términos de uso." };

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) return { ok: false, error: "Ya hay una cuenta con ese correo." };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "profesional" },
  });

  await prisma.professional.create({
    data: {
      userId: user.id,
      fullName: name,
      license,
      whatsapp,
      published: false,
      reviewed: false,
    },
  });

  await registrarFalloAuth(`registro:${ip}`, LIMITE_REGISTRO_IP);

  const sesion = await crearSesion(user.id);
  if (!sesion) return { ok: false, error: "En este momento no se pueden usar las cuentas." };
  return { ok: true, irA: "/panel" };
}

export async function salir() {
  await cerrarSesion();
  redirect("/");
}