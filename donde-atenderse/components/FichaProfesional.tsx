import Image from "next/image";
import { IconoCercalud, iconoArea } from "@/components/iconos/IconoCercalud";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import { EnlacesContactoLugar } from "@/components/EnlacesContactoLugar";
import { SedesProfesionalFicha } from "@/components/SedesProfesionalFicha";
import type { VistaProfesional } from "@/lib/view";

export function FichaProfesional({
  vista,
  ejemplo = false,
  enlazar = true,
}: {
  vista: VistaProfesional;
  ejemplo?: boolean;
  enlazar?: boolean;
}) {
  const cantidadSedes = vista.sedes.length;
  const fichaDensa = cantidadSedes >= 3;

  return (
    <article className={`tarjeta grid ${fichaDensa ? "gap-5" : "gap-8"}`}>
      <header className="grid gap-2">
        <div className="flex flex-wrap items-start gap-4">
          {vista.fotoUrl ? (
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-line bg-white shadow-sm sm:h-32 sm:w-32">
              <Image
                src={vista.fotoUrl}
                alt={`Foto de ${vista.nombre}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 112px, 128px"
                unoptimized
              />
            </div>
          ) : null}
          <div className="grid min-w-0 flex-1 gap-2">
            <p className="enlace-icono text-sm font-semibold uppercase tracking-[0.08em] text-menta">
              <IconoCercalud nombre={iconoArea(vista.areaCodigo)} size={16} className="shrink-0 text-menta" />
              <span>
                {vista.especialidad} · {vista.area}
              </span>
            </p>
            <div className="flex items-start justify-between gap-3">
              <h1 className="min-w-0 text-4xl font-bold tracking-tight">{vista.nombre}</h1>
              <InsigniaVerificacion activa={vista.datosVerificados} />
            </div>
            {vista.matricula ? (
              <p className="enlace-icono text-sm text-muted">
                <IconoCercalud nombre="sello" size={15} className="shrink-0 text-menta" />
                Matrícula {vista.matricula}
              </p>
            ) : null}
          </div>
        </div>
        {ejemplo ? <p className="text-base text-warn">Dato de ejemplo.</p> : null}
      </header>

      {vista.sedes.length === 0 ? (
        <p>Todavía no cargó dónde atiende.</p>
      ) : (
        <SedesProfesionalFicha sedes={vista.sedes} fichaDensa={fichaDensa} ejemplo={ejemplo} enlazar={enlazar} />
      )}

      {vista.precio ? (
        <p className="text-base text-ink">
          Precio de la consulta: <span className="font-semibold">{vista.precio}</span>
          {vista.precioFecha ? (
            <span className="ml-1 text-xs font-normal text-muted">
              {" "}
              · Precio actualizado el {vista.precioFecha}
            </span>
          ) : null}
        </p>
      ) : null}

      {vista.agendaWhatsapp || vista.agendaTelefono ? (
        <section className="grid gap-3">
          <h2 className="enlace-icono text-xl font-semibold">
            <IconoCercalud nombre="contacto-directo" size={22} className="shrink-0 text-menta" />
            Agenda del profesional
          </h2>
          <p className="text-sm text-muted">Contacto de secretaría del médico (válido para todas sus sedes).</p>
          <EnlacesContactoLugar
            whatsapp={vista.agendaWhatsapp}
            telefono={vista.agendaTelefono}
            ejemplo={ejemplo}
            etiquetaWhatsapp="WhatsApp agenda"
            etiquetaTelefono="Teléfono agenda"
          />
        </section>
      ) : null}
      <p className="text-xs text-muted">{vista.actualizacion}</p>
    </article>
  );
}