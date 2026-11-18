import { LOCALIDADES } from "@/lib/constants";
import { fecha } from "@/lib/format";
import { farmaciasDeTurno } from "@/lib/search";

export default async function PaginaFarmacia() {
  const farmacias = await farmaciasDeTurno();
  return (
    <div className="grid max-w-3xl gap-8">
      <header className="grid gap-3">
        <h1 className="text-4xl font-semibold tracking-tight">Farmacia de turno</h1>
        <p className="text-muted">
          El turno se muestra con la fecha cargada. Si esa fecha ya pasó, no lo tomes como el
          turno de hoy.
        </p>
      </header>
      {LOCALIDADES.map((localidad) => {
        const deAhi = farmacias.filter((farmacia) => farmacia.locality === localidad);
        const vigente = deAhi.find((farmacia) => farmacia.vigente);
        const vencido = !vigente ? deAhi.find((farmacia) => farmacia.ultimo && farmacia.ultimo.endsOn < new Date()) : undefined;
        return (
          <section key={localidad} className="border-t border-line pt-5">
            <h2 className="text-2xl font-semibold">{localidad}</h2>
            {vigente?.vigente ? (
              <div className="mt-2 grid gap-1">
                <p className="text-xl">{vigente.name}</p>
                {vigente.address ? <p>{vigente.address}</p> : null}
                <p className="text-muted">
                  Del {fecha(vigente.vigente.startsOn)} al {fecha(vigente.vigente.endsOn)}.
                </p>
                {vigente.vigente.source ? <p className="text-base text-muted">{vigente.vigente.source}</p> : null}
                {vigente.example ? <p className="text-base text-warn">Dato de ejemplo.</p> : null}
              </div>
            ) : (
              <p className="mt-2 text-muted">
                Todavía no hay un turno cargado para esta fecha.
                {vencido?.ultimo ? ` El último venció el ${fecha(vencido.ultimo.endsOn)}.` : ""}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
