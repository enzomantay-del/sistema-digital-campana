import { normalizar } from "@/lib/format";
import { LOCALIDADES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export type FilaTurneroFarmacia = {
  locality: string;
  farmacia: string;
  startsOn: Date;
  endsOn: Date;
  source: string;
};

export type ResultadoImportarTurnero =
  | { ok: true; cargados: number; sinCoincidencia: string[]; invalidas: string[] }
  | { ok: false; error: string };

function parsearFechaTurno(raw: string): Date | null {
  const valor = raw.trim();
  if (!valor) return null;
  if (valor.includes("T")) {
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const conHora = valor.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})$/);
  if (conHora) {
    const d = new Date(`${conHora[1]}T${conHora[2].padStart(2, "0")}:${conHora[3]}:00-03:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const ar = valor.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (ar) {
    const [, dia, mes, anio, hh = "0", mm = "0"] = ar;
    const d = new Date(
      `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00-03:00`,
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const soloFecha = valor.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (soloFecha) {
    const d = new Date(`${soloFecha[1]}T00:00:00-03:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** CSV/TSV: localidad; farmacia; inicio; fin; fuente(opcional). Primera línea puede ser encabezado. */
export function parsearTurneroFarmacia(texto: string): FilaTurneroFarmacia[] | { error: string } {
  const lineas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lineas.length === 0) return { error: "El archivo está vacío." };

  const filas: FilaTurneroFarmacia[] = [];
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    const partes = linea.split(/[;\t,]/).map((p) => p.trim());
    if (partes.length < 4) continue;
    if (i === 0 && /localidad|farmacia|inicio/i.test(partes[0])) continue;

    const [localidadRaw, farmacia, inicioRaw, finRaw, fuente = ""] = partes;
    const locality = LOCALIDADES.find((loc) => normalizar(loc) === normalizar(localidadRaw)) ?? localidadRaw.trim();
    const startsOn = parsearFechaTurno(inicioRaw);
    const endsOn = parsearFechaTurno(finRaw);
    if (!farmacia || !startsOn || !endsOn || endsOn <= startsOn) continue;

    filas.push({ locality, farmacia, startsOn, endsOn, source: fuente.trim() });
  }

  if (filas.length === 0) {
    return {
      error:
        "No encontramos filas válidas. Usá: localidad; nombre de farmacia; inicio; fin; fuente. Fechas: 2025-11-22 08:00 o 22/11/2025 08:00.",
    };
  }
  return filas;
}

async function buscarFarmacia(locality: string, nombre: string) {
  const farmacias = await prisma.place.findMany({
    where: { kind: "farmacia", locality },
    select: { id: true, name: true },
  });
  const buscado = normalizar(nombre);
  const exacta = farmacias.find((f) => normalizar(f.name) === buscado);
  if (exacta) return exacta;
  return farmacias.find((f) => normalizar(f.name).includes(buscado) || buscado.includes(normalizar(f.name))) ?? null;
}

export async function importarTurneroFarmacia(texto: string): Promise<ResultadoImportarTurnero> {
  const parseado = parsearTurneroFarmacia(texto);
  if (!Array.isArray(parseado)) return { ok: false, error: parseado.error };

  const sinCoincidencia: string[] = [];
  const invalidas: string[] = [];
  let cargados = 0;

  for (const fila of parseado) {
    if (!LOCALIDADES.includes(fila.locality as (typeof LOCALIDADES)[number])) {
      invalidas.push(`${fila.locality} — localidad fuera del corredor`);
      continue;
    }
    const lugar = await buscarFarmacia(fila.locality, fila.farmacia);
    if (!lugar) {
      sinCoincidencia.push(`${fila.locality}: ${fila.farmacia}`);
      continue;
    }
    await prisma.pharmacyDuty.create({
      data: {
        placeId: lugar.id,
        startsOn: fila.startsOn,
        endsOn: fila.endsOn,
        source: fila.source,
      },
    });
    cargados += 1;
  }

  return { ok: true, cargados, sinCoincidencia, invalidas };
}