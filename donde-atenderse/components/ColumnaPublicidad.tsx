import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { PublicidadCreatividad } from "@/components/PublicidadCreatividad";

type Perfil = "ficha" | "listado" | "farmacia";

export function ColumnaPublicidad({ perfil = "ficha" }: { perfil?: Perfil }) {
  if (perfil === "ficha") {
    return (
      <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
        <PublicidadCreatividad formato="vertical-alto" />
        <EspacioPublicitario formato="skyscraper" />
      </aside>
    );
  }

  if (perfil === "farmacia") {
    return (
      <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
        <EspacioPublicitario formato="vertical-alto" descripcion="Ideal para farmacias del corredor." />
      </aside>
    );
  }

  return (
    <aside className="grid w-full gap-1" aria-label="Espacios publicitarios">
      <EspacioPublicitario formato="skyscraper" descripcion="Columna lateral en listados de búsqueda." />
    </aside>
  );
}