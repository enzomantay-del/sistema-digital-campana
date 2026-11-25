import Image from "next/image";
import Link from "next/link";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { HorarioLugarPublico } from "@/components/HorarioLugarPublico";
import { ListaHorarioTexto } from "@/components/ListaHorarioTexto";
import { ListaObrasCompacta } from "@/components/ListaObrasCompacta";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import { MENSAJE_WHATSAPP } from "@/lib/constants";
import { enlaceMaps, enlaceTelefono, enlaceWhatsApp, etiquetaLugar } from "@/lib/format";
import type { VistaLugar } from "@/lib/view";

export function FichaLugar({
  vista,
  ejemplo = false,
  enlazar = true,
  mostrarProfesionalesEnFicha = false,
}: {
  vista: VistaLugar;
  ejemplo?: boolean;
  enlazar?: boolean;
  /** En el panel se puede previsualizar el listado; en la ficha pública va solo el resumen. */
  mostrarProfesionalesEnFicha?: boolean;
}) {
  return (
    <article className="tarjeta grid gap-8">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-start gap-4">
          {vista.logoUrl ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <Image
                src={vista.logoUrl}
                alt={`Logo de ${vista.nombre}`}
                fill
                className="object-contain p-1.5"
                sizes="80px"
                unoptimized
              />
            </div>
          ) : null}
          <div className="grid min-w-0 flex-1 gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-menta">
              {etiquetaLugar(vista.kind)} · {vista.localidad}
            </p>
            <div className="flex items-start justify-between gap-3">
              <h1 className="min-w-0 text-4xl font-bold tracking-tight">{vista.nombre}</h1>
              <InsigniaVerificacion activa={vista.datosVerificados} />
            </div>
          </div>
        </div>
        {vista.direccion ? (
          ejemplo ? (
            <p>{vista.direccion}</p>
          ) : (
            <a
              href={enlaceMaps(vista.direccion, vista.localidad, vista.nombre)}
              target="_blank"
              rel="noopener noreferrer"
              className="enlace-icono w-fit font-medium text-link underline-offset-2 hover:underline"
            >
              <IconoCercalud nombre="ubicacion" size={18} className="text-menta" />
              {vista.direccion}
            </a>
          )
        ) : null}
        {ejemplo ? <p className="text-base text-warn">Dato de ejemplo.</p> : null}
      </header>

      <HorarioLugarPublico
        scheduleNote={vista.scheduleNote}
        lineasFallback={vista.horarioLineas}
        textoFallback={vista.horarioLugar}
      />

      {vista.cantidadProfesionales > 0 ? (
        <section className="grid gap-4">
          <h2 className="text-2xl font-semibold">Quién atiende</h2>
          <p className="text-muted">Consultá el listado completo de profesionales y especialidades en este lugar.</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/lugar/${vista.placeId}/profesionales`} className="boton-suave gap-2">
              <IconoCercalud nombre="profesional" size={18} className="text-link" />
              Ver profesionales ({vista.cantidadProfesionales})
            </Link>
            {vista.especialidades.length > 0 ? (
              <Link href={`/lugar/${vista.placeId}/especialidades`} className="boton-suave gap-2">
                <IconoCercalud nombre="areas" size={18} className="text-link" />
                Ver especialidades ({vista.especialidades.length})
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {mostrarProfesionalesEnFicha && vista.bloques.length > 0 ? (
        <div className="grid gap-6 border-t border-line pt-6">
          <p className="text-sm font-semibold text-muted">Vista previa del detalle por profesional</p>
          {vista.bloques.map((bloque) => (
            <section key={bloque.shift} className="grid gap-4">
              <h3 className="text-xl font-semibold">{bloque.titulo}</h3>
              {bloque.lineas.map((linea) => (
                <div key={linea.id} className="border-t border-line pt-4">
                  {enlazar && linea.personaId ? (
                    <Link href={`/profesional/${linea.personaId}`} className="text-xl font-semibold text-link">
                      {linea.rotulo}
                    </Link>
                  ) : (
                    <p className="text-xl font-semibold">{linea.rotulo}</p>
                  )}
                  {linea.horarioLineas.length > 0 || linea.detalle ? (
                    <div className="mt-1">
                      <ListaHorarioTexto
                        lineas={linea.horarioLineas.length > 0 ? linea.horarioLineas : [linea.detalle]}
                      />
                    </div>
                  ) : null}
                  <p className="mt-2 text-xs text-muted">{linea.actualizacion}</p>
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : null}

      {vista.servicios.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-2xl font-semibold">Servicios</h2>
          <ul className="flex flex-wrap gap-2">
            {vista.servicios.map((servicio) => (
              <li key={servicio} className="pastilla pastilla-compacta pastilla-activa">
                {servicio}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {vista.estudios.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-2xl font-semibold">Estudios</h2>
          {vista.estudios.map((estudio) => (
            <div key={estudio.nombre} className="border-t border-line pt-3">
              <p className="font-semibold">{estudio.nombre}</p>
              {estudio.atencion ? <p>{estudio.atencion}</p> : null}
              {estudio.preparacion ? <p className="text-muted">{estudio.preparacion}</p> : null}
            </div>
          ))}
        </section>
      ) : null}

      {vista.obrasNota ? <p className="text-sm text-muted">{vista.obrasNota}</p> : null}
      {vista.mostrarObrasLista && vista.obras.length > 0 ? (
        <ListaObrasCompacta obras={vista.obras} etiqueta="Obras sociales" />
      ) : null}

      {vista.whatsapp || vista.telefono ? (
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold">Contacto</h2>
          <div className="flex flex-wrap gap-3">
            {vista.whatsapp ? (
              ejemplo ? (
                <span className="boton w-fit cursor-default opacity-80">WhatsApp</span>
              ) : (
                <a
                  className="boton w-fit gap-2"
                  href={enlaceWhatsApp(vista.whatsapp, MENSAJE_WHATSAPP)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconoCercalud nombre="mensaje" size={18} className="text-white/95" />
                  WhatsApp
                </a>
              )
            ) : null}
            {vista.telefono ? (
              ejemplo ? (
                <span className="boton-suave w-fit cursor-default opacity-80">Teléfono fijo</span>
              ) : (
                <a className="boton-suave w-fit gap-2" href={enlaceTelefono(vista.telefono)}>
                  <IconoCercalud nombre="telefono" size={18} className="text-link" />
                  Teléfono fijo
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