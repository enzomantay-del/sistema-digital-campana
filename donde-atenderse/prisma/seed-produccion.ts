import { PrismaClient } from "@prisma/client";
import { OBRAS_MISIONES } from "../lib/constants";
import { bootstrapAdminDesdeSecrets } from "../lib/adminBootstrap";

const prisma = new PrismaClient();

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
  await bootstrapAdminDesdeSecrets();
  console.log("Seed de producción listo (sin datos de ejemplo).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());