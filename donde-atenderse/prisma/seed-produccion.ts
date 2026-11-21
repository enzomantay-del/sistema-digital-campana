import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { OBRAS_MISIONES } from "../lib/constants";

const prisma = new PrismaClient();

async function asegurarAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !password) {
    console.log("Sin ADMIN_EMAIL o ADMIN_PASSWORD: no se crea ni modifica el usuario admin.");
    return;
  }
  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    if (existente.role !== "admin") {
      await prisma.user.update({
        where: { email },
        data: { role: "admin", name: "Administración Cercalud" },
      });
    }
    console.log(`Admin ya existía: ${email} (la contraseña no se tocó).`);
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