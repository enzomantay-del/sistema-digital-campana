import { NextResponse } from "next/server";
import {
  guardarProfesional,
  guardarProfesionalAdmin,
  guardarProfesionalSecretaria,
} from "@/actions/professional";
import type { BorradorProfesional } from "@/lib/draft";
import { esAdmin, esSecretaria, usuarioActual } from "@/lib/auth";
import { secretariaPuedeGuardarFicha } from "@/lib/permisosProfesional";

type CuerpoGuardado = {
  borrador: BorradorProfesional;
  modo?: "admin" | "secretaria";
};

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await usuarioActual();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Tenés que entrar de nuevo." }, { status: 401 });
  }

  const { id: professionalId } = await context.params;
  let cuerpo: CuerpoGuardado;
  try {
    cuerpo = (await request.json()) as CuerpoGuardado;
  } catch {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 400 });
  }

  if (!cuerpo.borrador || typeof cuerpo.borrador !== "object") {
    return NextResponse.json({ ok: false, error: "Faltan los datos de la ficha." }, { status: 400 });
  }

  try {
    let resultado;
  if (cuerpo.modo === "secretaria") {
      if (!esSecretaria(user)) {
        return NextResponse.json({ ok: false, error: "Solo secretarias con lugar asignado." }, { status: 403 });
      }
      const placeIdsBorrador = (cuerpo.borrador.horarios ?? [])
        .map((h) => h.placeId)
        .filter((id): id is string => Boolean(id));
      if (!(await secretariaPuedeGuardarFicha(user, professionalId, placeIdsBorrador))) {
        return NextResponse.json({ ok: false, error: "No podés editar esta ficha." }, { status: 403 });
      }
      resultado = await guardarProfesionalSecretaria(professionalId, cuerpo.borrador);
    } else if (cuerpo.modo === "admin") {
      if (!esAdmin(user)) {
        return NextResponse.json({ ok: false, error: "Solo administración." }, { status: 403 });
      }
      resultado = await guardarProfesionalAdmin(professionalId, cuerpo.borrador);
    } else if (user.professional?.id === professionalId) {
      resultado = await guardarProfesional(cuerpo.borrador);
    } else if (esAdmin(user)) {
      resultado = await guardarProfesionalAdmin(professionalId, cuerpo.borrador);
    } else if (esSecretaria(user)) {
      const placeIdsBorrador = (cuerpo.borrador.horarios ?? [])
        .map((h) => h.placeId)
        .filter((id): id is string => Boolean(id));
      if (!(await secretariaPuedeGuardarFicha(user, professionalId, placeIdsBorrador))) {
        return NextResponse.json({ ok: false, error: "No podés editar esta ficha." }, { status: 403 });
      }
      resultado = await guardarProfesionalSecretaria(professionalId, cuerpo.borrador);
    } else {
      return NextResponse.json({ ok: false, error: "Esta ficha no está en tu cuenta." }, { status: 403 });
    }

    if (!resultado.ok) {
      return NextResponse.json(resultado, { status: 400 });
    }
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("api/profesional/ficha:", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo guardar la ficha. Probá de nuevo en unos minutos." },
      { status: 500 },
    );
  }
}