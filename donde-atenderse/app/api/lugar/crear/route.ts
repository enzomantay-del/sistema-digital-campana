import { NextResponse } from "next/server";
import { destinoErrorNuevoLugar, procesarNuevoLugar } from "@/lib/nuevoLugar";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = await procesarNuevoLugar(formData);
    const origin = new URL(request.url).origin;
    if (!resultado.ok) {
      return NextResponse.redirect(destinoErrorNuevoLugar(resultado.codigo, origin), 303);
    }
    return NextResponse.redirect(new URL(`/panel/lugar/${resultado.placeId}`, origin), 303);
  } catch (error) {
    console.error("api/lugar/crear:", error);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(new URL("/panel/lugar/nuevo?error=servidor", origin), 303);
  }
}