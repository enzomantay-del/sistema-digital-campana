import bcrypt from "bcryptjs";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { lugarPermiteCargaSecretaria } from "@/lib/lugarAsignacion";
import { prisma } from "@/lib/prisma";
import { redirigirSolicitud } from "@/lib/urlSolicitud";

export async function POST(request: Request) {
  const admin = await usuarioActual();
  if (!admin || !esAdmin(admin)) {
    return redirigirSolicitud(request, "/entrar");
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "profesional");
  const placeIds = formData
    .getAll("placeIds")
    .map((valor) => String(valor).trim())
    .filter(Boolean);

  if (name.length < 2 || !email.includes("@") || password.length < 8) {
    return redirigirSolicitud(request, "/panel/admin?error=usuario");
  }
  if (role !== "profesional" && role !== "secretaria") {
    return redirigirSolicitud(request, "/panel/admin?error=usuario");
  }
  if (role === "secretaria" && placeIds.length === 0) {
    return redirigirSolicitud(request, "/panel/admin?error=lugares");
  }

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) {
    return redirigirSolicitud(request, "/panel/admin?error=correo");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  if (role === "profesional") {
    await prisma.professional.create({
      data: { userId: user.id, fullName: name, published: false, reviewed: false },
    });
  }

  if (role === "secretaria" && placeIds.length > 0) {
    const lugares = await prisma.place.findMany({
      where: { id: { in: placeIds } },
      select: { id: true, kind: true },
    });
    if (lugares.some((lugar) => !lugarPermiteCargaSecretaria(lugar.kind))) {
      return redirigirSolicitud(request, "/panel/admin?error=lugares");
    }
    for (const placeId of placeIds) {
      await prisma.placeEditor.upsert({
        where: { userId_placeId: { userId: user.id, placeId } },
        update: {},
        create: { userId: user.id, placeId },
      });
    }
  }

  return redirigirSolicitud(request, "/panel/admin?ok=usuario");
}