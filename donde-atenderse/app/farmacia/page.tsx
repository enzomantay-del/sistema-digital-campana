import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaFarmaciaTurno } from "@/components/TarjetaFarmaciaTurno";
import { LOCALIDADES } from "@/lib/constants";
import { fecha } from "@/lib/format";
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
          <section key={localidad} className="tarjeta grid gap-4">
            <h2 className="text-2xl font-bold tracking-tight">{localidad}</h2>
            {vigente?.vigente ? (
              <TarjetaFarmaciaTurno
                nombre={vigente.name}
                localidad={vigente.locality}
                direccion={vigente.address}
                logoUrl={vigente.logoUrl}
                whatsapp={vigente.whatsapp}
                telefono={vigente.phone}
                ejemplo={vigente.example}
                turno={{
                  startsOn: vigente.vigente.startsOn,
                  endsOn: vigente.vigente.endsOn,
                  source: vigente.vigente.source,
                }}
              />
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