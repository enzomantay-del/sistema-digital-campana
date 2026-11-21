import { NextResponse } from "next/server";
import { bootstrapAdminDesdeSecrets } from "@/lib/adminBootstrap";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await bootstrapAdminDesdeSecrets();
    const admins = await prisma.user.count({ where: { role: "admin" } });
    let lugaresListos = false;
    try {
      await prisma.place.findFirst({
        select: { id: true, obrasMode: true, suggestionNote: true, duties: { take: 1, select: { id: true } } },
      });
      lugaresListos = true;
    } catch (schemaError) {
      console.error("salud schema Place:", schemaError);
    }
    return NextResponse.json({
      ok: true,
      base: "conectada",
      adminListo: admins > 0,
      lugaresListos,
    });
  } catch {
    return NextResponse.json({ ok: false, base: "error" }, { status: 500 });
  }
}