import { prisma } from "@/lib/prisma";
import type { ImagenAlmacenada, Prisma } from "@prisma/client";

export const RESPALDO_VERSION = 1;

export type RespaldoCercalud = {
  version: number;
  exportedAt: string;
  counts: Record<string, number>;
  data: {
    users: Prisma.UserCreateManyInput[];
    professionals: Prisma.ProfessionalCreateManyInput[];
    places: Prisma.PlaceCreateManyInput[];
    placeEditors: Prisma.PlaceEditorCreateManyInput[];
    obraSociales: Prisma.ObraSocialCreateManyInput[];
    professionalObras: Prisma.ProfessionalObraCreateManyInput[];
    placeObras: Prisma.PlaceObraCreateManyInput[];
    attendances: Prisma.AttendanceCreateManyInput[];
    attendanceObras: Prisma.AttendanceObraCreateManyInput[];
    studies: Prisma.StudyCreateManyInput[];
    pharmacyDuties: Prisma.PharmacyDutyCreateManyInput[];
    authRateLimits: Prisma.AuthRateLimitCreateManyInput[];
    imagenes: (Omit<ImagenAlmacenada, "datos"> & { datosBase64: string })[];
  };
};

type ImagenJson = RespaldoCercalud["data"]["imagenes"][number];

function imagenParaJson(img: ImagenAlmacenada): ImagenJson {
  const { datos, ...resto } = img;
  return { ...resto, datosBase64: Buffer.from(datos).toString("base64") };
}

function imagenDesdeJson(img: ImagenJson): Prisma.ImagenAlmacenadaCreateManyInput {
  const { datosBase64, ...resto } = img;
  return {
    ...resto,
    datos: Buffer.from(datosBase64, "base64"),
  };
}

export async function exportarRespaldoBase(): Promise<RespaldoCercalud> {
  const [
    users,
    professionals,
    places,
    placeEditors,
    obraSociales,
    professionalObras,
    placeObras,
    attendances,
    attendanceObras,
    studies,
    pharmacyDuties,
    authRateLimits,
    imagenesRaw,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.professional.findMany(),
    prisma.place.findMany(),
    prisma.placeEditor.findMany(),
    prisma.obraSocial.findMany(),
    prisma.professionalObra.findMany(),
    prisma.placeObra.findMany(),
    prisma.attendance.findMany(),
    prisma.attendanceObra.findMany(),
    prisma.study.findMany(),
    prisma.pharmacyDuty.findMany(),
    prisma.authRateLimit.findMany(),
    prisma.imagenAlmacenada.findMany(),
  ]);

  const imagenes = imagenesRaw.map(imagenParaJson);
  const counts: Record<string, number> = {
    users: users.length,
    professionals: professionals.length,
    places: places.length,
    imagenes: imagenes.length,
  };

  return {
    version: RESPALDO_VERSION,
    exportedAt: new Date().toISOString(),
    counts,
    data: {
      users,
      professionals,
      places,
      placeEditors,
      obraSociales,
      professionalObras,
      placeObras,
      attendances,
      attendanceObras,
      studies,
      pharmacyDuties,
      authRateLimits,
      imagenes,
    },
  };
}

export async function restaurarRespaldoBase(respaldo: RespaldoCercalud) {
  if (respaldo.version !== RESPALDO_VERSION) {
    throw new Error(`Versión de respaldo no compatible: ${respaldo.version}`);
  }
  const { data } = respaldo;

  await prisma.$transaction(async (tx) => {
    await vaciarTablasEnTx(tx);

    if (data.users.length) await tx.user.createMany({ data: data.users });
    if (data.obraSociales.length) await tx.obraSocial.createMany({ data: data.obraSociales });
    if (data.professionals.length) await tx.professional.createMany({ data: data.professionals });
    if (data.places.length) await tx.place.createMany({ data: data.places });
    if (data.placeEditors.length) await tx.placeEditor.createMany({ data: data.placeEditors });
    if (data.professionalObras.length) await tx.professionalObra.createMany({ data: data.professionalObras });
    if (data.placeObras.length) await tx.placeObra.createMany({ data: data.placeObras });
    if (data.attendances.length) await tx.attendance.createMany({ data: data.attendances });
    if (data.attendanceObras.length) await tx.attendanceObra.createMany({ data: data.attendanceObras });
    if (data.studies.length) await tx.study.createMany({ data: data.studies });
    if (data.pharmacyDuties.length) await tx.pharmacyDuty.createMany({ data: data.pharmacyDuties });
    if (data.authRateLimits.length) await tx.authRateLimit.createMany({ data: data.authRateLimits });
    if (data.imagenes.length) {
      await tx.imagenAlmacenada.createMany({ data: data.imagenes.map(imagenDesdeJson) });
    }
  });
}

async function vaciarTablasEnTx(tx: Prisma.TransactionClient) {
  await tx.attendanceObra.deleteMany();
  await tx.attendance.deleteMany();
  await tx.professionalObra.deleteMany();
  await tx.placeObra.deleteMany();
  await tx.study.deleteMany();
  await tx.pharmacyDuty.deleteMany();
  await tx.placeEditor.deleteMany();
  await tx.imagenAlmacenada.deleteMany();
  await tx.professional.deleteMany();
  await tx.place.deleteMany();
  await tx.obraSocial.deleteMany();
  await tx.authRateLimit.deleteMany();
  await tx.user.deleteMany();
}