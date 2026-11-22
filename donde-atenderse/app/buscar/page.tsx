import Link from "next/link";
import { Buscador } from "@/components/Buscador";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaListadoLugar } from "@/components/TarjetaListadoLugar";
import { TarjetaListadoProfesional } from "@/components/TarjetaListadoProfesional";
import { filaHorario } from "@/lib/map";
import { asistenciasEnLugaresPublicados } from "@/lib/publico";
import { catalogoObras, buscar } from "@/lib/search";
import { armarVistaProfesional } from "@/lib/view";

export default async function PaginaBuscar({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; localidad?: string; area?: string; obra?: string; estudios?: string; lat?: string; lng?: string }>;
}) {
  const filtros = await searchParams;
  const [{ personas, centros, q, localidad, area, obra, estudios, conUbicacion }, obras] = await Promise.all([
    buscar(filtros),
    catalogoObras(),
  ]);
  const buscaFarmacia = q.toLowerCase().includes("farmacia");

  return (
    <div className="grid gap-8">
      <header className="grid max-w-3xl gap-2">
        <h1 className="enlace-icono text-4xl font-bold tracking-tight">
          <IconoCercalud nombre={estudios ? "estudios" : "profesional"} size={34} className="text-menta" />
          {estudios ? "Laboratorios e imágenes" : "Profesionales"}
        </h1>
        <p className="text-muted">
          {estudios
            ? "Laboratorios, centros de diagnóstico por imágenes y lugares que publican qué prácticas realizan."
            : "Buscá por el nombre, la especialidad o el lugar."}
        </p>
      </header>
      <Buscador q={q} localidad={localidad} area={area} obra={obra} obras={obras} estudios={estudios} mostrarArea />
      <p className="text-muted">
        {personas.length} {personas.length === 1 ? "profesional" : "profesionales"} y {centros.length}{" "}
        {centros.length === 1 ? "lugar" : "lugares"}
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
      <section className={`grid gap-3 ${estudios ? "order-2" : ""}`}>
        {personas.map((persona) => {
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
            filas: asistenciasEnLugaresPublicados(persona.attendances).map(filaHorario),
          });
          return <TarjetaListadoProfesional key={persona.id} id={persona.id} vista={vista} ejemplo={persona.example} />;
        })}
      </section>
      <section className={`grid gap-3 ${estudios ? "order-1" : ""}`}>
        {centros.map((lugar) => (
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
        ))}
      </section>
    </div>
  );
}
