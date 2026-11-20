import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { RUTA_PROFESIONAL_EJEMPLO } from "../lib/ejemplo";
import { HORARIO_CONSULTORIO_TARDE, HORARIO_GUARDIA_SABADO, HORARIO_HOSPITAL_MANANA } from "./seedHorario";

const prisma = new PrismaClient();

const FOTO_EJEMPLO_ANA = "/ejemplos/dra-ana-lopez.svg";

function dias(...ids: string[]) {
  return ids.join(",");
}

function dia(iso: string) {
  return new Date(`${iso}T12:00:00-03:00`);
}

async function asegurarAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@cercalud.local").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "cercalud-admin";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { role: "admin", name: "Administración Cercalud", passwordHash },
    create: {
      email,
      name: "Administración Cercalud",
      role: "admin",
      passwordHash,
    },
  });
  console.log(`Admin listo: ${email}`);
}

async function publicarEjemplos() {
  await prisma.place.updateMany({ where: { example: true }, data: { published: true } });
  await prisma.professional.updateMany({
    where: { example: true },
    data: { published: true, reviewed: true },
  });
}

/** Ficha modelo con foto, horarios v2 y contacto — muestra el formato nuevo de Cercalud. */
async function actualizarFichaEjemploAna() {
  const ana = await prisma.professional.findFirst({
    where: { example: true, fullName: "Dra. Ana López" },
    include: { attendances: { include: { place: true } } },
  });
  if (!ana) return;

  await prisma.professional.update({
    where: { id: ana.id },
    data: {
      photoUrl: FOTO_EJEMPLO_ANA,
      published: true,
      reviewed: true,
      example: true,
    },
  });

  for (const att of ana.attendances) {
    let nota = "";
    if (att.place.name === "Hospital de Jardín América") nota = HORARIO_HOSPITAL_MANANA;
    else if (att.place.name === "Consultorio López") nota = HORARIO_CONSULTORIO_TARDE;
    else if (att.place.name === "Sanatorio del Paraná") nota = HORARIO_GUARDIA_SABADO;
    else continue;

    await prisma.attendance.update({
      where: { id: att.id },
      data: { professionalScheduleNote: nota },
    });
  }

  console.log(`Ficha de ejemplo: ${RUTA_PROFESIONAL_EJEMPLO} (id ${ana.id})`);
}

