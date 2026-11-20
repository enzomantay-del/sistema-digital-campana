import Image from "next/image";
import Link from "next/link";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
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
  return (
    <article className="tarjeta grid gap-8">
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
            <h1 className="text-4xl font-bold tracking-tight">{vista.nombre}</h1>
            {vista.matricula ? <p>Matrícula {vista.matricula}</p> : null}
            <InsigniaVerificacion activa={vista.datosVerificados} />
          </div>
        </div>
        {ejemplo ? <p className="text-base text-warn">Dato de ejemplo.</p> : null}
      </header>

      {vista.bloques.length === 0 ? (
        <p>Todavía no cargó dónde atiende.</p>
      ) : (
        <div className="grid gap-6">
          <h2 className="text-2xl font-semibold">Dónde atiende</h2>
          {vista.bloques.map((bloque) => (
            <section key={bloque.shift} className="grid gap-4">
              {vista.bloques.length > 1 ? <h3 className="text-xl font-semibold">{bloque.titulo}</h3> : null}
              {bloque.shift === "guardia" ? (
                <p className="text-base text-muted">Es una guardia, no un horario de consultorio.</p>
              ) : null}
              {bloque.lineas.map((linea) => (
                <div key={linea.id} className="border-t border-line pt-4">
                  {enlazar ? (
                    <Link href={`/lugar/${linea.placeId}`} className="text-xl font-semibold text-link">
                      {linea.rotulo}
                    </Link>
                  ) : (
                    <p className="text-xl font-semibold">{linea.rotulo}</p>
                  )}
                  <p className="text-muted">{linea.locality}</p>
                  {linea.horarioLineas.length > 0 ? (
                    <div className="mt-1 grid gap-0.5">
                      {linea.horarioLineas.map((texto) => (
                        <p key={texto}>{texto}</p>
                      ))}
                    </div>
                  ) : linea.detalle ? (
                    <p className="mt-1">{linea.detalle}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted">{linea.actualizacion}</p>
                  {linea.conflictoTexto ? <p className="mt-1 text-base text-warn">{linea.conflictoTexto}</p> : null}
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      {vista.obras.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-xl font-semibold">Obra social</h2>
          <div className="flex flex-wrap gap-2">
            {vista.obras.map((obra) => (
              <span key={obra} className="pastilla pastilla-activa">
                {obra}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {vista.precio ? (
        <p>
          Precio de la consulta: {vista.precio}.
          {vista.precioFecha ? ` Lo escribió el ${vista.precioFecha}.` : ""}
        </p>
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
                  className="boton w-fit"
                  href={enlaceWhatsApp(vista.whatsapp, MENSAJE_WHATSAPP)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              )
            ) : null}
            {vista.telefono ? (
              ejemplo ? (
                <span className="boton-suave w-fit cursor-default opacity-80">Teléfono fijo</span>
              ) : (
                <a className="boton-suave w-fit" href={enlaceTelefono(vista.telefono)}>
                  Teléfono fijo
                </a>
              )
            ) : null}
          </div>
        </section>
      ) : (
        <p className="text-muted">Todavía no hay datos de contacto cargados.</p>
      )}
      {ejemplo && vista.whatsapp ? (
        <p className="text-base text-muted">En una ficha real, estos botones abren el chat o el teléfono.</p>
      ) : null}

      <p className="text-xs text-muted">{vista.actualizacion}</p>
    </article>
  );
}