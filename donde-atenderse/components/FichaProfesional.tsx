import Image from "next/image";
import Link from "next/link";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import { ListaHorarioTexto } from "@/components/ListaHorarioTexto";
import { ListaObrasCompacta } from "@/components/ListaObrasCompacta";
import { MENSAJE_WHATSAPP } from "@/lib/constants";
import { enlaceTelefono, enlaceWhatsApp } from "@/lib/format";
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
  const cantidadSedes = vista.bloques.reduce((n, bloque) => n + bloque.lineas.length, 0);
  const fichaDensa = cantidadSedes >= 3;

  return (
    <article className={`tarjeta grid ${fichaDensa ? "gap-5" : "gap-8"}`}>
      <header className="grid gap-2">
        <div className="flex flex-wrap items-start gap-4">
          {vista.fotoUrl ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-line bg-white shadow-sm">
              <Image
                src={vista.fotoUrl}
                alt={`Foto de ${vista.nombre}`}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
            </div>
          ) : null}
          <div className="grid min-w-0 flex-1 gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-menta">
              {vista.especialidad} · {vista.area}
            </p>
            <div className="flex items-start justify-between gap-3">
              <h1 className="min-w-0 text-4xl font-bold tracking-tight">{vista.nombre}</h1>
              <InsigniaVerificacion activa={vista.datosVerificados} />
            </div>
            {vista.matricula ? <p>Matrícula {vista.matricula}</p> : null}
          </div>
        </div>
        {ejemplo ? <p className="text-base text-warn">Dato de ejemplo.</p> : null}
      </header>

      {vista.bloques.length === 0 ? (
        <p>Todavía no cargó dónde atiende.</p>
      ) : (
        <div className={fichaDensa ? "grid gap-3" : "grid gap-6"}>
          <h2 className={fichaDensa ? "text-xl font-semibold" : "text-2xl font-semibold"}>Dónde atiende</h2>
          {vista.bloques.map((bloque) => (
            <section key={bloque.shift} className={fichaDensa ? "grid gap-2" : "grid gap-4"}>
              {vista.bloques.length > 1 ? (
                <h3 className={fichaDensa ? "text-base font-semibold text-muted" : "text-xl font-semibold"}>
                  {bloque.titulo}
                </h3>
              ) : null}
              {bloque.shift === "guardia" ? (
                <p className={fichaDensa ? "text-xs text-muted" : "text-base text-muted"}>
                  Es una guardia, no un horario de consultorio.
                </p>
              ) : null}
              <div
                className={
                  fichaDensa
                    ? "divide-y divide-line overflow-hidden rounded-2xl border border-line"
                    : "grid gap-0"
                }
              >
                {bloque.lineas.map((linea) => (
                  <div
                    key={linea.id}
                    className={fichaDensa ? "grid gap-1.5 px-3 py-2.5" : "grid gap-2 border-t border-line pt-4"}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0">
                      {enlazar ? (
                        <Link
                          href={`/lugar/${linea.placeId}`}
                          className={fichaDensa ? "text-base font-semibold text-link" : "text-xl font-semibold text-link"}
                        >
                          {linea.placeName}
                        </Link>
                      ) : (
                        <p className={fichaDensa ? "text-base font-semibold" : "text-xl font-semibold"}>
                          {linea.placeName}
                        </p>
                      )}
                      <span className="text-xs text-muted">{linea.locality}</span>
                    </div>
                    {linea.horarioLineas.length > 0 || linea.detalle ? (
                      <ListaHorarioTexto
                        lineas={linea.horarioLineas.length > 0 ? linea.horarioLineas : [linea.detalle]}
                        denso={fichaDensa}
                      />
                    ) : null}
                    {linea.obras.length > 0 ? (
                      <ListaObrasCompacta obras={linea.obras} etiqueta="Obras sociales en este lugar" />
                    ) : null}
                    {linea.placeWhatsapp || linea.placePhone ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {linea.placeWhatsapp && !ejemplo ? (
                          <a
                            className="enlace-icono text-xs font-semibold text-link hover:underline"
                            href={enlaceWhatsApp(linea.placeWhatsapp, MENSAJE_WHATSAPP)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IconoCercalud nombre="mensaje" size={14} className="text-menta" />
                            WhatsApp lugar
                          </a>
                        ) : null}
                        {linea.placePhone && !ejemplo ? (
                          <a
                            className="enlace-icono text-xs font-semibold text-link hover:underline"
                            href={enlaceTelefono(linea.placePhone)}
                          >
                            <IconoCercalud nombre="telefono" size={14} className="text-menta" />
                            Tel. lugar
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                    {!fichaDensa ? (
                      <p className="mt-1 text-xs text-muted">{linea.actualizacion}</p>
                    ) : null}
                    {linea.conflictoTexto ? (
                      <p className={fichaDensa ? "text-xs text-warn" : "mt-1 text-base text-warn"}>
                        {linea.conflictoTexto}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
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
          <h2 className="text-xl font-semibold">Agenda del profesional</h2>
          <p className="text-sm text-muted">Contacto de secretaría del médico (válido para todas sus sedes).</p>
          <div className="flex flex-wrap gap-3">
            {vista.agendaWhatsapp ? (
              ejemplo ? (
                <span className="boton w-fit cursor-default opacity-80">WhatsApp agenda</span>
              ) : (
                <a
                  className="boton w-fit gap-2"
                  href={enlaceWhatsApp(vista.agendaWhatsapp, MENSAJE_WHATSAPP)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconoCercalud nombre="mensaje" size={18} className="text-white/95" />
                  WhatsApp agenda
                </a>
              )
            ) : null}
            {vista.agendaTelefono ? (
              ejemplo ? (
                <span className="boton-suave w-fit cursor-default opacity-80">Teléfono agenda</span>
              ) : (
                <a className="boton-suave w-fit gap-2" href={enlaceTelefono(vista.agendaTelefono)}>
                  <IconoCercalud nombre="telefono" size={18} className="text-link" />
                  Teléfono agenda
                </a>
              )
            ) : null}
          </div>
        </section>
      ) : null}
      <p className="text-xs text-muted">{vista.actualizacion}</p>
    </article>
  );
}