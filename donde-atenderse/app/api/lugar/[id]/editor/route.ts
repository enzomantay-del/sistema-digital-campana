import { revalidatePath } from "next/cache";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { lugarPermiteCargaSecretaria } from "@/lib/lugarAsignacion";
import { prisma } from "@/lib/prisma";
import { redirigirSolicitud } from "@/lib/urlSolicitud";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: placeId } = await context.params;
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) {
    return redirigirSolicitud(request, "/entrar");
  }
  const lugar = await prisma.place.findUnique({ where: { id: placeId }, select: { kind: true } });
  if (!lugar) {
    return redirigirSolicitud(request, "/panel/admin");
  }
  const formData = await request.formData();
  const modo = String(formData.get("modo") ?? "asignar");
  if (modo === "quitar") {
    const userId = String(formData.get("userId") ?? "");
    if (userId) await prisma.placeEditor.deleteMany({ where: { placeId, userId } });
    revalidatePath(`/panel/lugar/${placeId}`);
    return redirigirSolicitud(request, `/panel/lugar/${placeId}`);
  }
  if (!lugarPermiteCargaSecretaria(lugar.kind)) {
    return redirigirSolicitud(request, `/panel/lugar/${placeId}`);
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) {
    return redirigirSolicitud(request, `/panel/lugar/${placeId}`);
  }
  const editor = await prisma.user.findUnique({ where: { email } });
  if (!editor) {
    return redirigirSolicitud(request, `/panel/lugar/${placeId}?error=correo`);
  }
  await prisma.placeEditor.upsert({
    where: { userId_placeId: { userId: editor.id, placeId } },
    update: {},
    create: { userId: editor.id, placeId },
  });
  if (editor.role !== "admin") {
    await prisma.user.update({ where: { id: editor.id }, data: { role: "secretaria" } });
  }
  revalidatePath(`/panel/lugar/${placeId}`);
  return redirigirSolicitud(request, `/panel/lugar/${placeId}`);
}