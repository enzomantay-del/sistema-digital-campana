import { PrismaClient } from "@prisma/client";
import { normalizarTelefono } from "../lib/phone";

const prisma = new PrismaClient();

async function main() {
  await prisma.messageLog.deleteMany();
  await prisma.envio.deleteMany();
  await prisma.contacto.deleteMany();

  const demo = [
    { nombre: "María González", telefono: "1123456789", barrio: "Centro", notas: "Referente comercial" },
    { nombre: "Juan Pérez", telefono: "+5492235512345", barrio: "Norte", notas: "" },
    { nombre: "Laura Rivas", telefono: "2235558899", barrio: "Sur", notas: "Vecinal" },
    { nombre: "Diego Acosta", telefono: "541134445566", barrio: "Centro", notas: "" },
    { nombre: "Silvia Ortiz", telefono: "91144445555", barrio: "Oeste", notas: "Timteam" },
  ];

  for (const row of demo) {
    await prisma.contacto.create({
      data: {
        nombre: row.nombre,
        telefono: normalizarTelefono(row.telefono),
        barrio: row.barrio,
        notas: row.notas || null,
      },
    });
  }

  console.log(`Seed OK: ${demo.length} contactos de ejemplo.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
