import Link from "next/link";
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
import { CrearUsuarioAdmin } from "@/components/CrearUsuarioAdmin";
import { PanelAdminSeccion } from "@/components/PanelAdminSeccion";
import { RecordatoriosInsigniaAdmin } from "@/components/RecordatoriosInsigniaAdmin";
import { RespaldoBaseAdmin } from "@/components/RespaldoBaseAdmin";
import { filasRecordatorioInsignia } from "@/lib/recordatorioInsignia";
import { requiereAdmin } from "@/lib/auth";
import { etiquetaArea, etiquetaLugar, fecha } from "@/lib/format";
import { lugarPermiteCargaSecretaria } from "@/lib/lugarAsignacion";
import { prisma } from "@/lib/prisma";

const accionesProfesional = {
  publicar: publicarProfesional,
  bajar: bajarProfesional,
  eliminar: eliminarProfesional,
  hrefLote: "/api/admin/profesionales",
};

const accionesLugar = {
  publicar: publicarLugar,
  bajar: bajarLugar,
  eliminar: eliminarLugar,
  hrefLote: "/api/admin/lugares",
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

export default async function PanelAdmin({
  searchParams,
}: {
  searchParams: Promise<{
    turnero_ok?: string;
    cargados?: string;
    turnero_sin?: string;
    turnero_invalidas?: string;
    turnero_error?: string;
    ok?: string;
    error?: string;
  }>;
}) {
  const admin = await requiereAdmin();
  const {
    turnero_ok: turneroOk,
    cargados,
    turnero_sin: turneroSinRaw,
    turnero_invalidas: turneroInvalidasRaw,
    turnero_error: turneroError,
    ok,
    error,
  } = await searchParams;
  const cargadosN = cargados ? Number(cargados) : undefined;
  const turneroSin = turneroSinRaw ? turneroSinRaw.split("|").filter(Boolean) : undefined;
  const turneroInvalidas = turneroInvalidasRaw ? turneroInvalidasRaw.split("|").filter(Boolean) : undefined;
  const [profesionalesPendientes, lugaresSugeridos, profesionales, lugares, profesionalesInsignia] = await Promise.all([
    prisma.professional.findMany({
      where: { reviewed: false },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.place.findMany({
      where: { suggestedById: { not: null }, published: false },
      include: { suggestedBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.professional.findMany({
      include: { user: true },
      orderBy: [{ published: "desc" }, { fullName: "asc" }],
    }),
    prisma.place.findMany({
      orderBy: [{ published: "desc" }, { locality: "asc" }, { name: "asc" }],
    }),
    prisma.professional.findMany({
      where: { published: true, reviewed: true, example: false },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        updatedAt: true,
        agendaWhatsapp: true,
        whatsapp: true,
        published: true,
        reviewed: true,
        example: true,
        attendances: {
          select: {
            professionalUpdatedAt: true,
            place: { select: { id: true, name: true, whatsapp: true, kind: true } },
          },
        },
      },
    }),
  ]);

  const recordatoriosInsignia = filasRecordatorioInsignia(profesionalesInsignia);

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

  const hayAvisos = ok === "usuario" || error === "usuario" || error === "correo" || error === "lugares";

  return (
    <div className="panel-admin mx-auto grid w-full max-w-4xl gap-5 px-1 sm:gap-6 sm:px-0">
      <header className="panel-admin-bloque grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid min-w-0 flex-1 gap-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-[1.65rem]">Administración</h1>
            <p className="text-sm text-muted">
              Hola, {admin.name}. Filtrá, seleccioná varios y publicá, bajá o eliminá de una vez.
              {recordatoriosInsignia.length > 0 ? (
                <span className="mt-1 block font-semibold text-amber-800">
                  {recordatoriosInsignia.length} recordatorio
                  {recordatoriosInsignia.length === 1 ? "" : "s"} de insignia pendiente
                  {recordatoriosInsignia.length === 1 ? "" : "s"} (5 días o menos).
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/panel/lugar/nuevo" className="boton">
              Cargar un lugar
            </Link>
            <form method="POST" action="/api/salir">
              <button className="boton-suave" type="submit">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      {hayAvisos ? (
        <div className="panel-admin-bloque grid gap-2">
          {ok === "usuario" ? (
            <p className="rounded-xl border border-menta bg-[#e8f7f3] px-3 py-2 text-sm text-menta">
              Usuario creado. Pasale el link de ingreso, el correo y la contraseña que definiste.
            </p>
          ) : null}
          {error === "usuario" ? <p className="text-sm text-warn">Revisá nombre, correo, contraseña y rol.</p> : null}
          {error === "correo" ? <p className="text-sm text-warn">Ya existe una cuenta con ese correo.</p> : null}
          {error === "lugares" ? (
            <p className="text-sm text-warn">Las secretarias necesitan al menos un lugar asignado.</p>
          ) : null}
        </div>
      ) : null}

      <PanelAdminSeccion
        titulo="Insignia de verificación"
        descripcion="Fichas publicadas que vencen en 5 días o menos (o vencieron hace poco). WhatsApp con mensaje listo."
      >
        <RecordatoriosInsigniaAdmin filas={recordatoriosInsignia} />
      </PanelAdminSeccion>

      <PanelAdminSeccion
        titulo="Crear usuario"
        descripcion="Cuentas para secretarias (cargan profesionales del lugar) o profesionales (solo su ficha)."
      >
        <CrearUsuarioAdmin lugares={lugares.filter((lugar) => lugarPermiteCargaSecretaria(lugar.kind))} />
      </PanelAdminSeccion>

      <PanelAdminSeccion titulo="Respaldo para migrar">
        <RespaldoBaseAdmin />
      </PanelAdminSeccion>

      <PanelAdminSeccion titulo="Fichas a revisar" descripcion="Pendientes de revisión antes de publicar.">
        <GestionAdminLista
          filas={filasPendientes}
          vacio="No hay fichas pendientes."
          etiquetaItem="ficha"
          acciones={accionesProfesional}
          filtros="profesional"
        />
      </PanelAdminSeccion>

      <PanelAdminSeccion titulo="Lugares sugeridos" descripcion="Propuestas enviadas por usuarios, sin publicar.">
        <GestionAdminLista
          filas={filasSugeridos}
          vacio="No hay sugerencias."
          etiquetaItem="lugar"
          acciones={accionesLugar}
          filtros="lugar"
        />
      </PanelAdminSeccion>

      <PanelAdminSeccion titulo="Profesionales" descripcion="Todas las fichas de personas.">
        <GestionAdminLista
          filas={profesionales.map((persona) => filaProfesional(persona))}
          vacio="Todavía no hay fichas."
          etiquetaItem="ficha"
          acciones={accionesProfesional}
          filtros="profesional"
        />
      </PanelAdminSeccion>

      <PanelAdminSeccion titulo="Turnero de farmacias">
        <ImportarTurneroFarmacia
          turneroOk={turneroOk === "1"}
          cargados={Number.isFinite(cargadosN) ? cargadosN : undefined}
          turneroSin={turneroSin}
          turneroInvalidas={turneroInvalidas}
          turneroError={turneroError}
        />
      </PanelAdminSeccion>

      <PanelAdminSeccion
        titulo="Lugares"
        descripcion="Centros, consultorios, laboratorios e imágenes del corredor."
        accion={
          <Link href="/panel/lugar/nuevo" className="text-sm font-semibold text-link">
            Cargar otro
          </Link>
        }
      >
        <GestionAdminLista
          filas={lugares.map((lugar) => filaLugar(lugar))}
          vacio="Todavía no hay lugares."
          etiquetaItem="lugar"
          acciones={accionesLugar}
          filtros="lugar"
        />
      </PanelAdminSeccion>
    </div>
  );
}