import type { BorradorProfesional, HorarioBorrador } from "@/lib/draft";
import { especialidadesDesdeCampo } from "@/lib/especialidades";
import { horarioProfesional } from "@/lib/map";
import { horarioLugarVacio } from "@/lib/placeSchedule";

function clave() {
  return `tmp-${Math.random().toString(36).slice(2)}`;
}

export function horarioBorradorParaLugar(lugar: {
  id: string;
  name: string;
  locality: string;
  kind: string;
}): HorarioBorrador {
  return {
    key: clave(),
    placeId: lugar.id,
    placeName: lugar.name,
    locality: lugar.locality,
    kind: lugar.kind,
    address: "",
    ownsPlace: false,
    sugerido: false,
    publicado: true,
    schedule: horarioLugarVacio(),
    scheduleLegacy: null,
    days: ["lun"],
    shift: "manana",
    time: "",
    placeDays: [],
    placeShift: "",
    placeTime: "",
    placeUpdatedAt: null,
  };
}

export function borradorDesdeProfesional(
  completo: {
    fullName: string;
    license: string;
    area: string;
    specialty: string;
    specialties: string;
    photoUrl: string;
    whatsapp: string;
    phone: string;
    price: string;
    priceUpdatedAt: Date | null;
    obras: { obra: { name: string } }[];
    attendances: Array<Parameters<typeof horarioProfesional>[0]>;
  },
  opts: { placeIds?: string[]; editorEnLugar: (placeId: string) => boolean },
): BorradorProfesional & { priceUpdatedAt: string | null } {
  const especialidades = especialidadesDesdeCampo(completo.specialties);
  const attendances = opts.placeIds
    ? completo.attendances.filter((item) => opts.placeIds!.includes(item.placeId))
    : completo.attendances;

  return {
    fullName: completo.fullName,
    license: completo.license,
    area: completo.area,
    specialty: completo.specialty,
    specialties: especialidades.length > 0 ? especialidades : completo.specialty ? [completo.specialty] : [],
    photoUrl: completo.photoUrl,
    whatsapp: completo.whatsapp,
    phone: completo.phone,
    price: completo.price,
    priceUpdatedAt: completo.priceUpdatedAt ? completo.priceUpdatedAt.toISOString() : null,
    obras: completo.obras.map((item) => item.obra.name),
    otraObra: "",
    horarios: attendances.map((item) => horarioProfesional(item, opts.editorEnLugar(item.placeId))),
  };
}