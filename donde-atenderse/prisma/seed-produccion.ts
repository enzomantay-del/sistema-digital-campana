import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { OBRAS_MISIONES } from "../lib/constants";

const prisma = new PrismaClient();

async function asegurarAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !password) {
    console.log("Sin ADMIN_EMAIL o ADMIN_PASSWORD: no se crea el usuario admin.");
    return;
  }

  const admins = await prisma.user.count({ where: { role: "admin" } });
  if (admins > 0) {
    const adminEsperado = await prisma.user.findFirst({ where: { email, role: "admin" } });
    if (adminEsperado) {
      console.log(`Administrador ya configurado: ${email} (contraseña sin cambios).`);
    } else {
      console.log("Ya existe un administrador distinto; no se promueven cuentas desde el seed.");
    }
    return;
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    console.log(
      `El correo ${email} ya tiene cuenta (rol ${existente.role}). No se promueve a admin: usá otro ADMIN_EMAIL o borrá esa cuenta manualmente.`,
    );
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
  console.log(`Admin creado: ${email}`);
}

async function catalogoObras() {
  for (const name of OBRAS_MISIONES) {
    await prisma.obraSocial.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Obras sociales: ${OBRAS_MISIONES.length} nombres en catálogo.`);
}

async function main() {
  await catalogoObras();
  await asegurarAdmin();
  console.log("Seed de producción listo (sin datos de ejemplo).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());