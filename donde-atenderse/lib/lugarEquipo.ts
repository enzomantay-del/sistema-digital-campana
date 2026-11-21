import { prisma } from "./prisma";
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
    specialty: fila.professional.specialty.trim() || "Especialidad sin cargar",
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

export function agruparPorEspecialidad(lista: ProfesionalEnLugar[]) {
  const mapa = new Map<string, ProfesionalEnLugar[]>();
  for (const persona of lista) {
    const grupo = mapa.get(persona.specialty) ?? [];
    grupo.push(persona);
    mapa.set(persona.specialty, grupo);
  }
  return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));
}

export async function equipoPublicadoEnLugar(placeId: string) {
  const filas = await prisma.attendance.findMany({
    where: { placeId, professional: { published: true } },
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
    new Set(profesionalesDetalle.map((persona) => persona.specialty)),
  ).sort((a, b) => a.localeCompare(b, "es"));

  return { profesionales, profesionalesDetalle, especialidades, cantidad: profesionales.length };
}