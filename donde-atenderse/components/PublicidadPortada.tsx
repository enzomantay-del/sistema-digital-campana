import { PublicidadCreatividad } from "@/components/PublicidadCreatividad";

/** Banda principal bajo el buscador en inicio. */
export function PublicidadPortada() {
  return (
    <>
      <div className="w-full md:hidden">
        <PublicidadCreatividad formato="skyscraper" etiquetaAccesible="Publicidad en video vertical" />
      </div>
      <div className="hidden w-full md:block">
        <PublicidadCreatividad formato="leaderboard" anchoFila />
      </div>
    </>
  );
}