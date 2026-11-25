import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { ROTACION_LISTADO, type VariantePublicidad } from "@/lib/formatosPublicidad";

/** Aviso en el flujo del listado de búsqueda (formato alternado). */
export function PublicidadEntreListado({ indice }: { indice: number }) {
  const formato = ROTACION_LISTADO[indice % ROTACION_LISTADO.length] as Exclude<
    VariantePublicidad,
    "contenido"
  >;
  return (
    <div className="py-0.5">
      <EspacioPublicitario formato={formato} descripcion="Visible entre resultados de búsqueda." />
    </div>
  );
}