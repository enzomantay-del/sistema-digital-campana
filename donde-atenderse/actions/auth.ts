"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cerrarSesion, crearSesion, cuentasDisponibles, esAdmin } from "@/lib/auth";

export type Resultado = { ok: true } | { ok: false; error: string };

function correo(valor: FormDataEntryValue | null) {
  return String(valor ?? "").trim().toLowerCase();
}

export async function entrar(_estado: Resultado | null, formData: FormData): Promise<Resultado> {
  if (!cuentasDisponibles()) {
    return { ok: false, error: "En este momento no se pueden usar las cuentas." };
  }
  const email = correo(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { ok: false, error: "El correo o la contraseña no coinciden." };
  }
  const sesion = await crearSesion(user.id);
  if (!sesion) return { ok: false, error: "En este momento no se pueden usar las cuentas." };
  redirect(esAdmin(user) ? "/panel/admin" : "/panel");
}

export async function crearCuenta(_estado: Resultado | null, formData: FormData): Promise<Resultado> {
  const name = String(formData.get("name") ?? "").trim();
  const email = correo(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const license = String(formData.get("license") ?? "").trim().slice(0, 40);

  if (!cuentasDisponibles()) {
    return { ok: false, error: "En este momento no se pueden usar las cuentas." };
  }
  if (name.length < 2) return { ok: false, error: "Escribí tu nombre." };
  if (!email.includes("@")) return { ok: false, error: "El correo no parece válido." };
  if (password.length < 8) return { ok: false, error: "La contraseña necesita al menos 8 caracteres." };

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
      published: false,
      reviewed: false,
    },
  });

  const sesion = await crearSesion(user.id);
  if (!sesion) return { ok: false, error: "En este momento no se pueden usar las cuentas." };
  redirect("/panel");
}

export async function salir() {
  await cerrarSesion();
  redirect("/");
}