async function main() {
  await asegurarAdmin();

  const yaHay = await prisma.professional.count();
  if (yaHay > 0) {
    await publicarEjemplos();
    await actualizarFichaEjemploAna();
    console.log("La base ya tiene datos. No se vuelve a cargar el ejemplo.");
    return;
  }

  const obras = Object.fromEntries(
    await Promise.all(
      ["IPS", "Particular", "OSDE", "Swiss Medical", "Galeno"].map(async (name) => {
        const obra = await prisma.obraSocial.create({ data: { name } });
        return [name, obra.id] as const;
      }),
    ),
  );

  const hospital = await prisma.place.create({
    data: {
      name: "Hospital de Jardín América",
      kind: "hospital",
      locality: "Jardín América",
      address: "Avenida Ejemplo 100",
      phone: "3743 00-0100",
      whatsapp: "3743000100",
      scheduleNote: "Consultorios externos de lunes a viernes, de 7 a 18.",
      example: true,
    },
  });
  const sanatorio = await prisma.place.create({
    data: {
      name: "Sanatorio del Paraná",
      kind: "sanatorio",
      locality: "Puerto Rico",
      address: "Calle Ejemplo 250",
      phone: "3743 00-0200",
      whatsapp: "3743000200",
      scheduleNote: "Guardia las 24 horas. Consultorios de 8 a 20.",
      example: true,
    },
  });
  const consultorioAna = await prisma.place.create({
    data: {
      name: "Consultorio López",
      kind: "consultorio",
      locality: "Jardín América",
      address: "Calle Ejemplo 40",
      whatsapp: "3743001001",
      example: true,
    },
  });
  const consultorioOdonto = await prisma.place.create({
    data: {
      name: "Consultorio Benítez",
      kind: "consultorio",
      locality: "Santo Pipó",
      address: "Calle Ejemplo 12",
      whatsapp: "3743001002",
      example: true,
    },
  });
  const consultorioOdontoPR = await prisma.place.create({
    data: {
      name: "Consultorio Benítez Puerto Rico",
      kind: "consultorio",
      locality: "Puerto Rico",
      address: "Calle Ejemplo 80",
      whatsapp: "3743001002",
      example: true,
    },
  });
  const consultorioPsico = await prisma.place.create({
    data: {
      name: "Consultorio Gómez",
      kind: "consultorio",
      locality: "Ruiz de Montoya",
      address: "Calle Ejemplo 7",
      whatsapp: "3743001003",
      example: true,
    },
  });
  const consultorioOftalmo = await prisma.place.create({
    data: {
      name: "Consultorio Vázquez",
      kind: "consultorio",
      locality: "Jardín América",
      address: "Calle Ejemplo 55",
      whatsapp: "3743001004",
      example: true,
    },
  });
  const consultorioKine = await prisma.place.create({
    data: {
      name: "Consultorio Duarte",
      kind: "consultorio",
      locality: "Capioví",
      address: "Calle Ejemplo 3",
      whatsapp: "3743001005",
      example: true,
    },
  });
  const consultorioNutri = await prisma.place.create({
    data: {
      name: "Consultorio Acosta",
      kind: "consultorio",
      locality: "Hipólito Yrigoyen",
      address: "Calle Ejemplo 9",
      whatsapp: "3743001006",
      example: true,
    },
  });
  const imagenes = await prisma.place.create({
    data: {
      name: "Centro de Imágenes del Alto Paraná",
      kind: "imagenes",
      locality: "Puerto Rico",
      address: "Avenida Ejemplo 400",
      phone: "3743 00-0300",
      whatsapp: "3743000300",
      scheduleNote: "Con turno, de lunes a viernes de 8 a 17.",
      example: true,
    },
  });
  const laboratorio = await prisma.place.create({
    data: {
      name: "Laboratorio del Centro",
      kind: "laboratorio",
      locality: "Jardín América",
      address: "Calle Ejemplo 210",
      phone: "3743 00-0400",
      whatsapp: "3743000400",
      scheduleNote: "Extracciones de 7 a 10. El resto del día, por orden de llegada.",
      example: true,
    },
  });

  const farmacias = [
    ["Farmacia Los Lapachos", "Jardín América"],
    ["Farmacia del Parque", "Hipólito Yrigoyen"],
    ["Farmacia Santo Pipó", "Santo Pipó"],
    ["Farmacia Ruiz", "Ruiz de Montoya"],
    ["Farmacia Puerto Rico", "Puerto Rico"],
    ["Farmacia Capioví", "Capioví"],
  ] as const;
  const hoyArgentina = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const inicio = new Date(`${hoyArgentina}T00:00:00-03:00`);
  const fin = new Date(inicio.getTime() + 7 * 24 * 60 * 60 * 1000 - 60 * 1000);
  for (const [name, locality] of farmacias) {
    const farmacia = await prisma.place.create({
      data: {
        name,
        kind: "farmacia",
        locality,
        address: "Dirección de ejemplo",
        phone: "3743 00-0500",
        whatsapp: "3743000500",
        example: true,
      },
    });
    await prisma.pharmacyDuty.create({
      data: {
        placeId: farmacia.id,
        startsOn: inicio,
        endsOn: fin,
        source: "Dato de ejemplo. No es la grilla oficial.",
      },
    });
  }

  async function obrasDe(placeId: string, nombres: string[]) {
    await prisma.placeObra.createMany({
      data: nombres.map((nombre) => ({ placeId, obraId: obras[nombre] })),
    });
  }
  await obrasDe(hospital.id, ["IPS", "Particular"]);
  await obrasDe(sanatorio.id, ["IPS", "Particular", "OSDE", "Swiss Medical"]);
  await obrasDe(consultorioAna.id, ["IPS", "Particular"]);
  await obrasDe(consultorioOdonto.id, ["IPS", "Particular"]);
  await obrasDe(consultorioOdontoPR.id, ["Particular"]);
  await obrasDe(consultorioPsico.id, ["Particular"]);
  await obrasDe(consultorioOftalmo.id, ["IPS", "Particular", "Galeno"]);
  await obrasDe(consultorioKine.id, ["IPS", "Particular"]);
  await obrasDe(consultorioNutri.id, ["Particular"]);
  await obrasDe(imagenes.id, ["IPS", "Particular", "OSDE"]);
  await obrasDe(laboratorio.id, ["IPS", "Particular"]);

  await prisma.study.createMany({
    data: [
      { placeId: hospital.id, name: "Ecografía", preparation: "", attention: "turno" },
      { placeId: hospital.id, name: "Radiografía", preparation: "", attention: "orden" },
      {
        placeId: imagenes.id,
        name: "Resonancia",
        preparation: "Te van a indicar si hace falta preparación según la zona.",
        attention: "turno",
      },
      { placeId: imagenes.id, name: "Tomografía", preparation: "", attention: "turno" },
      { placeId: imagenes.id, name: "Ecografía", preparation: "Para abdomen, vení en ayunas.", attention: "turno" },
      { placeId: laboratorio.id, name: "Análisis de laboratorio", preparation: "Preguntá si el estudio pide ayuno.", attention: "orden" },
    ],
  });

  const ana = await prisma.professional.create({
    data: {
      fullName: "Dra. Ana López",
      license: "EJ-1001",
      area: "cuerpo",
      specialty: "Clínica médica",
      photoUrl: FOTO_EJEMPLO_ANA,
      whatsapp: "3743001001",
      phone: "3743 00-1001",
      price: "15000",
      priceUpdatedAt: dia("2026-11-10"),
      example: true,
    },
  });
  const mateo = await prisma.professional.create({
    data: {
      fullName: "Dr. Mateo Ruiz",
      license: "EJ-1002",
      area: "cuerpo",
      specialty: "Traumatología",
      whatsapp: "3743001007",
      example: true,
    },
  });
  const irene = await prisma.professional.create({
    data: {
      fullName: "Dra. Irene Vázquez",
      license: "EJ-1003",
      area: "cuerpo",
      specialty: "Oftalmología",
      whatsapp: "3743001004",
      example: true,
    },
  });
  const pablo = await prisma.professional.create({
    data: {
      fullName: "Od. Pablo Benítez",
      license: "EJ-1004",
      area: "odontologia",
      specialty: "Odontología",
      whatsapp: "3743001002",
      example: true,
    },
  });
  const carla = await prisma.professional.create({
    data: {
      fullName: "Lic. Carla Gómez",
      license: "EJ-1005",
      area: "mental",
      specialty: "Psicología",
      whatsapp: "3743001003",
      price: "12000",
      priceUpdatedAt: dia("2026-11-08"),
      example: true,
    },
  });
  const ivan = await prisma.professional.create({
    data: {
      fullName: "Dr. Iván Ortiz",
      license: "EJ-1006",
      area: "mental",
      specialty: "Psiquiatría",
      whatsapp: "3743001008",
      example: true,
    },
  });
  const elena = await prisma.professional.create({
    data: {
      fullName: "Lic. Elena Duarte",
      license: "EJ-1007",
      area: "cuerpo",
      specialty: "Kinesiología",
      whatsapp: "3743001005",
      example: true,
    },
  });
  const nora = await prisma.professional.create({
    data: {
      fullName: "Lic. Nora Acosta",
      license: "EJ-1008",
      area: "cuerpo",
      specialty: "Nutrición",
      whatsapp: "3743001006",
      example: true,
    },
  });

  async function obrasPersona(professionalId: string, nombres: string[]) {
    await prisma.professionalObra.createMany({
      data: nombres.map((nombre) => ({ professionalId, obraId: obras[nombre] })),
    });
  }
  await obrasPersona(ana.id, ["IPS", "Particular"]);
  await obrasPersona(mateo.id, ["IPS", "Particular", "OSDE"]);
  await obrasPersona(irene.id, ["IPS", "Particular", "Galeno"]);
  await obrasPersona(pablo.id, ["IPS", "Particular"]);
  await obrasPersona(carla.id, ["Particular"]);
  await obrasPersona(ivan.id, ["IPS", "Swiss Medical"]);
  await obrasPersona(elena.id, ["IPS", "Particular"]);
  await obrasPersona(nora.id, ["Particular"]);

  const acuerdo = {
    professionalUpdatedAt: dia("2026-11-10"),
    placeUpdatedAt: dia("2026-11-10"),
  };

  await prisma.attendance.createMany({
    data: [
      {
        professionalId: ana.id,
        placeId: hospital.id,
        professionalDays: dias("lun", "mar", "mie", "jue", "vie"),
        professionalTime: "8 a 12",
        professionalShift: "manana",
        professionalScheduleNote: HORARIO_HOSPITAL_MANANA,
        placeDays: dias("lun", "mar", "mie", "jue", "vie"),
        placeTime: "8 a 12",
        placeShift: "manana",
        ...acuerdo,
      },
      {
        professionalId: ana.id,
        placeId: consultorioAna.id,
        professionalDays: dias("lun", "mie", "vie"),
        professionalTime: "16 a 20",
        professionalShift: "tarde",
        professionalScheduleNote: HORARIO_CONSULTORIO_TARDE,
        placeDays: dias("lun", "mie", "vie"),
        placeTime: "16 a 20",
        placeShift: "tarde",
        ...acuerdo,
      },
      {
        professionalId: ana.id,
        placeId: sanatorio.id,
        professionalDays: dias("sab"),
        professionalTime: "24 h",
        professionalShift: "guardia",
        professionalScheduleNote: HORARIO_GUARDIA_SABADO,
        placeDays: dias("sab"),
        placeTime: "20 a 8",
        placeShift: "guardia",
        ...acuerdo,
      },
      {
        professionalId: mateo.id,
        placeId: hospital.id,
        professionalDays: dias("mar", "jue"),
        professionalTime: "9 a 13",
        professionalShift: "manana",
        professionalUpdatedAt: dia("2026-11-12"),
        placeDays: dias("lun", "mar", "mie", "jue", "vie"),
        placeTime: "8 a 12",
        placeShift: "manana",
        placeUpdatedAt: dia("2026-11-02"),
      },
      {
        professionalId: mateo.id,
        placeId: sanatorio.id,
        professionalDays: dias("lun", "mie"),
        professionalTime: "15 a 19",
        professionalShift: "tarde",
        placeDays: dias("lun", "mie"),
        placeTime: "15 a 19",
        placeShift: "tarde",
        ...acuerdo,
      },
      {
        professionalId: irene.id,
        placeId: consultorioOftalmo.id,
        professionalDays: dias("mar", "jue"),
        professionalTime: "9 a 13",
        professionalShift: "manana",
        placeDays: dias("mar", "jue"),
        placeTime: "9 a 13",
        placeShift: "manana",
        ...acuerdo,
      },
      {
        professionalId: pablo.id,
        placeId: consultorioOdonto.id,
        professionalDays: dias("lun", "mar", "mie", "jue"),
        professionalTime: "8 a 12",
        professionalShift: "manana",
        placeDays: dias("lun", "mar", "mie", "jue"),
        placeTime: "8 a 12",
        placeShift: "manana",
        ...acuerdo,
      },
      {
        professionalId: pablo.id,
        placeId: consultorioOdontoPR.id,
        professionalDays: dias("vie"),
        professionalTime: "14 a 18",
        professionalShift: "tarde",
        placeDays: dias("vie"),
        placeTime: "14 a 18",
        placeShift: "tarde",
        ...acuerdo,
      },
      {
        professionalId: carla.id,
        placeId: consultorioPsico.id,
        professionalDays: dias("lun", "mie", "vie"),
        professionalTime: "15 a 19",
        professionalShift: "tarde",
        placeDays: dias("lun", "mie", "vie"),
        placeTime: "15 a 19",
        placeShift: "tarde",
        ...acuerdo,
      },
      {
        professionalId: ivan.id,
        placeId: sanatorio.id,
        professionalDays: dias("jue"),
        professionalTime: "10 a 14",
        professionalShift: "manana",
        placeDays: dias("jue"),
        placeTime: "10 a 14",
        placeShift: "manana",
        ...acuerdo,
      },
      {
        professionalId: elena.id,
        placeId: consultorioKine.id,
        professionalDays: dias("lun", "mar", "mie", "jue", "vie"),
        professionalTime: "8 a 12",
        professionalShift: "manana",
        placeDays: dias("lun", "mar", "mie", "jue", "vie"),
        placeTime: "8 a 12",
        placeShift: "manana",
        ...acuerdo,
      },
      {
        professionalId: nora.id,
        placeId: consultorioNutri.id,
        professionalDays: dias("mar", "vie"),
        professionalTime: "9 a 13",
        professionalShift: "manana",
        placeDays: dias("mar", "vie"),
        placeTime: "9 a 13",
        placeShift: "manana",
        ...acuerdo,
      },
    ],
  });

  await publicarEjemplos();
  await actualizarFichaEjemploAna();
  console.log("Ejemplo cargado. Las fichas no tienen usuario.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
