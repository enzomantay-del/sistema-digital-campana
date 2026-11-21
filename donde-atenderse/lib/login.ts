import bcrypt from "bcryptjs";
import { bootstrapAdminDesdeSecrets } from "@/lib/adminBootstrap";
import { ipCliente } from "@/lib/cliente";
import { crearSesion, cuentasDisponibles, esAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bloqueoAuthActivo, limpiarFallosAuth, registrarFalloAuth } from "@/lib/rateLimit";

export type ResultadoLogin = { ok: true; irA: string } | { ok: false; error: string };

const LIMITE_LOGIN = { max: 8, windowMs: 15 * 60 * 1000 };

function correo(valor: FormDataEntryValue | null) {
  return String(valor ?? "").trim().toLowerCase();
}

export async function procesarEntrada(formData: FormData): Promise<ResultadoLogin> {
  if (!cuentasDisponibles()) {
    return { ok: false, error: "En este momento no se pueden usar las cuentas." };
  }
  const email = correo(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  await bootstrapAdminDesdeSecrets();

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