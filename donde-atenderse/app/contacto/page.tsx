import Link from "next/link";
import { EspacioPublicitario } from "@/components/EspacioPublicitario";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import {
  enlaceWhatsAppCercalud,
  MENSAJE_CONSULTA_CERCALUD,
  numeroWhatsAppCercalud,
} from "@/lib/contactoCercalud";

export default function PaginaContacto() {
  const wa = enlaceWhatsAppCercalud(MENSAJE_CONSULTA_CERCALUD);
  const telefono = numeroWhatsAppCercalud();
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <header className="grid gap-2">
        <h1 className="enlace-icono text-4xl font-bold tracking-tight">
          <IconoCercalud nombre="mensaje" size={32} className="text-menta" />
          Contacto
        </h1>
        <p className="text-muted">
          Cercalud es un directorio privado de información de salud del corredor. Para publicidad, correcciones,
          consultas sobre una ficha o pedir acceso al panel, escribinos por WhatsApp.
        </p>
      </header>
      <section className="tarjeta grid gap-4">
        <p>
          <span className="font-semibold">WhatsApp: </span>
          <a
            href={wa}
            className="font-semibold text-link hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {telefono}
          </a>
        </p>
        <a href={wa} className="boton w-fit enlace-icono gap-2" target="_blank" rel="noopener noreferrer">
          <IconoCercalud nombre="contacto-directo" size={22} className="text-white" />
          Escribinos por WhatsApp
        </a>
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