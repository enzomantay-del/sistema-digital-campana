import assert from "node:assert/strict";
import { lineaHorario } from "./schedule";
import { textoDias } from "./format";

const base = {
  id: "1",
  placeId: "p",
  placeName: "Hospital",
  locality: "Jardín América",
  professionalDays: "",
  professionalTime: "",
  professionalShift: "",
  professionalUpdatedAt: null,
  placeDays: "",
  placeTime: "",
  placeShift: "",
  placeUpdatedAt: null,
};

assert.equal(textoDias(["lun", "mar", "mie", "jue", "vie"]), "lunes a viernes");
assert.equal(textoDias(["lun", "mie"]), "lunes y miércoles");

const soloProfesional = lineaHorario({
  ...base,
  professionalDays: "mar,jue",
  professionalTime: "9 a 13",
  professionalShift: "manana",
  professionalUpdatedAt: new Date("2026-11-10T12:00:00Z"),
});
assert.equal(soloProfesional?.source, "profesional");
assert.equal(soloProfesional?.conflict, null);

const conflicto = lineaHorario({
  ...base,
  professionalDays: "mar,jue",
  professionalTime: "9 a 13",
  professionalShift: "manana",
  professionalUpdatedAt: new Date("2026-11-10T12:00:00Z"),
  placeDays: "lun,mar,mie,jue,vie",
  placeTime: "8 a 12",
  placeShift: "manana",
  placeUpdatedAt: new Date("2026-11-02T12:00:00Z"),
});
assert.equal(conflicto?.days, "mar,jue");
assert.equal(conflicto?.conflict?.time, "8 a 12");

const iguales = lineaHorario({
  ...base,
  professionalDays: "lun",
  professionalTime: "8 a 12",
  professionalShift: "manana",
  professionalUpdatedAt: new Date("2026-11-01T12:00:00Z"),
  placeDays: "lun",
  placeTime: "8 a 12",
  placeShift: "manana",
  placeUpdatedAt: new Date("2026-11-12T12:00:00Z"),
});
assert.equal(iguales?.conflict, null);
assert.equal(iguales?.source, "lugar");

console.log("schedule ok");
