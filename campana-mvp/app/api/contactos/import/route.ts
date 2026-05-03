import { prisma } from "@/lib/prisma";
import { normalizarTelefono } from "@/lib/phone";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { texto?: string };
    const texto = body.texto ?? "";
    const lineas = texto
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    let importados = 0;
    const errores: string[] = [];

    for (let i = 0; i < lineas.length; i++) {
      const partes = lineas[i].split(",").map((p) => p.trim());
      if (partes.length < 3) {
        errores.push(`Línea ${i + 1}: necesitás nombre, teléfono y barrio separados por coma.`);
        continue;
      }
      const [nombre, tel, barrio, ...rest] = partes;
      const notas = rest.join(",").trim() || null;
      if (!nombre || !tel || !barrio) {
        errores.push(`Línea ${i + 1}: datos incompletos.`);
        continue;
      }
      await prisma.contacto.create({
        data: {
          nombre,
          telefono: normalizarTelefono(tel),
          barrio,
          notas,
        },
      });
      importados++;
    }

    if (importados === 0 && errores.length > 0) {
      return NextResponse.json({ ok: false, error: errores[0] }, { status: 400 });
    }

    return NextResponse.json({ ok: true, importados, advertencias: errores });
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido o error del servidor." }, { status: 400 });
  }
}
