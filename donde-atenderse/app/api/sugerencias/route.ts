import { normalizar } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return Response.json({ personas: [], especialidades: [] });
  const consulta = normalizar(q);
  const personas = await prisma.professional.findMany({
    where: { published: true },
    select: { id: true, fullName: true, specialty: true },
    orderBy: { fullName: "asc" },
  });
  const porNombre = personas
    .filter((persona) => normalizar(persona.fullName).includes(consulta))
    .slice(0, 6)
    .map((persona) => ({ id: persona.id, nombre: persona.fullName, especialidad: persona.specialty }));
  const especialidades = [...new Set(personas.map((persona) => persona.specialty.trim()).filter(Boolean))]
    .filter((especialidad) => normalizar(especialidad).includes(consulta))
    .sort((a, b) => a.localeCompare(b, "es"))
    .slice(0, 6);
  return Response.json({ personas: porNombre, especialidades });
}
