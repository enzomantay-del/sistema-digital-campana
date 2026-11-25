import assert from "node:assert/strict";
import type { HorarioBorrador } from "@/lib/draft";
import { franjaHorarioVacia, horarioLugarVacio } from "@/lib/placeSchedule";
import { mensajeSolapamientoEntreSedes } from "@/lib/solapamientoHorarios";

function sede(nombre: string, schedule: HorarioBorrador["schedule"]): HorarioBorrador {
  return {
    key: nombre,
    placeId: `id-${nombre}`,
    placeName: nombre,
    locality: "Jardín América",
    address: "",
    kind: "consultorio",
    ownsPlace: false,
    sugerido: false,
    publicado: true,
    schedule,
    scheduleLegacy: null,
    days: [],
    shift: "",
    time: "",
    placeDays: [],
    placeShift: "",
    placeTime: "",
    placeUpdatedAt: null,
    obras: ["Solo particular"],
    otraObra: "",
  };
}

const franjaMar = franjaHorarioVacia(["mar"]);
franjaMar.manana = { activo: true, desde: "09:00", hasta: "12:00" };

const franjaMarSolapada = franjaHorarioVacia(["mar"]);
franjaMarSolapada.manana = { activo: true, desde: "10:00", hasta: "13:00" };

const franjaMarDistinta = franjaHorarioVacia(["mar"]);
franjaMarDistinta.manana = { activo: true, desde: "14:00", hasta: "17:00" };

const franjaMie = franjaHorarioVacia(["mie"]);
franjaMie.tarde = { activo: true, desde: "15:00", hasta: "18:00" };

assert.equal(
  mensajeSolapamientoEntreSedes([
    sede("Hospital", { v: 2, franjas: [franjaMar] }),
    sede("Consultorio", { v: 2, franjas: [franjaMarDistinta] }),
  ]),
  null,
);

const solapa = mensajeSolapamientoEntreSedes([
  sede("Hospital", { v: 2, franjas: [franjaMar] }),
  sede("Consultorio", { v: 2, franjas: [franjaMarSolapada] }),
]);
assert.ok(solapa?.includes("Superposición"));
assert.ok(solapa?.includes("Hospital"));
assert.ok(solapa?.includes("Consultorio"));

assert.equal(
  mensajeSolapamientoEntreSedes([sede("A", { v: 2, franjas: [franjaMar] }), sede("B", { v: 2, franjas: [franjaMie] })]),
  null,
);

assert.equal(mensajeSolapamientoEntreSedes([sede("A", horarioLugarVacio())]), null);

const franjaVieSemanal = franjaHorarioVacia(["jue", "vie"]);
franjaVieSemanal.tarde = { activo: true, desde: "16:00", hasta: "20:00" };

const franjaFechaVie = franjaHorarioVacia([]);
franjaFechaVie.periodicidad = {
  tipo: "fechas",
  fechas: ["2026-12-11"],
};
franjaFechaVie.manana = { activo: true, desde: "08:00", hasta: "12:00" };
franjaFechaVie.tarde = { activo: true, desde: "16:00", hasta: "20:00" };

const solapaSemanalFecha = mensajeSolapamientoEntreSedes([
  sede("IMSA", { v: 2, franjas: [franjaVieSemanal] }),
  sede("Clínica Vecchia", { v: 2, franjas: [franjaFechaVie] }),
]);
assert.ok(solapaSemanalFecha?.includes("Superposición"));
assert.ok(solapaSemanalFecha?.includes("11/12/2026"));

const franjaFechaOtroDia = franjaHorarioVacia([]);
franjaFechaOtroDia.periodicidad = { tipo: "fechas", fechas: ["2026-12-07"] };
franjaFechaOtroDia.tarde = { activo: true, desde: "16:00", hasta: "20:00" };

assert.equal(
  mensajeSolapamientoEntreSedes([
    sede("IMSA", { v: 2, franjas: [franjaVieSemanal] }),
    sede("Otro", { v: 2, franjas: [franjaFechaOtroDia] }),
  ]),
  null,
);

console.log("solapamientoHorarios ok");