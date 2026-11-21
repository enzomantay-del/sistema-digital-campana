import { NextResponse } from "next/server";
import { procesarEntrada } from "@/lib/login";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = await procesarEntrada(formData);
    const base = new URL(request.url);
    if (!resultado.ok) {
      const volver = new URL("/entrar", base.origin);
      volver.searchParams.set("error", resultado.error);
      return NextResponse.redirect(volver, 303);
    }
    return NextResponse.redirect(new URL(resultado.irA, base.origin), 303);
  } catch (error) {
    console.error("api/login:", error);
    const volver = new URL("/entrar", new URL(request.url).origin);
    volver.searchParams.set("error", "No pudimos completar el ingreso. Probá de nuevo en un minuto.");
    return NextResponse.redirect(volver, 303);
  }
}