import { diasDesdeTexto } from "./format";
import type { FilaHorario } from "./schedule";

export function filaHorario(item: {
  id: string;
  placeId: string;
  professionalId?: string;
  professionalDays: string;
  professionalTime: string;
  professionalShift: string;
  professionalUpdatedAt: Date | null;
  placeDays: string;
  placeTime: string;
  placeShift: string;
  placeUpdatedAt: Date | null;
  place: { name: string; locality: string };
  professional?: { fullName: string };
}): FilaHorario & { professionalId: string; professionalName: string } {
  return {
    id: item.id,
    placeId: item.placeId,
    placeName: item.place.name,
    locality: item.place.locality,
    professionalDays: item.professionalDays,
    professionalTime: item.professionalTime,
    professionalShift: item.professionalShift,
    professionalUpdatedAt: item.professionalUpdatedAt,
    placeDays: item.placeDays,
    placeTime: item.placeTime,
    placeShift: item.placeShift,
    placeUpdatedAt: item.placeUpdatedAt,
    professionalId: item.professionalId ?? "",
    professionalName: item.professional?.fullName ?? "",
  };
}

export function horarioProfesional(item: {
  id: string;
  placeId: string;
  professionalDays: string;
  professionalTime: string;
  professionalShift: string;
  placeDays: string;
  placeTime: string;
  placeShift: string;
  placeUpdatedAt: Date | null;
  place: { name: string; locality: string; address: string };
}, ownsPlace: boolean) {
  return {
    key: item.id,
    id: item.id,
    placeId: item.placeId,
    placeName: item.place.name,
    locality: item.place.locality,
    address: item.place.address,
    ownsPlace,
    days: diasDesdeTexto(item.professionalDays || item.placeDays),
    shift: item.professionalShift || item.placeShift || "manana",
    time: item.professionalTime || item.placeTime,
    placeDays: diasDesdeTexto(item.placeDays),
    placeShift: item.placeShift,
    placeTime: item.placeTime,
    placeUpdatedAt: item.placeUpdatedAt ? item.placeUpdatedAt.toISOString() : null,
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
