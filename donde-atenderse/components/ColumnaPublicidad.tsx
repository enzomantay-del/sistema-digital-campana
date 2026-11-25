import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { PublicidadCreatividad } from "@/components/PublicidadCreatividad";

type Perfil = "ficha" | "listado" | "farmacia";

export function ColumnaPublicidad({ perfil = "ficha" }: { perfil?: Perfil }) {
  if (perfil === "ficha") {
    return (
      <aside className="grid w-full gap-3 lg:min-h-[min(100vh-7rem,920px)] lg:grid-rows-2" aria-label="Espacios publicitarios">
        <EspacioPublicitario
          formato="skyscraper"
          rellenoVertical
          descripcion="Columna junto a fichas de profesionales y lugares."
        />
        <EspacioPublicitario formato="vertical-alto" rellenoVertical descripcion="Segundo bloque en la misma columna." />
      </aside>
    );
  }

  if (perfil === "farmacia") {
    return (
      <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
        <PublicidadCreatividad formato="skyscraper" />
      </aside>
    );
  }

  return (
    <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
      <PublicidadCreatividad formato="skyscraper" />
    </aside>
  );
}