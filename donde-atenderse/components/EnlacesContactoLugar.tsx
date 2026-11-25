import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { MENSAJE_WHATSAPP } from "@/lib/constants";
import { enlaceTelefono, enlaceWhatsApp } from "@/lib/format";

/** WhatsApp y teléfono del centro, igual criterio que la ficha del lugar. */
export function EnlacesContactoLugar({
  whatsapp,
  telefono,
  ejemplo = false,
  anchoCompletoMovil = true,
}: {
  whatsapp?: string;
  telefono?: string;
  ejemplo?: boolean;
  /** En fichas con varias sedes, los botones ocupan todo el ancho en celular. */
  anchoCompletoMovil?: boolean;
}) {
  if (!whatsapp?.trim() && !telefono?.trim()) return null;

  const ancho = anchoCompletoMovil ? "w-full sm:w-fit" : "w-fit";

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
      {whatsapp?.trim() ? (
        ejemplo ? (
          <span className={`boton ${ancho} cursor-default justify-center gap-2 opacity-80`}>WhatsApp</span>
        ) : (
          <a
            className={`boton ${ancho} gap-2`}
            href={enlaceWhatsApp(whatsapp, MENSAJE_WHATSAPP)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconoCercalud nombre="mensaje" size={18} className="text-white/95" />
            WhatsApp
          </a>
        )
      ) : null}
      {telefono?.trim() ? (
        ejemplo ? (
          <span className={`boton-suave ${ancho} cursor-default justify-center gap-2 opacity-80`}>Teléfono fijo</span>
        ) : (
          <a className={`boton-suave ${ancho} gap-2`} href={enlaceTelefono(telefono)}>
            <IconoCercalud nombre="telefono" size={18} className="text-link" />
            Teléfono fijo
          </a>
        )
      ) : null}
    </div>
  );
}