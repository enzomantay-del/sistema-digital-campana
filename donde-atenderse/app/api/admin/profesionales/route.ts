import { NextResponse } from "next/server";
import { esAdmin, usuarioActual } from "@/lib/auth";
import {
  ejecutarAccionProfesional,
  idsDesdeFormulario,
  type AccionAdminProfesional,
} from "@/lib/adminOperaciones";

function esAccion(valor: string): valor is AccionAdminProfesional {
  return valor === "publicar" || valor === "bajar" || valor === "eliminar";
}

export async function POST(request: Request) {
  const user = await usuarioActual();
  if (!user || !esAdmin(user)) {
    return NextResponse.redirect(new URL("/entrar", new URL(request.url).origin), 303);
  }
  const formData = await request.formData();
  const accion = String(formData.get("accion") ?? "");
  const ids = idsDesdeFormulario(formData);
  const origin = new URL(request.url).origin;
  if (!esAccion(accion) || ids.length === 0) {
    return NextResponse.redirect(new URL("/panel/admin", origin), 303);
  }
  try {
    await ejecutarAccionProfesional(accion, ids);
  } catch (error) {
    console.error("api/admin/profesionales:", error);
    return NextResponse.redirect(new URL("/panel/admin?error=accion", origin), 303);
  }
  return NextResponse.redirect(new URL("/panel/admin", origin), 303);
}