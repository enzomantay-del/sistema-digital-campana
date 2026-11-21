import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { OBRAS_MISIONES } from "../lib/constants";

const prisma = new PrismaClient();

async function asegurarAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@cercalud.local").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "cercalud-admin";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { role: "admin", name: "Administración Cercalud", passwordHash },
    create: {
      email,
      name: "Administración Cercalud",
      role: "admin",
      passwordHash,
    },
  });
  console.log(`Admin listo: ${email}`);
  if (password === "cercalud-admin") {
    console.warn("⚠ Cambiá ADMIN_PASSWORD antes de abrir la web al público.");
  }
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
  await asegurarAdmin();
  await catalogoObras();
  console.log("Seed de producción listo (sin datos de ejemplo).");
  console.log("Siguiente: cargá lugares en /panel/admin y publicá profesionales tras revisión.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());