import assert from "node:assert/strict";
import {
  adminDebeRecordarInsignia,
  diasRestantesInsignia,
  filasRecordatorioInsignia,
} from "./recordatorioInsignia";

const ahora = new Date("2026-11-25T12:00:00Z");

const ultima = new Date("2026-11-25T10:00:00Z");
assert.equal(diasRestantesInsignia(ultima, ahora), 30);

const hace25 = new Date("2026-10-31T12:00:00Z");
assert.equal(diasRestantesInsignia(hace25, ahora), 5);

assert.equal(adminDebeRecordarInsignia(6), false);
assert.equal(adminDebeRecordarInsignia(5), true);
assert.equal(adminDebeRecordarInsignia(0), true);
assert.equal(adminDebeRecordarInsignia(-10), true);
assert.equal(adminDebeRecordarInsignia(-20), false);

const filas = filasRecordatorioInsignia(
  [
    {
      id: "a",
      fullName: "Dr. Prueba",
      specialty: "Clínica",
      updatedAt: new Date("2026-10-31T12:00:00Z"),
      agendaWhatsapp: "",
      whatsapp: "3743123456",
      published: true,
      reviewed: true,
      example: false,
      attendances: [],
    },
    {
      id: "b",
      fullName: "Oculto",
      specialty: "",
      updatedAt: new Date("2026-11-20T12:00:00Z"),
      agendaWhatsapp: "",
      whatsapp: "",
      published: true,
      reviewed: true,
      example: false,
      attendances: [],
    },
  ],
  ahora,
);
assert.equal(filas.length, 1);
assert.equal(filas[0]?.id, "a");
assert.equal(filas[0]?.diasRestantes, 5);

console.log("recordatorioInsignia.test.ts OK");