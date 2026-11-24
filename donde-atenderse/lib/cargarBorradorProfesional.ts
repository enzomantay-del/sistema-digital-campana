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
    obras: [],
    otraObra: "",
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
    agendaWhatsapp: string;
    agendaPhone: string;
    price: string;
    priceUpdatedAt: Date | null;
    obras: { obra: { name: string } }[];
    attendances: Array<
      Parameters<typeof horarioProfesional>[0] & {
        obras?: { obra: { name: string } }[];
      }
    >;
  },
  opts: { placeIds?: string[]; editorEnLugar: (placeId: string) => boolean },
): BorradorProfesional & { priceUpdatedAt: string | null } {
  const especialidades = especialidadesDesdeCampo(completo.specialties);
  const fallbackObras = completo.obras.map((item) => item.obra.name);
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
    agendaWhatsapp: completo.agendaWhatsapp,
    agendaPhone: completo.agendaPhone,
    price: completo.price,
    priceUpdatedAt: completo.priceUpdatedAt ? completo.priceUpdatedAt.toISOString() : null,
    obras: [],
    otraObra: "",
    horarios: attendances.map((item) => {
      const base = horarioProfesional(item, opts.editorEnLugar(item.placeId));
      const obras =
        item.obras?.map((fila) => fila.obra.name).filter(Boolean) ??
        (base.obras.length ? base.obras : fallbackObras);
      return { ...base, obras, otraObra: "" };
    }),
  };
}