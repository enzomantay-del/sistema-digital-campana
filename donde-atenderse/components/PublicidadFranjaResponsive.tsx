import { PublicidadCreatividad } from "@/components/PublicidadCreatividad";

type DestinoMovil = "farmacia" | "doctor";

/**
 * Celular: video vertical legible (farmacia o doctor según página).
 * Tablet/PC: banda horizontal farmacia.
 */
export function PublicidadFranjaResponsive({ destinoMovil = "doctor" }: { destinoMovil?: DestinoMovil }) {
  const formatoMovil = destinoMovil === "farmacia" ? "vertical-alto" : "skyscraper";

  return (
    <>
      <div className="w-full py-0.5 md:hidden">
        <PublicidadCreatividad
          formato={formatoMovil}
          etiquetaAccesible={
            destinoMovil === "farmacia" ? "Publicidad farmacia en video" : "Publicidad profesional en video"
          }
        />
      </div>
      <div className="hidden w-full py-0.5 md:block">
        <PublicidadCreatividad formato="banner" anchoFila />
      </div>
    </>
  );
}