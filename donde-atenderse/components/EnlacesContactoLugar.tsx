import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { MENSAJE_WHATSAPP } from "@/lib/constants";
import { enlaceTelefono, enlaceWhatsApp } from "@/lib/format";

/** WhatsApp y teléfono con botones compactos, proporcionales al texto de la ficha. */
export function EnlacesContactoLugar({
  whatsapp,
  telefono,
  ejemplo = false,
  etiquetaWhatsapp = "WhatsApp",
  etiquetaTelefono = "Teléfono fijo",
}: {
  whatsapp?: string;
  telefono?: string;
  ejemplo?: boolean;
  etiquetaWhatsapp?: string;
  etiquetaTelefono?: string;
}) {
  if (!whatsapp?.trim() && !telefono?.trim()) return null;

  const boton =
    "inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-dark";
  const botonSuave =
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:border-menta";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {whatsapp?.trim() ? (
        ejemplo ? (
          <span className={`${boton} cursor-default opacity-80`}>{etiquetaWhatsapp}</span>
        ) : (
          <a className={boton} href={enlaceWhatsApp(whatsapp, MENSAJE_WHATSAPP)} target="_blank" rel="noopener noreferrer">
            <IconoCercalud nombre="mensaje" size={15} className="text-white/95" />
            {etiquetaWhatsapp}
          </a>
        )
      ) : null}
      {telefono?.trim() ? (
        ejemplo ? (
          <span className={`${botonSuave} cursor-default opacity-80`}>{etiquetaTelefono}</span>
        ) : (
          <a className={botonSuave} href={enlaceTelefono(telefono)}>
            <IconoCercalud nombre="telefono" size={15} className="text-link" />
            {etiquetaTelefono}
          </a>
        )
      ) : null}
    </div>
  );
}