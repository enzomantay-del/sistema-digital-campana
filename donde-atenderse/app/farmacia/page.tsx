import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { PublicidadCreatividad } from "@/components/PublicidadCreatividad";
import { FarmaciaTurnoPagina, type FarmaciaTurnoPorLocalidad } from "@/components/FarmaciaTurnoPagina";
import { LayoutFarmaciaConPublicidad } from "@/components/LayoutFarmaciaConPublicidad";
import { LOCALIDADES } from "@/lib/constants";
import { farmaciasDeTurno } from "@/lib/search";

export default async function PaginaFarmacia() {
  const farmacias = await farmaciasDeTurno();
  const ahora = new Date();

  const porLocalidad: FarmaciaTurnoPorLocalidad[] = LOCALIDADES.map((localidad) => {
    const deAhi = farmacias.filter((farmacia) => farmacia.locality === localidad);
    const vigente = deAhi.find((farmacia) => farmacia.vigente);
    const vencido = !vigente
      ? deAhi.find((farmacia) => farmacia.ultimo && farmacia.ultimo.endsOn < ahora)
      : undefined;

    return {
      localidad,
      vigente:
        vigente?.vigente ?
          {
            nombre: vigente.name,
            direccion: vigente.address,
            logoUrl: vigente.logoUrl,
            whatsapp: vigente.whatsapp,
            telefono: vigente.phone,
            ejemplo: vigente.example,
            startsOn: vigente.vigente.startsOn.toISOString(),
            endsOn: vigente.vigente.endsOn.toISOString(),
            source: vigente.vigente.source,
          }
        : null,
      ultimoVencio: vencido?.ultimo ? vencido.ultimo.endsOn.toISOString() : null,
    };
  });

  return (
    <LayoutFarmaciaConPublicidad>
      <header className="grid max-w-3xl gap-3">
        <h1 className="enlace-icono text-4xl font-bold tracking-tight">
          <IconoCercalud nombre="farmacia" size={36} className="text-menta" />
          Farmacia de turno
        </h1>
        <p className="text-muted">
          Primero la farmacia de turno de tu ciudad (según tu ubicación o la localidad que elijas). Abajo podés consultar
          otras localidades del corredor si lo necesitás.
        </p>
      </header>
      <PublicidadCreatividad formato="banner" anchoFila />
      <div className="w-full max-w-3xl">
        <FarmaciaTurnoPagina porLocalidad={porLocalidad} />
      </div>
      <div className="w-full xl:hidden">
        <EspacioPublicitario
          formato="leaderboard"
          anchoFila
          descripcion="Banda amplia al cierre de la página en celular y tablet."
        />
      </div>
    </LayoutFarmaciaConPublicidad>
  );
}