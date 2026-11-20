import type { Metadata } from "next";
import Link from "next/link";
import { FichaProfesional } from "@/components/FichaProfesional";
import { PROFESIONAL_EJEMPLO_MODELO, profesionalEjemploModelo } from "@/lib/ejemplo";
import { filaHorario } from "@/lib/map";
import { armarVistaProfesional } from "@/lib/view";

export const metadata: Metadata = {
  title: `Ficha de ejemplo · ${PROFESIONAL_EJEMPLO_MODELO}`,
  description: "Ficha de profesional de ejemplo para probar Cercalud (foto, horarios, contacto).",
};

export default async function PaginaProfesionalEjemplo() {
  const persona = await profesionalEjemploModelo();
  if (!persona) {
    return (
      <div className="max-w-2xl grid gap-4">
        <h1 className="text-3xl font-bold">Ficha de ejemplo</h1>
        <p className="text-muted">
          En esta instalación todavía no hay fichas de ejemplo cargadas. Si estás probando en local, ejecutá{" "}
          <code className="rounded bg-paper px-1.5 py-0.5 text-sm">npm run db:seed</code> dentro de{" "}
          <code className="rounded bg-paper px-1.5 py-0.5 text-sm">donde-atenderse</code>.
        </p>
        <Link href="/" className="font-semibold text-link">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const vista = armarVistaProfesional({
    fullName: persona.fullName,
    specialty: persona.specialty,
    area: persona.area,
    license: persona.license,
    photoUrl: persona.photoUrl,
    price: persona.price,
    priceUpdatedAt: persona.priceUpdatedAt,
    whatsapp: persona.whatsapp,
    phone: persona.phone,
    obras: persona.obras.map((item) => item.obra.name),
    updatedAt: persona.updatedAt,
    filas: persona.attendances.map(filaHorario),
  });

  return (
    <div className="max-w-2xl grid gap-4">
      <p className="text-sm text-muted">
        Enlace fijo para probar la web. La ficha real está en{" "}
        <Link href={`/profesional/${persona.id}`} className="font-medium text-link">
          /profesional/{persona.id}
        </Link>
        .
      </p>
      <FichaProfesional vista={vista} ejemplo={persona.example} />
    </div>
  );
}