import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";
import { mensajePublicidadCercalud, enlaceWhatsAppCercalud, numeroWhatsAppCercalud } from "@/lib/contactoCercalud";
import {
  claseAspectoVariante,
  MEDIDA_PUBLICIDAD,
  type VariantePublicidad,
} from "@/lib/formatosPublicidad";

type Props = {
  formato: Exclude<VariantePublicidad, "contenido">;
  /** Texto breve bajo “Espacio comercial disponible”. */
  descripcion?: string;
  anchoFila?: boolean;
  /** Columna de fichas: el hueco ocupa alto visible (skyscraper / vertical). */
  rellenoVertical?: boolean;
};

const FORMATO_ANCHO_FILA = new Set<Exclude<VariantePublicidad, "contenido">>(["banner", "leaderboard"]);

/** Hueco a la venta: silueta del formato + contacto. */
export function EspacioPublicitario({
  formato,
  descripcion,
  anchoFila = false,
  rellenoVertical = false,
}: Props) {
  const medida = MEDIDA_PUBLICIDAD[formato];
  const aspecto = rellenoVertical ? "h-full w-full min-h-[220px]" : (claseAspectoVariante(formato) ?? "");
  const telefono = numeroWhatsAppCercalud();
  const fila = anchoFila || FORMATO_ANCHO_FILA.has(formato);

  return (
    <TarjetaPublicidad variante={formato} compacto anchoFila={fila || rellenoVertical}>
      <div
        className={`flex h-full min-h-[inherit] flex-col items-center justify-center border border-dashed border-line/80 bg-white p-3 text-center ${aspecto} ${
          fila ? "px-3 sm:flex-row sm:justify-center sm:gap-4 sm:py-2" : ""
        }`}
      >
        <div
          className={`flex flex-col items-center gap-0.5 px-1 py-1 ${fila ? "max-w-full sm:flex-row sm:items-center sm:gap-3 sm:text-left" : "max-w-[16rem]"}`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-paper text-link">
            <IconoCercalud nombre="ficha" size={22} />
          </div>
          <p className="text-xs font-bold text-ink">Espacio comercial disponible</p>
          <p className="text-[10px] leading-snug text-muted">
            {descripcion ??
              `${medida.nombre} · ${medida.ancho}×${medida.alto} px. Farmacias y profesionales de la zona.`}
          </p>
          <a
            href={enlaceWhatsAppCercalud(mensajePublicidadCercalud(medida.nombre))}
            className="mt-0.5 text-[11px] font-semibold text-link hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp {telefono}
          </a>
        </div>
      </div>
    </TarjetaPublicidad>
  );
}