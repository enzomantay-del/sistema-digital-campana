import { etiquetaLugar, normalizar } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { filtroLugarPublico, filtroProfesionalPublico } from "@/lib/publico";
import { lugarVerificadoEnListado, profesionalVerificadoEnListado } from "@/lib/verificacion";

const MINIMO = 3;

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < MINIMO) return Response.json({ personas: [], especialidades: [], lugares: [] });
  const consulta = normalizar(q);
  const [personas, lugares] = await Promise.all([
    prisma.professional.findMany({
      where: filtroProfesionalPublico(),
      select: {
        id: true,
        fullName: true,
        specialty: true,
        photoUrl: true,
        updatedAt: true,
        attendances: { select: { professionalUpdatedAt: true } },
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.place.findMany({
      where: filtroLugarPublico({ kind: { not: "farmacia" } }),
      select: {
        id: true,
        name: true,
        kind: true,
        locality: true,
        logoUrl: true,
        updatedAt: true,
        attendances: { select: { placeUpdatedAt: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);
  const porNombre = personas
    .filter(
      (persona) =>
        normalizar(persona.fullName).includes(consulta) || normalizar(persona.specialty).includes(consulta),
    )
    .slice(0, 6)
    .map((persona) => ({
      id: persona.id,
      nombre: persona.fullName,
      especialidad: persona.specialty,
      photoUrl: persona.photoUrl,
      verificado: profesionalVerificadoEnListado(persona),
    }));
  const especialidades = [...new Set(personas.map((persona) => persona.specialty.trim()).filter(Boolean))]
    .filter((especialidad) => normalizar(especialidad).includes(consulta))
    .sort((a, b) => a.localeCompare(b, "es"))
    .slice(0, 6);
  const lugaresCoincidentes = lugares
    .filter(
      (lugar) =>
        normalizar(lugar.name).includes(consulta) ||
        normalizar(lugar.locality).includes(consulta) ||
        normalizar(etiquetaLugar(lugar.kind)).includes(consulta),
    )
    .slice(0, 6)
    .map((lugar) => ({
      id: lugar.id,
      nombre: lugar.name,
      tipo: etiquetaLugar(lugar.kind),
      localidad: lugar.locality,
      logoUrl: lugar.logoUrl,
      verificado: lugarVerificadoEnListado(lugar),
    }));
  return Response.json({ personas: porNombre, especialidades, lugares: lugaresCoincidentes });
}