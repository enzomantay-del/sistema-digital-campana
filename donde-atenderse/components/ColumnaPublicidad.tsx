import { EspacioPublicitario } from "@/components/EspacioPublicitario";

type Perfil = "ficha" | "listado" | "farmacia";

const DESCRIPCION: Record<Perfil, string> = {
  ficha: "Skyscraper junto a la ficha: formato 300×600 para tu marca o servicio.",
  listado: "Columna en listados: alto visible para tu marca o servicio (solo en pantallas anchas).",
  farmacia: "Columna en farmacia de turno: espacio vertical premium (solo en pantallas anchas).",
};

/** Un solo hueco skyscraper por columna (máx. 2 avisos por página en conjunto con el resto). */
export function ColumnaPublicidad({ perfil = "ficha" }: { perfil?: Perfil }) {
  return (
    <aside className="w-full lg:sticky lg:top-24" aria-label="Espacio publicitario">
      <EspacioPublicitario
        formato="skyscraper"
        destino="columna"
        rellenoVertical
        descripcion={DESCRIPCION[perfil]}
      />
    </aside>
  );
}