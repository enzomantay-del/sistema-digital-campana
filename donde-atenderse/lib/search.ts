import { OBRAS_MISIONES } from "./constants";
import { lugarAtiendeObra, obrasModoEfectivo } from "./placeObras";
import { incluye } from "./format";
import { distanciaALocalidad } from "./geo";
import { prisma } from "./prisma";
import { filtroLugarPublico, filtroProfesionalPublico } from "./publico";

const profesionalConRelaciones = {
  obras: { include: { obra: true } },
  attendances: { include: { place: true } },
} as const;

const lugarConRelaciones = {
  obras: { include: { obra: true } },
  studies: true,
  attendances: { include: { professional: { include: { obras: { include: { obra: true } } } }, place: true } },
  duties: true,
} as const;

export async function catalogoObras() {
  const obras = await prisma.obraSocial.findMany({ orderBy: { name: "asc" } });
  return Array.from(new Set<string>([...OBRAS_MISIONES, ...obras.map((obra) => obra.name)])).sort((a, b) => {
    if (a === "Particular") return -1;
    if (b === "Particular") return 1;
    return a.localeCompare(b, "es");
  });
}

export async function buscar(filtros: {
  q?: string;
  localidad?: string;
  area?: string;
  obra?: string;
  estudios?: string;
  lat?: string;
  lng?: string;
}) {
  const q = filtros.q?.trim() ?? "";
  const localidad = filtros.localidad?.trim() ?? "";
  const area = filtros.area?.trim() ?? "";
  const obra = filtros.obra?.trim() ?? "";
  const estudios = filtros.estudios === "1";
  const lat = Number(filtros.lat);
  const lng = Number(filtros.lng);
  const conUbicacion = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

  const [professionals, places] = await Promise.all([
    prisma.professional.findMany({
      where: filtroProfesionalPublico(),
      include: profesionalConRelaciones,
      orderBy: { fullName: "asc" },
    }),
    prisma.place.findMany({
      where: filtroLugarPublico({ kind: { not: "farmacia" } }),
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
    if (obra && !obras.includes(obra)) {
      const cubreLugar = lugares.some((lugar) => {
        const centro = places.find((place) => place.id === lugar.id);
        if (!centro) return false;
        const modo = obrasModoEfectivo(centro.kind, centro.obrasMode);
        if (modo === "por_profesional") return false;
        const obrasCentro = centro.obras.map((item) => item.obra.name);
        if (modo === "del_lugar") return obrasCentro.includes(obra);
        const enCentro = obrasCentro.includes(obra);
        const enColegas = centro.attendances.some(
          (item) => item.professional.published && item.professional.obras.some((fila) => fila.obra.name === obra),
        );
        return enCentro || enColegas;
      });
      if (!cubreLugar) return false;
    }
    return true;
  });

  const centros = places.filter((lugar) => {
    const obras = lugar.obras.map((item) => item.obra.name);
    const obrasEnProfesionales = Array.from(
      new Set(
        lugar.attendances
          .filter((item) => item.professional.published)
          .flatMap((item) => item.professional.obras.map((fila) => fila.obra.name)),
      ),
    );
    const modoObras = obrasModoEfectivo(lugar.kind, lugar.obrasMode);
    const texto = [lugar.name, lugar.address, ...lugar.studies.map((estudio) => estudio.name)].join(" ");
    if (q && !incluye(texto, q)) return false;
    if (localidad && lugar.locality !== localidad) return false;
    if (obra && !lugarAtiendeObra(modoObras, obras, obra, obrasEnProfesionales)) return false;
    if (area) {
      const coincide = lugar.attendances.some((item) => item.professional.area === area);
      const estudio = area === "cuerpo" && (lugar.kind === "imagenes" || lugar.kind === "laboratorio" || lugar.kind === "hospital" || lugar.kind === "sanatorio");
      if (!coincide && !estudio) return false;
    }
    if (estudios && lugar.kind !== "imagenes" && lugar.kind !== "laboratorio" && lugar.studies.length === 0) return false;
    return true;
  });

  const personasVisibles = estudios && !q ? [] : personas;
  const km = (localidadItem: string) => (conUbicacion ? distanciaALocalidad(localidadItem, lat, lng) : 0);
  const porCercania = <T,>(items: T[], distanciaDe: (item: T) => number) => {
    if (!conUbicacion || localidad) return items;
    return [...items].sort((a, b) => distanciaDe(a) - distanciaDe(b));
  };

  return {
    personas: porCercania(personasVisibles, (persona) => {
      const distancias = persona.attendances.map((item) => km(item.place.locality));
      return distancias.length > 0 ? Math.min(...distancias) : Number.POSITIVE_INFINITY;
    }),
    centros: porCercania(centros, (lugar) => km(lugar.locality)),
    q,
    localidad,
    area,
    obra,
    estudios,
    conUbicacion,
  };
}

export async function farmaciasDeTurno(ahora = new Date()) {
  const farmacias = await prisma.place.findMany({
    where: filtroLugarPublico({ kind: "farmacia" }),
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
