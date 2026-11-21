import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/** Crea el primer admin desde ADMIN_EMAIL / ADMIN_PASSWORD si la base aún no tiene ninguno. */
export async function bootstrapAdminDesdeSecrets(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !password) return;

  const admins = await prisma.user.count({ where: { role: "admin" } });
  if (admins > 0) return;

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    console.log(`bootstrapAdmin: el correo ${email} ya existe (rol ${existente.role}), no se crea admin automático.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      name: "Administración Cercalud",
      role: "admin",
      passwordHash,
    },
  });
  console.log(`bootstrapAdmin: administrador creado (${email}).`);
}