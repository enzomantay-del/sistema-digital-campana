import { especialidadesDesdeCampo } from "./especialidades";
import { prisma } from "./prisma";
import { filtroProfesionalPublico } from "./publico";
import { lineasHorarioAtencion } from "./horarioTexto";
import { datosActualizadosRecientes, fechaMasReciente } from "./verificacion";

export type ProfesionalEnLugar = {
  id: string;
  fullName: string;
  specialty: string;
  area: string;
  photoUrl: string;
  whatsapp: string;
  license: string;
  horarioLineas: string[];
  datosVerificados: boolean;
};

function horarioEnLugar(fila: {
  professionalScheduleNote: string;
  professionalDays: string;
  professionalTime: string;
  professionalShift: string;
}) {
  return lineasHorarioAtencion({
    scheduleNote: fila.professionalScheduleNote,
    days: fila.professionalDays,
    time: fila.professionalTime,
    shift: fila.professionalShift,
  });
}

export function filaAProfesionalEnLugar(
  fila: {
    professionalScheduleNote: string;
    professionalDays: string;
    professionalTime: string;
    professionalShift: string;
    professionalUpdatedAt: Date | null;
    professional: {
      id: string;
      fullName: string;
      specialty: string;
      area: string;
      photoUrl: string;
      whatsapp: string;
      license: string;
      updatedAt: Date;
    };
  },
): ProfesionalEnLugar {
  return {
    id: fila.professional.id,
    fullName: fila.professional.fullName,
    specialty: especialidadesDePersona(fila.professional).join(" · "),
    area: fila.professional.area,
    photoUrl: fila.professional.photoUrl.trim(),
    whatsapp: fila.professional.whatsapp.trim(),
    license: fila.professional.license.trim(),
    horarioLineas: horarioEnLugar(fila),
    datosVerificados: datosActualizadosRecientes(
      fechaMasReciente(fila.professional.updatedAt, fila.professionalUpdatedAt),
    ),
  };
}

function especialidadesDePersona(persona: { specialty: string; specialties?: string }) {
  const lista = especialidadesDesdeCampo(persona.specialties);
  if (lista.length) return lista;
  return persona.specialty.trim() ? [persona.specialty.trim()] : ["Especialidad sin cargar"];
}

export function agruparPorEspecialidad(lista: ProfesionalEnLugar[]) {
  const mapa = new Map<string, ProfesionalEnLugar[]>();
  for (const persona of lista) {
    const etiquetas = persona.specialty.includes("·")
      ? persona.specialty.split("·").map((t) => t.trim())
      : [persona.specialty];
    for (const etiqueta of etiquetas) {
      const grupo = mapa.get(etiqueta) ?? [];
      if (!grupo.some((p) => p.id === persona.id)) grupo.push(persona);
      mapa.set(etiqueta, grupo);
    }
  }
  return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));
}

export async function equipoPublicadoEnLugar(placeId: string) {
  const filas = await prisma.attendance.findMany({
    where: { placeId, professional: filtroProfesionalPublico() },
    include: { professional: true },
    orderBy: [{ professional: { specialty: "asc" } }, { professional: { fullName: "asc" } }],
  });

  const profesionalesDetalle = filas.map(filaAProfesionalEnLugar);
  const vistos = new Set<string>();
  const profesionales = filas
    .map((fila) => fila.professional)
    .filter((persona) => {
      if (vistos.has(persona.id)) return false;
      vistos.add(persona.id);
      return true;
    });

  const especialidades = Array.from(
    new Set(
      filas.flatMap((fila) =>
        especialidadesDePersona({
          specialty: fila.professional.specialty,
          specialties: fila.professional.specialties,
        }),
      ),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));

  return { profesionales, profesionalesDetalle, especialidades, cantidad: profesionales.length };
}