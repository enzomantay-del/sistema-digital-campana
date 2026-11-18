"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cerrarSesion, crearSesion } from "@/lib/auth";
import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";

export type Resultado = { ok: true } | { ok: false; error: string };

function correo(valor: FormDataEntryValue | null) {
  return String(valor ?? "").trim().toLowerCase();
}

export async function entrar(_estado: Resultado | null, formData: FormData): Promise<Resultado> {
  const email = correo(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { ok: false, error: "El correo o la contraseña no coinciden." };
  }
  await crearSesion(user.id);
  redirect("/panel");
}

export async function crearCuenta(_estado: Resultado | null, formData: FormData): Promise<Resultado> {
  const name = String(formData.get("name") ?? "").trim();
  const email = correo(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const tipo = String(formData.get("tipo") ?? "profesional");
  const license = String(formData.get("license") ?? "").trim();

  if (name.length < 2) return { ok: false, error: "Escribí tu nombre." };
  if (!email.includes("@")) return { ok: false, error: "El correo no parece válido." };
  if (password.length < 8) return { ok: false, error: "La contraseña necesita al menos 8 caracteres." };

  const placeName = String(formData.get("placeName") ?? "").trim();
  const kind = String(formData.get("kind") ?? "");
  const locality = String(formData.get("locality") ?? "");
  if (tipo === "lugar") {
    if (placeName.length < 2) return { ok: false, error: "Escribí el nombre del lugar." };
    if (!TIPOS_LUGAR.some((tipoLugar) => tipoLugar.id === kind)) {
      return { ok: false, error: "Elegí qué tipo de lugar es." };
    }
    if (!LOCALIDADES.includes(locality as (typeof LOCALIDADES)[number])) {
      return { ok: false, error: "Elegí una localidad del corredor." };
    }
  }

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) return { ok: false, error: "Ya hay una cuenta con ese correo." };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  if (tipo === "lugar") {
    const place = await prisma.place.create({
      data: { name: placeName, kind, locality, published: true },
    });
    await prisma.placeEditor.create({ data: { userId: user.id, placeId: place.id } });
  } else if (license.length > 2) {
    const existente = await prisma.professional.findFirst({
      where: { license, userId: null },
    });
    if (existente) {
      await prisma.professional.update({ where: { id: existente.id }, data: { userId: user.id } });
    } else {
      await prisma.professional.create({
        data: { userId: user.id, fullName: name, license, published: true },
      });
    }
  } else {
    await prisma.professional.create({
      data: { userId: user.id, fullName: name, published: true },
    });
  }

  await crearSesion(user.id);
  redirect("/panel");
}

export async function salir() {
  await cerrarSesion();
  redirect("/");
}
