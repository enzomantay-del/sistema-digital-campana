import { PublicidadCreatividad } from "@/components/PublicidadCreatividad";

type Perfil = "ficha" | "listado" | "farmacia";

export function ColumnaPublicidad({ perfil = "ficha" }: { perfil?: Perfil }) {
  if (perfil === "ficha") {
    return (
      <aside className="grid w-full max-w-[300px] gap-2" aria-label="Espacios publicitarios">
        <PublicidadCreatividad formato="vertical-alto" />
        <PublicidadCreatividad formato="skyscraper" />
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