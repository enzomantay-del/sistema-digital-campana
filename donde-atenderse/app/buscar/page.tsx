import Link from "next/link";
import { Buscador } from "@/components/Buscador";
import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { LayoutListadoConPublicidad } from "@/components/LayoutListadoConPublicidad";
import { IconoCercalud, type NombreIconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaListadoLugar } from "@/components/TarjetaListadoLugar";
import { TarjetaListadoProfesional } from "@/components/TarjetaListadoProfesional";
import { filaHorario } from "@/lib/map";
import { asistenciasEnLugaresPublicados } from "@/lib/publico";
import { catalogoObras, buscar } from "@/lib/search";
import { intercalarPublicidadEnListado } from "@/lib/intercalarPublicidad";
import { armarVistaProfesional } from "@/lib/view";

function encabezadoBuscar(estudios: boolean, centrosSalud: boolean) {
  if (estudios) {
    return {
      icono: "estudios" as NombreIconoCercalud,
      titulo: "Laboratorios e imágenes",
      texto: "Laboratorios, centros de diagnóstico por imágenes y lugares que publican qué prácticas realizan.",
    };
  }
  if (centrosSalud) {
    return {
      icono: "centro-salud" as NombreIconoCercalud,
      titulo: "Centros de salud",
      texto: "Hospitales, sanatorios, policonsultorios y consultorios del corredor (incluidos consultorios odontológicos como lugar).",
    };
  }
  return {
    icono: "profesional" as NombreIconoCercalud,
    titulo: "Profesionales",
    texto: "Buscá por el nombre, la especialidad o el lugar.",
  };
}

export default async function PaginaBuscar({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    localidad?: string;
    area?: string;
    obra?: string;
    estudios?: string;
    centros?: string;
    lat?: string;
    lng?: string;
  }>;
}) {
  const filtros = await searchParams;
  const [{ personas, centros, q, localidad, area, obra, estudios, centrosSalud, conUbicacion }, obras] =
    await Promise.all([buscar(filtros), catalogoObras()]);
  const buscaFarmacia = q.toLowerCase().includes("farmacia");
  const encabezado = encabezadoBuscar(Boolean(estudios), Boolean(centrosSalud));
  const lugaresPrimero = estudios || centrosSalud;

  const filasProfesionales = personas.map((persona) => {
    const vista = armarVistaProfesional({
      fullName: persona.fullName,
      specialty: persona.specialty,
      specialties: persona.specialties,
      area: persona.area,
      license: persona.license,
      photoUrl: persona.photoUrl,
      price: persona.price,
      priceUpdatedAt: persona.priceUpdatedAt,
      whatsapp: persona.whatsapp,
      phone: persona.phone,
      agendaWhatsapp: persona.agendaWhatsapp,
      agendaPhone: persona.agendaPhone,
      obras: persona.obras.map((item) => item.obra.name),
      updatedAt: persona.updatedAt,
      filas: asistenciasEnLugaresPublicados(persona.attendances).map(filaHorario),
    });
    return <TarjetaListadoProfesional key={persona.id} id={persona.id} vista={vista} ejemplo={persona.example} />;
  });

  const filasLugares = centros.map((lugar) => (
    <TarjetaListadoLugar
      key={lugar.id}
      lugar={{
        id: lugar.id,
        name: lugar.name,
        kind: lugar.kind,
        locality: lugar.locality,
        logoUrl: lugar.logoUrl,
        example: lugar.example,
        updatedAt: lugar.updatedAt,
        attendances: lugar.attendances,
        studies: lugar.studies,
      }}
    />
  ));

  return (
    <LayoutListadoConPublicidad>
      <header className="grid max-w-3xl gap-2">
        <h1 className="enlace-icono text-4xl font-bold tracking-tight">
          <IconoCercalud nombre={encabezado.icono} size={34} className="text-menta" />
          {encabezado.titulo}
        </h1>
        <p className="text-muted">{encabezado.texto}</p>
      </header>
      <Buscador
        q={q}
        localidad={localidad}
        area={area}
        obra={obra}
        obras={obras}
        estudios={Boolean(estudios)}
        centrosSalud={Boolean(centrosSalud)}
        mostrarArea
        placeholder={
          centrosSalud
            ? "Nombre del hospital, sanatorio o consultorio"
            : estudios
              ? "Nombre del laboratorio o centro de imágenes"
              : undefined
        }
      />
      <div className="py-0.5">
        <EspacioPublicitario formato="banner" />
      </div>
      <p className="text-muted">
        {centrosSalud && !q ? (
          <>
            {centros.length} {centros.length === 1 ? "centro" : "centros"} de salud
          </>
        ) : estudios && !q ? (
          <>
            {centros.length} {centros.length === 1 ? "lugar" : "lugares"} de laboratorios e imágenes
          </>
        ) : (
          <>
            {personas.length} {personas.length === 1 ? "profesional" : "profesionales"} y {centros.length}{" "}
            {centros.length === 1 ? "lugar" : "lugares"}
          </>
        )}
        {conUbicacion && !localidad ? " · Primero, lo que está más cerca de tu ubicación." : ""}
      </p>
      {buscaFarmacia ? (
        <Link href="/farmacia" className="font-semibold text-link">
          La farmacia de turno está en su propia página.
        </Link>
      ) : null}
      {personas.length === 0 && centros.length === 0 ? (
        <p>No hay fichas con esos datos. Probá con otra palabra o con otra localidad.</p>
      ) : null}
      <section className={`grid gap-3 ${lugaresPrimero ? "order-2" : ""}`}>
        {intercalarPublicidadEnListado(filasProfesionales)}
      </section>
      <section className={`grid gap-3 ${lugaresPrimero ? "order-1" : ""}`}>
        {intercalarPublicidadEnListado(filasLugares)}
      </section>
      <div className="py-0.5 xl:hidden">
        <EspacioPublicitario formato="vertical-alto" />
      </div>
      <div className="py-0.5">
        <EspacioPublicitario formato="leaderboard" />
      </div>
    </LayoutListadoConPublicidad>
  );
}