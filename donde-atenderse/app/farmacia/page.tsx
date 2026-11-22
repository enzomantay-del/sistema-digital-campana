import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { LOCALIDADES } from "@/lib/constants";
import { fecha, textoVigenciaTurnoFarmacia } from "@/lib/format";
import { farmaciasDeTurno } from "@/lib/search";

export default async function PaginaFarmacia() {
  const farmacias = await farmaciasDeTurno();
  return (
    <div className="grid max-w-3xl gap-8">
      <header className="grid gap-3">
        <h1 className="enlace-icono text-4xl font-bold tracking-tight">
          <IconoCercalud nombre="farmacia" size={36} className="text-menta" />
          Farmacia de turno
        </h1>
        <p className="text-muted">
          Mostramos el turno con día y hora de inicio y fin, según el turnero oficial del corredor. Fuera de ese rango, esa
          farmacia no figura como de turno.
        </p>
      </header>
      {LOCALIDADES.map((localidad) => {
        const deAhi = farmacias.filter((farmacia) => farmacia.locality === localidad);
        const vigente = deAhi.find((farmacia) => farmacia.vigente);
        const vencido = !vigente ? deAhi.find((farmacia) => farmacia.ultimo && farmacia.ultimo.endsOn < new Date()) : undefined;
        return (
          <section key={localidad} className="tarjeta grid gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{localidad}</h2>
            {vigente?.vigente ? (
              <div className="grid gap-1">
                <p className="text-xl">{vigente.name}</p>
                {vigente.address ? <p>{vigente.address}</p> : null}
                <p className="text-muted">{textoVigenciaTurnoFarmacia(vigente.vigente.startsOn, vigente.vigente.endsOn)}</p>
                {vigente.vigente.source ? <p className="text-base text-muted">{vigente.vigente.source}</p> : null}
                {vigente.example ? <p className="text-base text-warn">Dato de ejemplo.</p> : null}
              </div>
            ) : (
              <p className="text-muted">
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
