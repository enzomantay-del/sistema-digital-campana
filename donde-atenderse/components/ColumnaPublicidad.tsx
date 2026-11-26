import { EspacioPublicitario } from "@/components/EspacioPublicitario";
type Perfil = "ficha" | "listado" | "farmacia";

export function ColumnaPublicidad({ perfil = "ficha" }: { perfil?: Perfil }) {
  if (perfil === "ficha") {
    return (
      <aside className="grid w-full gap-3 lg:min-h-[min(100vh-7rem,920px)] lg:grid-rows-2" aria-label="Espacios publicitarios">
        <EspacioPublicitario
          formato="skyscraper"
          destino="columna"
          rellenoVertical
          descripcion="Skyscraper junto a fichas: marca visible en todo el alto de la columna."
        />
        <EspacioPublicitario
          formato="vertical-alto"
          destino="columna"
          rellenoVertical
          descripcion="Segundo bloque vertical en la misma columna."
        />
      </aside>
    );
  }

  const columnaListado = (
    <aside
      className="grid w-full gap-3 lg:min-h-[min(100vh-7rem,920px)] lg:grid-rows-2"
      aria-label="Espacios publicitarios"
    >
      <EspacioPublicitario
        formato="skyscraper"
        destino="columna"
        rellenoVertical
        descripcion="Columna en listados: alto visible para tu marca o servicio."
      />
      <EspacioPublicitario
        formato="vertical-alto"
        destino="columna"
        rellenoVertical
        descripcion="Segundo espacio vertical en búsqueda y farmacia."
      />
    </aside>
  );

  if (perfil === "farmacia") return columnaListado;
  return columnaListado;
}