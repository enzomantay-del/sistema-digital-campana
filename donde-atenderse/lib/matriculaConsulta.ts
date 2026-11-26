import { claveMatricula } from "@/lib/matricula";
import { prisma } from "@/lib/prisma";

export type ConsultaMatricula =
  | { estado: "incompleta" }
  | { estado: "libre" }
  | {
      estado: "existe";
      id: string;
      fullName: string;
      tieneCuenta: boolean;
      publicada: boolean;
      mismoId: boolean;
    };

export async function consultarMatriculaEnSistema(license: string, professionalId?: string): Promise<ConsultaMatricula> {
  const clave = claveMatricula(license);
  if (!clave) return { estado: "incompleta" };

  const otro = await prisma.professional.findFirst({
    where: {
      licenseKey: clave,
      ...(professionalId ? { NOT: { id: professionalId } } : {}),
    },
    select: { id: true, fullName: true, userId: true, published: true },
  });

  if (!otro) return { estado: "libre" };

  return {
    estado: "existe",
    id: otro.id,
    fullName: otro.fullName,
    tieneCuenta: Boolean(otro.userId),
    publicada: otro.published,
    mismoId: professionalId === otro.id,
  };
}