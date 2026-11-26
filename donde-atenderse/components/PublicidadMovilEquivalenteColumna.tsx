import { EspacioPublicitario } from "@/components/EspacioPublicitario";

type Perfil = "listado" | "farmacia" | "editorial";

const TEXTO: Record<Perfil, string> = {
  listado:
    "Mismo espacio comercial que la columna en PC: formato móvil en el flujo de búsqueda (rectángulo medio 300×250).",
  farmacia:
    "Equivalente a la columna en PC: espacio visible en celular dentro de farmacia de turno (300×250).",
  editorial:
    "Equivalente a la columna en PC: espacio en esta página en celular y tablet (300×250).",
};

/**
 * Hueco comercial en el flujo cuando la columna lateral solo se muestra en pantallas anchas.
 */
export function PublicidadMovilEquivalenteColumna({
  perfil,
  anchoPantalla = "xl",
}: {
  perfil: Perfil;
  /** `xl` = listados/farmacia; `lg` = páginas con columna desde lg. */
  anchoPantalla?: "xl" | "lg";
}) {
  const ocultarEnDesktop = anchoPantalla === "xl" ? "xl:hidden" : "lg:hidden";
  return (
    <div className={ocultarEnDesktop} aria-label="Publicidad">
      <EspacioPublicitario formato="mpu" destino="principal" descripcion={TEXTO[perfil]} />
    </div>
  );
}