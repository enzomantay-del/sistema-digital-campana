import { NextResponse } from "next/server";
import { usuarioActual } from "@/lib/auth";
import type { BorradorLugar } from "@/lib/draft";
import { guardarLugarCore } from "@/lib/guardarLugarCore";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: placeId } = await context.params;
  const user = await usuarioActual();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Tenés que entrar de nuevo." }, { status: 401 });
  }
  let borrador: BorradorLugar;
  try {
    borrador = (await request.json()) as BorradorLugar;
  } catch {
    return NextResponse.json({ ok: false, error: "No llegaron los datos del formulario." }, { status: 400 });
  }
  const resultado = await guardarLugarCore(placeId, borrador, user);
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 400 });
}