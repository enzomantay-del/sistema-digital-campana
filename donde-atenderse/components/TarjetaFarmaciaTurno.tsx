import { BloqueVigenciaTurno } from "@/components/BloqueVigenciaTurno";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { LogoLugarListado } from "@/components/MediaListado";
import { MENSAJE_WHATSAPP } from "@/lib/constants";
import { enlaceMaps, enlaceTelefono, enlaceWhatsApp } from "@/lib/format";

type TurnoVigente = {
  startsOn: Date;
  endsOn: Date;
  source: string | null;
};

export function TarjetaFarmaciaTurno({
  nombre,
  localidad,
  direccion,
  logoUrl,
  whatsapp,
  telefono,
  ejemplo,
  turno,
}: {
  nombre: string;
  localidad: string;
  direccion: string;
  logoUrl: string;
  whatsapp: string;
  telefono: string;
  ejemplo: boolean;
  turno: TurnoVigente;
}) {
  const contacto = whatsapp.trim() || telefono.trim();

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start gap-4">
        <LogoLugarListado nombre={nombre} logoUrl={logoUrl} tamano="lista" />
        <div className="grid min-w-0 flex-1 gap-1">
          <p className="text-xl font-semibold text-ink">{nombre}</p>
          {direccion ? (
            ejemplo ? (
              <p className="text-base text-muted">{direccion}</p>
            ) : (
              <a
                href={enlaceMaps(direccion, localidad, nombre)}
                target="_blank"
                rel="noopener noreferrer"
                className="enlace-icono w-fit text-base font-medium text-link underline-offset-2 hover:underline"
              >
                <IconoCercalud nombre="ubicacion" size={18} className="text-menta" />
                {direccion}
              </a>
            )
          ) : null}
        </div>
      </div>

      <BloqueVigenciaTurno desde={turno.startsOn} hasta={turno.endsOn} />

      {contacto ? (
        <div className="flex flex-wrap gap-3">
          {whatsapp.trim() ? (
            ejemplo ? (
              <span className="boton w-fit cursor-default opacity-80">WhatsApp</span>
            ) : (
              <a
                className="boton w-fit gap-2"
                href={enlaceWhatsApp(whatsapp, MENSAJE_WHATSAPP)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconoCercalud nombre="mensaje" size={18} className="text-white/95" />
                WhatsApp
              </a>
            )
          ) : null}
          {telefono.trim() ? (
            ejemplo ? (
              <span className="boton-suave w-fit cursor-default opacity-80">Teléfono</span>
            ) : (
              <a className="boton-suave w-fit gap-2" href={enlaceTelefono(telefono)}>
                <IconoCercalud nombre="telefono" size={18} className="text-link" />
                Teléfono
              </a>
            )
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted">Todavía no cargamos teléfono o WhatsApp de esta farmacia.</p>
      )}

      {turno.source ? <p className="text-sm text-muted">{turno.source}</p> : null}
      {ejemplo ? <p className="text-base text-warn">Dato de ejemplo.</p> : null}
    </div>
  );
}