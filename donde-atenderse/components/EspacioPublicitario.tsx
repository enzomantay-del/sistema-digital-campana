import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";
import { mensajePublicidadCercalud, enlaceWhatsAppCercalud, numeroWhatsAppCercalud } from "@/lib/contactoCercalud";
import {
  claseMarcoHueco,
  MEDIDA_PUBLICIDAD,
  type DestinoHuecoPublicidad,
  type VariantePublicidad,
} from "@/lib/formatosPublicidad";

type Props = {
  formato: Exclude<VariantePublicidad, "contenido">;
  /** Texto breve bajo “Espacio comercial disponible”. */
  descripcion?: string;
  anchoFila?: boolean;
  /** Columna de fichas: el hueco ocupa alto visible (skyscraper / vertical). */
  rellenoVertical?: boolean;
  /** columna = lateral; franja = banda horizontal; principal = bloque grande en el contenido. */
  destino?: DestinoHuecoPublicidad;
};

const FORMATO_ANCHO_FILA = new Set<Exclude<VariantePublicidad, "contenido">>(["banner", "leaderboard"]);

function resolverDestino(
  destino: DestinoHuecoPublicidad | undefined,
  anchoFila: boolean,
  rellenoVertical: boolean,
): DestinoHuecoPublicidad {
  if (destino) return destino;
  if (rellenoVertical) return "columna";
  if (anchoFila) return "franja";
  return "principal";
}

/** Hueco a la venta: silueta del formato + contacto. */
export function EspacioPublicitario({
  formato,
  descripcion,
  anchoFila = false,
  rellenoVertical = false,
  destino,
}: Props) {
  const medida = MEDIDA_PUBLICIDAD[formato];
  const destinoEfectivo = resolverDestino(destino, anchoFila, rellenoVertical);
  const marco = claseMarcoHueco(formato, { destino: destinoEfectivo, rellenoVertical });
  const telefono = numeroWhatsAppCercalud();
  const fila = destinoEfectivo === "franja" || anchoFila || FORMATO_ANCHO_FILA.has(formato);
  const principal = destinoEfectivo === "principal";
  const compacto = destinoEfectivo === "columna" && !principal;

  return (
    <TarjetaPublicidad
      variante={formato}
      compacto={compacto}
      anchoFila={fila || rellenoVertical}
      destino={destinoEfectivo}
    >
      <div
        className={`hueco-comercial hueco-comercial--${destinoEfectivo} flex flex-col items-center justify-center border-2 border-dashed border-link/30 bg-gradient-to-br from-[#eef6ff] via-white to-[#e8f7f3] p-4 text-center sm:p-6 ${marco} ${
          fila ? "sm:flex-row sm:justify-center sm:gap-6 sm:text-left" : ""
        }`}
      >
        <div
          className={`flex flex-col items-center gap-2 ${fila ? "max-w-full sm:flex-row sm:items-center sm:gap-5" : principal ? "max-w-lg" : "max-w-[17rem]"}`}
        >
          <div
            className={`flex shrink-0 items-center justify-center rounded-2xl border border-line bg-white text-link shadow-sm ${
              principal ? "h-16 w-16" : "h-11 w-11"
            }`}
          >
            <IconoCercalud nombre="ficha" size={principal ? 32 : 24} />
          </div>
          <div className="grid gap-1">
            <p className={principal ? "text-lg font-bold text-ink" : "text-sm font-bold text-ink"}>
              Espacio comercial disponible
            </p>
            <p className={principal ? "text-sm leading-snug text-muted" : "text-xs leading-snug text-muted"}>
              {descripcion ??
                `${medida.nombre} · ${medida.ancho}×${medida.alto} px. Ideal para marcas, farmacias y profesionales de la zona.`}
            </p>
            <a
              href={enlaceWhatsAppCercalud(mensajePublicidadCercalud(medida.nombre))}
              className={`mt-1 inline-flex font-semibold text-link hover:underline ${principal ? "text-sm" : "text-xs"}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {telefono} · Consultar este espacio
            </a>
          </div>
        </div>
      </div>
    </TarjetaPublicidad>
  );
}