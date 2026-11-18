import { incluye } from "./format";
import { prisma } from "./prisma";

const profesionalConRelaciones = {
  obras: { include: { obra: true } },
  attendances: { include: { place: true } },
} as const;

const lugarConRelaciones = {
  obras: { include: { obra: true } },
  studies: true,
  attendances: { include: { professional: true, place: true } },
  duties: true,
} as const;

export async function catalogoObras() {
  const obras = await prisma.obraSocial.findMany({ orderBy: { name: "asc" } });
  return obras.map((obra) => obra.name);
}

export async function buscar(filtros: {
  q?: string;
  localidad?: string;
  area?: string;
  obra?: string;
  estudios?: string;
}) {
  const q = filtros.q?.trim() ?? "";
  const localidad = filtros.localidad?.trim() ?? "";
  const area = filtros.area?.trim() ?? "";
  const obra = filtros.obra?.trim() ?? "";
  const estudios = filtros.estudios === "1";

  const [professionals, places] = await Promise.all([
    prisma.professional.findMany({
      where: { published: true },
      include: profesionalConRelaciones,
      orderBy: { fullName: "asc" },
    }),
    prisma.place.findMany({
      where: { published: true, kind: { not: "farmacia" } },
      include: lugarConRelaciones,
      orderBy: { name: "asc" },
    }),
  ]);

  const personas = professionals.filter((persona) => {
    const obras = persona.obras.map((item) => item.obra.name);
    const lugares = persona.attendances.map((item) => item.place);
    const texto = [persona.fullName, persona.specialty, ...lugares.map((lugar) => lugar.name)].join(" ");
    if (q && !incluye(texto, q)) return false;
    if (area && persona.area !== area) return false;
    if (localidad && !lugares.some((lugar) => lugar.locality === localidad)) return false;
    if (obra && !obras.includes(obra) && !lugares.some((lugar) => places.find((place) => place.id === lugar.id)?.obras.some((item) => item.obra.name === obra))) {
      return false;
    }
    return true;
  });

  const centros = places.filter((lugar) => {
    const obras = lugar.obras.map((item) => item.obra.name);
    const texto = [lugar.name, lugar.address, ...lugar.studies.map((estudio) => estudio.name)].join(" ");
    if (q && !incluye(texto, q)) return false;
    if (localidad && lugar.locality !== localidad) return false;
    if (obra && !obras.includes(obra)) return false;
    if (area) {
      const coincide = lugar.attendances.some((item) => item.professional.area === area);
      const estudio = area === "cuerpo" && (lugar.kind === "imagenes" || lugar.kind === "laboratorio" || lugar.kind === "hospital" || lugar.kind === "sanatorio");
      if (!coincide && !estudio) return false;
    }
    if (estudios && lugar.kind !== "imagenes" && lugar.kind !== "laboratorio" && lugar.studies.length === 0) return false;
    return true;
  });

  return { personas: estudios && !q ? [] : personas, centros, q, localidad, area, obra, estudios };
}

export async function farmaciasDeTurno(ahora = new Date()) {
  const farmacias = await prisma.place.findMany({
    where: { published: true, kind: "farmacia" },
    include: { duties: { orderBy: { endsOn: "desc" } } },
    orderBy: { locality: "asc" },
  });
  return farmacias.map((farmacia) => {
    const vigente = farmacia.duties.find((duty) => duty.startsOn <= ahora && duty.endsOn >= ahora);
    const proximo = farmacia.duties.find((duty) => duty.startsOn > ahora);
    const ultimo = farmacia.duties[0] ?? null;
    return { ...farmacia, vigente: vigente ?? null, proximo: proximo ?? null, ultimo };
  });
}

export { profesionalConRelaciones, lugarConRelaciones };
