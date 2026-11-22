import { NextResponse } from "next/server";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { ejecutarAccionProfesional, type AccionAdminProfesional } from "@/lib/adminOperaciones";

function esAccion(valor: string): valor is AccionAdminProfesional {
  return valor === "publicar" || valor === "bajar" || valor === "eliminar";
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await usuarioActual();
  const origin = new URL(request.url).origin;
  if (!user || !esAdmin(user)) {
    return NextResponse.redirect(new URL("/entrar", origin), 303);
  }
  const formData = await request.formData();
  const accion = String(formData.get("accion") ?? "");
  if (!esAccion(accion)) {
    return NextResponse.redirect(new URL(`/panel/admin/profesional/${id}`, origin), 303);
  }
  try {
    await ejecutarAccionProfesional(accion, [id]);
  } catch (error) {
    console.error("api/profesional/admin:", error);
    return NextResponse.redirect(new URL(`/panel/admin/profesional/${id}?error=accion`, origin), 303);
  }
  const destino = accion === "eliminar" ? "/panel/admin" : `/panel/admin/profesional/${id}?ok=${accion}`;
  return NextResponse.redirect(new URL(destino, origin), 303);
}