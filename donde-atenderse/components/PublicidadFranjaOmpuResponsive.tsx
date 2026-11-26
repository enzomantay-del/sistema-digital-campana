import { EspacioPublicitario } from "@/components/EspacioPublicitario";

/** Banda horizontal en desktop / rectángulo medio en móvil (misma ubicación en la página). */
export function PublicidadFranjaOmpuResponsive({
  descripcionDesktop,
  descripcionMovil,
}: {
  descripcionDesktop: string;
  descripcionMovil: string;
}) {
  return (
    <>
      <div className="w-full md:hidden">
        <EspacioPublicitario formato="mpu" destino="principal" descripcion={descripcionMovil} />
      </div>
      <div className="hidden w-full md:block">
        <EspacioPublicitario destino="franja" formato="leaderboard" anchoFila descripcion={descripcionDesktop} />
      </div>
    </>
  );
}