import Link from "next/link";
import { salir } from "@/actions/auth";
import {
  bajarLugar,
  bajarProfesional,
  eliminarLugar,
  eliminarProfesional,
  publicarLugar,
  publicarProfesional,
} from "@/actions/admin";
import { GestionAdminLista, type FilaAdmin } from "@/components/GestionAdminLista";
import { ImportarTurneroFarmacia } from "@/components/ImportarTurneroFarmacia";
import { requiereAdmin } from "@/lib/auth";
import { etiquetaArea, etiquetaLugar, fecha } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const accionesProfesional = {
  publicar: publicarProfesional,
  bajar: bajarProfesional,
  eliminar: eliminarProfesional,
};

const accionesLugar = {
  publicar: publicarLugar,
  bajar: bajarLugar,
  eliminar: eliminarLugar,
};

function filaProfesional(
  persona: {
    id: string;
    fullName: string;
    specialty: string;
    area: string;
    license: string;
    whatsapp: string;
    published: boolean;
    reviewed: boolean;
    example: boolean;
    createdAt: Date;
    user: { email: string } | null;
  },
  extra?: string,
): FilaAdmin {
  return {
    id: persona.id,
    titulo: persona.fullName,
    detalle: [
      persona.specialty || "Sin especialidad",
      etiquetaArea(persona.area),
      persona.published ? "Publicada" : "Sin publicar",
      persona.reviewed ? null : "Sin revisar",
      persona.example ? "Dato de ejemplo" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    extra:
      extra ??
      [
        persona.license ? `Mat. ${persona.license}` : null,
        persona.whatsapp ? `WhatsApp ${persona.whatsapp}` : null,
        persona.user?.email ?? null,
      ]
        .filter(Boolean)
        .join(" · "),
    hrefEditar: `/panel/admin/profesional/${persona.id}`,
    published: persona.published,
    reviewed: persona.reviewed,
    example: persona.example,
    area: persona.area,
  };
}

function filaLugar(
  lugar: {
    id: string;
    name: string;
    kind: string;
    locality: string;
    address: string;
    published: boolean;
    example: boolean;
    suggestedById: string | null;
    suggestedBy?: { name: string; email: string } | null;
  },
  extra?: string,
): FilaAdmin {
  return {
    id: lugar.id,
    titulo: lugar.name,
    detalle: [
      etiquetaLugar(lugar.kind),
      lugar.locality,
      lugar.published ? "Publicado" : "Sin publicar",
      lugar.example ? "Dato de ejemplo" : null,
      lugar.suggestedById ? "Sugerido" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    extra:
      extra ??
      [
        lugar.address ? lugar.address : null,
        lugar.suggestedBy ? `Sugerido por ${lugar.suggestedBy.name}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    hrefEditar: `/panel/lugar/${lugar.id}`,
    published: lugar.published,
    example: lugar.example,
    locality: lugar.locality,
    kind: lugar.kind,
    sugerido: Boolean(lugar.suggestedById),
  };
}

export default async function PanelAdmin() {
  const admin = await requiereAdmin();
  const [profesionalesPendientes, lugaresSugeridos, profesionales, lugares] = await Promise.all([
    prisma.professional.findMany({
      where: { reviewed: false },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.place.findMany({
      where: { suggestedById: { not: null } },
      include: { suggestedBy: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.professional.findMany({
      include: { user: true },
      orderBy: [{ published: "desc" }, { fullName: "asc" }],
    }),
    prisma.place.findMany({
      orderBy: [{ published: "desc" }, { locality: "asc" }, { name: "asc" }],
    }),
  ]);

  const filasPendientes: FilaAdmin[] = profesionalesPendientes.map((persona) =>
    filaProfesional(persona, `Cargada el ${fecha(persona.createdAt)}`),
  );
  const filasSugeridos: FilaAdmin[] = lugaresSugeridos.map((lugar) =>
    filaLugar(
      lugar,
      [
        lugar.suggestedBy?.email ? `(${lugar.suggestedBy.email})` : null,
        !lugar.published ? "Pendiente de publicación" : null,
      ]
        .filter(Boolean)
        .join(" · "),
    ),
  );

  return (
    <div className="panel-admin mx-auto grid w-full max-w-4xl gap-7">
      <header className="mx-auto grid w-full max-w-2xl gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Administración</h1>
        <p className="text-sm text-muted">
          Hola, {admin.name}. Filtrá, seleccioná varios y publicá, bajá o eliminá de una vez.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/panel/lugar/nuevo" className="boton">
            Cargar un lugar
          </Link>
          <form action={salir}>
            <button className="boton-suave" type="submit">
              Salir
            </button>
          </form>
        </div>
      </header>

      <section className="grid gap-2">
        <h2 className="text-center text-lg font-semibold">Fichas a revisar</h2>
        <GestionAdminLista
          filas={filasPendientes}
          vacio="No hay fichas pendientes."
          etiquetaItem="ficha"
          acciones={accionesProfesional}
          filtros="profesional"
        />
      </section>

      <section className="grid gap-2">
        <h2 className="text-center text-lg font-semibold">Lugares sugeridos</h2>
        <GestionAdminLista
          filas={filasSugeridos}
          vacio="No hay sugerencias."
          etiquetaItem="lugar"
          acciones={accionesLugar}
          filtros="lugar"
        />
      </section>

      <section className="grid gap-2">
        <h2 className="text-center text-lg font-semibold">Profesionales</h2>
        <GestionAdminLista
          filas={profesionales.map((persona) => filaProfesional(persona))}
          vacio="Todavía no hay fichas."
          etiquetaItem="ficha"
          acciones={accionesProfesional}
          filtros="profesional"
        />
      </section>

      <section className="flex justify-center">
        <ImportarTurneroFarmacia />
      </section>

      <section className="grid gap-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
          <h2 className="text-lg font-semibold">Lugares</h2>
          <Link href="/panel/lugar/nuevo" className="text-sm font-semibold text-link">
            Cargar otro
          </Link>
        </div>
        <GestionAdminLista
          filas={lugares.map((lugar) => filaLugar(lugar))}
          vacio="Todavía no hay lugares."
          etiquetaItem="lugar"
          acciones={accionesLugar}
          filtros="lugar"
        />
      </section>
    </div>
  );
}