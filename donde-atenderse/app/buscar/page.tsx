import Link from "next/link";
import { Buscador } from "@/components/Buscador";
import { etiquetaLugar } from "@/lib/format";
import { filaHorario } from "@/lib/map";
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
        <h1 className="text-4xl font-bold tracking-tight">{estudios ? "Estudios" : "Profesionales"}</h1>
        <p className="text-muted">
          {estudios
            ? "Centros de imágenes, laboratorios y lugares que cargaron un estudio."
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
            filas: persona.attendances.map(filaHorario),
          });
          return (
            <Link key={persona.id} href={`/profesional/${persona.id}`} className="tarjeta block transition hover:border-link">
              <h2 className="text-2xl font-bold tracking-tight text-ink">{vista.nombre}</h2>
              <p className="text-muted">
                {vista.especialidad} · {vista.area}
                {persona.example ? " · Dato de ejemplo" : ""}
              </p>
              <ul className="mt-2 grid gap-2 text-sm">
                {vista.bloques.flatMap((bloque) =>
                  bloque.lineas.map((linea) => (
                    <li key={linea.id}>
                      <span className="font-semibold text-ink">
                        {linea.rotulo}
                        {linea.locality ? ` · ${linea.locality}` : ""}
                      </span>
                      {linea.detalle ? <p className="mt-0.5 text-muted">{linea.detalle}</p> : null}
                    </li>
                  )),
                )}
              </ul>
            </Link>
          );
        })}
      </section>
      <section className={`grid gap-3 ${estudios ? "order-1" : ""}`}>
        {centros.map((lugar) => (
          <Link key={lugar.id} href={`/lugar/${lugar.id}`} className="tarjeta block transition hover:border-link">
            <h2 className="text-2xl font-bold tracking-tight">{lugar.name}</h2>
            <p className="text-muted">
              {etiquetaLugar(lugar.kind)} · {lugar.locality}
              {lugar.example ? " · Dato de ejemplo" : ""}
            </p>
            {lugar.studies.length > 0 ? (
              <p className="mt-1">{lugar.studies.map((estudio) => estudio.name).join(" · ")}</p>
            ) : null}
          </Link>
        ))}
      </section>
    </div>
  );
}
