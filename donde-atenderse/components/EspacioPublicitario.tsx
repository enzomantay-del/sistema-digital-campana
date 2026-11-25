import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";
import { contactoEmail } from "@/lib/config";
import {
  claseAspectoVariante,
  MEDIDA_PUBLICIDAD,
  type VariantePublicidad,
} from "@/lib/formatosPublicidad";

type Props = {
  formato: Exclude<VariantePublicidad, "contenido">;
  /** Texto breve bajo “Espacio comercial”. */
  descripcion?: string;
};

/** Hueco a la venta: silueta del formato + contacto. */
export function EspacioPublicitario({ formato, descripcion }: Props) {
  const medida = MEDIDA_PUBLICIDAD[formato];
  const aspecto = claseAspectoVariante(formato);
  const mail = contactoEmail();

  return (
    <TarjetaPublicidad variante={formato} compacto>
      <div
        className={`flex flex-col items-center justify-center border border-dashed border-line/80 bg-white p-1 text-center ${aspecto ?? ""}`}
      >
        <div className="flex max-w-[16rem] flex-col items-center gap-0.5 px-1 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-paper text-link">
            <IconoCercalud nombre="ficha" size={22} />
          </div>
          <p className="text-xs font-bold text-ink">Espacio comercial</p>
          <p className="text-[10px] leading-snug text-muted">
            {descripcion ??
              `${medida.nombre} · ${medida.ancho}×${medida.alto} px. Farmacias y profesionales de la zona.`}
          </p>
          <a
            href={`mailto:${mail}?subject=Publicidad%20${encodeURIComponent(medida.nombre)}%20en%20Cercalud`}
            className="mt-0.5 text-[11px] font-semibold text-link hover:underline"
          >
            {mail}
          </a>
        </div>
      </div>
    </TarjetaPublicidad>
  );
}