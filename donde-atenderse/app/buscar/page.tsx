import Link from "next/link";
import { Buscador } from "@/components/Buscador";
import { etiquetaLugar } from "@/lib/format";
import { filaHorario } from "@/lib/map";
import { catalogoObras, buscar } from "@/lib/search";
import { armarVistaProfesional } from "@/lib/view";

export default async function PaginaBuscar({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; localidad?: string; area?: string; obra?: string }>;
}) {
  const filtros = await searchParams;
  const [{ personas, centros, q, localidad, area, obra }, obras] = await Promise.all([
    buscar(filtros),
    catalogoObras(),
  ]);
  const buscaFarmacia = q.toLowerCase().includes("farmacia");

  return (
    <div className="grid gap-8">
      <h1 className="text-4xl font-semibold tracking-tight">Buscar</h1>
      <Buscador q={q} localidad={localidad} area={area} obra={obra} obras={obras} mostrarFiltros />
      <p className="text-muted">
        {personas.length} {personas.length === 1 ? "profesional" : "profesionales"} y {centros.length}{" "}
        {centros.length === 1 ? "lugar" : "lugares"}
      </p>
      {buscaFarmacia ? (
        <Link href="/farmacia" className="font-semibold text-accent">
          La farmacia de turno está en su propia página.
        </Link>
      ) : null}
      {personas.length === 0 && centros.length === 0 ? (
        <p>No hay fichas con esos datos. Probá con otra palabra o con otra localidad.</p>
      ) : null}
      <section className="grid">
        {personas.map((persona) => {
          const vista = armarVistaProfesional({
            fullName: persona.fullName,
            specialty: persona.specialty,
            area: persona.area,
            license: persona.license,
            price: persona.price,
            priceUpdatedAt: persona.priceUpdatedAt,
            whatsapp: persona.whatsapp,
            phone: persona.phone,
            obras: persona.obras.map((item) => item.obra.name),
            updatedAt: persona.updatedAt,
            filas: persona.attendances.map(filaHorario),
          });
          return (
            <Link key={persona.id} href={`/profesional/${persona.id}`} className="border-t border-line py-5 hover:text-accent">
              <h2 className="text-2xl font-semibold text-ink">{vista.nombre}</h2>
              <p className="text-muted">
                {vista.especialidad} · {vista.area}
                {persona.example ? " · Dato de ejemplo" : ""}
              </p>
              <ul className="mt-2 grid gap-1">
                {vista.bloques.flatMap((bloque) =>
                  bloque.lineas.map((linea) => (
                    <li key={linea.id}>
                      {bloque.titulo} · {linea.rotulo}
                      {linea.locality ? ` · ${linea.locality}` : ""}
                    </li>
                  )),
                )}
              </ul>
            </Link>
          );
        })}
      </section>
      <section className="grid">
        {centros.map((lugar) => (
          <Link key={lugar.id} href={`/lugar/${lugar.id}`} className="border-t border-line py-5">
            <h2 className="text-2xl font-semibold">{lugar.name}</h2>
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
