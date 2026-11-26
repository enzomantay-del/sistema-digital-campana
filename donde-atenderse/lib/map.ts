import { diasDesdeTexto } from "./format";
import { leerHorarioProfesional } from "./professionalSchedule";
import type { FilaHorario } from "./schedule";

export function filaHorario(item: {
  id: string;
  placeId: string;
  professionalId?: string;
  professionalDays: string;
  professionalTime: string;
  professionalShift: string;
  professionalScheduleNote?: string;
  professionalUpdatedAt: Date | null;
  placeDays: string;
  placeTime: string;
  placeShift: string;
  placeUpdatedAt: Date | null;
  place: { name: string; locality: string; whatsapp?: string; phone?: string };
  professional?: { fullName: string };
  obras?: { obra: { name: string } }[];
}): FilaHorario & { professionalId: string; professionalName: string } {
  return {
    id: item.id,
    placeId: item.placeId,
    placeName: item.place.name,
    locality: item.place.locality,
    professionalDays: item.professionalDays,
    professionalTime: item.professionalTime,
    professionalShift: item.professionalShift,
    professionalScheduleNote: item.professionalScheduleNote,
    professionalUpdatedAt: item.professionalUpdatedAt,
    placeDays: item.placeDays,
    placeTime: item.placeTime,
    placeShift: item.placeShift,
    placeUpdatedAt: item.placeUpdatedAt,
    professionalId: item.professionalId ?? "",
    professionalName: item.professional?.fullName ?? "",
    placeWhatsapp: item.place.whatsapp ?? "",
    placePhone: item.place.phone ?? "",
    obrasEnLugar: item.obras?.map((fila) => fila.obra.name) ?? [],
  };
}

export function horarioProfesional(
  item: {
    id: string;
    placeId: string;
    professionalDays: string;
    professionalTime: string;
    professionalShift: string;
    professionalScheduleNote: string;
    placeDays: string;
    placeTime: string;
    placeShift: string;
    placeUpdatedAt: Date | null;
    place: {
      name: string;
      locality: string;
      address: string;
      kind: string;
      published: boolean;
      suggestedById: string | null;
      whatsapp?: string;
      phone?: string;
    };
    obras?: { obra: { name: string } }[];
  },
  ownsPlace: boolean,
) {
  const horario = leerHorarioProfesional(
    item.professionalScheduleNote,
    item.professionalDays,
    item.professionalTime,
    item.professionalShift,
  );
  return {
    key: item.id,
    id: item.id,
    placeId: item.placeId,
    placeName: item.place.name,
    locality: item.place.locality,
    address: item.place.address,
    kind: item.place.kind,
    ownsPlace,
    sugerido: !item.place.published,
    publicado: item.place.published,
    schedule: horario.schedule,
    scheduleLegacy: horario.legacy,
    days: diasDesdeTexto(item.professionalDays || item.placeDays),
    shift: item.professionalShift || item.placeShift || "manana",
    time: item.professionalTime || item.placeTime,
    placeDays: diasDesdeTexto(item.placeDays),
    placeShift: item.placeShift,
    placeTime: item.placeTime,
    placeUpdatedAt: item.placeUpdatedAt ? item.placeUpdatedAt.toISOString() : null,
    obras: item.obras?.map((fila) => fila.obra.name) ?? [],
    otraObra: "",
  };
}

export function horarioLugar(item: {
  id: string;
  professionalId: string;
  placeDays: string;
  placeTime: string;
  placeShift: string;
  professionalDays: string;
  professionalTime: string;
  professionalShift: string;
  professionalUpdatedAt: Date | null;
  professional: { fullName: string; specialty: string; area: string; license: string };
}) {
  return {
    key: item.id,
    id: item.id,
    professionalId: item.professionalId,
    professionalName: item.professional.fullName,
    specialty: item.professional.specialty,
    area: item.professional.area,
    license: item.professional.license,
    days: diasDesdeTexto(item.placeDays || item.professionalDays),
    shift: item.placeShift || item.professionalShift || "manana",
    time: item.placeTime || item.professionalTime,
    professionalDays: diasDesdeTexto(item.professionalDays),
    professionalShift: item.professionalShift,
    professionalTime: item.professionalTime,
    professionalUpdatedAt: item.professionalUpdatedAt ? item.professionalUpdatedAt.toISOString() : null,
  };
}
