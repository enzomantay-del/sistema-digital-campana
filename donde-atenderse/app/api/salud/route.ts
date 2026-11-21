import { NextResponse } from "next/server";
import { bootstrapAdminDesdeSecrets } from "@/lib/adminBootstrap";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await bootstrapAdminDesdeSecrets();
    const admins = await prisma.user.count({ where: { role: "admin" } });
    return NextResponse.json({
      ok: true,
      base: "conectada",
      adminListo: admins > 0,
    });
  } catch {
    return NextResponse.json({ ok: false, base: "error" }, { status: 500 });
  }
}