import Link from "next/link";
import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { contactoEmail, contactoWhatsApp } from "@/lib/config";
import { enlaceWhatsApp } from "@/lib/format";

export default function PaginaContacto() {
  const mail = contactoEmail();
  const wa = contactoWhatsApp();
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <header className="grid gap-2">
        <h1 className="enlace-icono text-4xl font-bold tracking-tight">
          <IconoCercalud nombre="mensaje" size={32} className="text-menta" />
          Contacto
        </h1>
        <p className="text-muted">
          Cercalud es un directorio privado de información de salud del corredor. Para publicidad, correcciones o
          consultas sobre una ficha, escribinos.
        </p>
      </header>
      <section className="tarjeta grid gap-4">
        <p>
          <span className="font-semibold">Correo: </span>
          <a href={`mailto:${mail}`} className="font-semibold text-link hover:underline">
            {mail}
          </a>
        </p>
        {wa ? (
          <p>
            <span className="font-semibold">WhatsApp institucional: </span>
            <a href={enlaceWhatsApp(wa, "Hola, consulto por Cercalud.")} className="font-semibold text-link hover:underline" target="_blank" rel="noopener noreferrer">
              Escribinos por WhatsApp
            </a>
          </p>
        ) : null}
        <p className="text-sm text-muted">
          Los turnos no se gestionan desde Cercalud: contactá al profesional o al lugar desde su ficha publicada.
        </p>
      </section>
      <EspacioPublicitario formato="mpu" descripcion="Espacio disponible para anunciantes del corredor." />
      <p className="text-sm">
        <Link href="/privacidad" className="text-link hover:underline">
          Privacidad
        </Link>
        {" · "}
        <Link href="/terminos" className="text-link hover:underline">
          Términos de uso
        </Link>
      </p>
    </div>
  );
}