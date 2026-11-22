import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: placeId } = await context.params;
  const origin = new URL(request.url).origin;
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) {
    return NextResponse.redirect(new URL("/entrar", origin), 303);
  }
  const formData = await request.formData();
  const modo = String(formData.get("modo") ?? "asignar");
  if (modo === "quitar") {
    const userId = String(formData.get("userId") ?? "");
    if (userId) await prisma.placeEditor.deleteMany({ where: { placeId, userId } });
    revalidatePath(`/panel/lugar/${placeId}`);
    return NextResponse.redirect(new URL(`/panel/lugar/${placeId}`, origin), 303);
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) {
    return NextResponse.redirect(new URL(`/panel/lugar/${placeId}`, origin), 303);
  }
  const editor = await prisma.user.findUnique({ where: { email } });
  if (!editor) {
    return NextResponse.redirect(new URL(`/panel/lugar/${placeId}?error=correo`, origin), 303);
  }
  await prisma.placeEditor.upsert({
    where: { userId_placeId: { userId: editor.id, placeId } },
    update: {},
    create: { userId: editor.id, placeId },
  });
  revalidatePath(`/panel/lugar/${placeId}`);
  return NextResponse.redirect(new URL(`/panel/lugar/${placeId}`, origin), 303);
}