import { NextResponse } from "next/server";
import { esAdmin, esProfesional, esSecretaria, usuarioActual } from "@/lib/auth";
import { consultarMatriculaEnSistema } from "@/lib/matriculaConsulta";

export async function GET(request: Request) {
  const user = await usuarioActual();
  if (!user || (!esProfesional(user) && !user.professional && !esSecretaria(user) && !esAdmin(user))) {
    return NextResponse.json({ ok: false, error: "Sin permiso." }, { status: 403 });
  }

  const url = new URL(request.url);
  const license = url.searchParams.get("license") ?? "";
  const excluir = url.searchParams.get("excluir") ?? undefined;

  const consulta = await consultarMatriculaEnSistema(license, excluir);
  return NextResponse.json({ ok: true, ...consulta });
}