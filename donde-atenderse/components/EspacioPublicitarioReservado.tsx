import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";
import { contactoEmail } from "@/lib/config";

export function EspacioPublicitarioReservado() {
  return (
    <aside className="grid w-full gap-3" aria-label="Espacios publicitarios">
      <TarjetaPublicidad variante="skyscraper">
        <div className="border border-dashed border-line bg-white px-4 py-6 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-paper text-link">
          <IconoCercalud nombre="ficha" size={26} />
        </div>
        <p className="text-sm font-bold text-ink">Espacio comercial</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Publicidad para farmacias y profesionales de la zona. Consultanos para reservar este espacio.
        </p>
        <a href={`mailto:${contactoEmail()}?subject=Publicidad%20en%20Cercalud`} className="mt-3 inline-block text-sm font-semibold text-link hover:underline">
          {contactoEmail()}
        </a>
        </div>
      </TarjetaPublicidad>
    </aside>
  );
}