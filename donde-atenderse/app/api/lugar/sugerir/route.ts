import { NextResponse } from "next/server";
import { sugerirLugarProfesional } from "@/lib/sugerirLugarProfesional";

export async function POST(request: Request) {
  let body: { name?: string; kind?: string; locality?: string; address?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 400 });
  }

  const resultado = await sugerirLugarProfesional({
    name: body.name ?? "",
    kind: body.kind ?? "",
    locality: body.locality ?? "",
    address: body.address,
  });

  if (!resultado.ok) {
    return NextResponse.json(resultado, { status: 400 });
  }
  return NextResponse.json(resultado);
}