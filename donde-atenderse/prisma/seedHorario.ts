import { serializarHorarioLugar, type HorarioLugarData } from "../lib/placeSchedule";

function franja(
  key: string,
  dias: string[],
  turnos: {
    manana?: [string, string];
    tarde?: [string, string];
    noche?: [string, string];
    guardia24?: boolean;
    cerrado?: boolean;
  },
) {
  return {
    key,
    dias,
    cerrado: turnos.cerrado ?? false,
    manana: {
      activo: Boolean(turnos.manana),
      desde: turnos.manana?.[0] ?? "",
      hasta: turnos.manana?.[1] ?? "",
    },
    tarde: {
      activo: Boolean(turnos.tarde),
      desde: turnos.tarde?.[0] ?? "",
      hasta: turnos.tarde?.[1] ?? "",
    },
    noche: {
      activo: Boolean(turnos.noche),
      desde: turnos.noche?.[0] ?? "",
      hasta: turnos.noche?.[1] ?? "",
    },
    guardia24: turnos.guardia24 ?? false,
  };
}

export function notaHorarioEjemplo(data: HorarioLugarData) {
  return serializarHorarioLugar(data);
}

export const HORARIO_HOSPITAL_MANANA = notaHorarioEjemplo({
  v: 2,
  franjas: [franja("ej-hospital", ["lun", "mar", "mie", "jue", "vie"], { manana: ["08:00", "12:00"] })],
});

export const HORARIO_CONSULTORIO_TARDE = notaHorarioEjemplo({
  v: 2,
  franjas: [franja("ej-consultorio", ["lun", "mie", "vie"], { tarde: ["16:00", "20:00"] })],
});

export const HORARIO_GUARDIA_SABADO = notaHorarioEjemplo({
  v: 2,
  franjas: [franja("ej-guardia", ["sab"], { guardia24: true })],
});