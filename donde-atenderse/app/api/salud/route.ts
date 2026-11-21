import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const usuarios = await prisma.user.count();
    const admins = await prisma.user.count({ where: { role: "admin" } });
    return NextResponse.json({ ok: true, usuarios, admins });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: mensaje }, { status: 500 });
  }
}