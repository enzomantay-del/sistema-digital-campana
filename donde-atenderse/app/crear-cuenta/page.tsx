import Link from "next/link";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import {
  enlacePedirAccesoCercalud,
  MENSAJE_PEDIR_ACCESO,
  numeroWhatsAppCercalud,
} from "@/lib/contactoCercalud";

export default function CrearCuenta() {
  const whatsapp = enlacePedirAccesoCercalud();
  const telefono = numeroWhatsAppCercalud();
  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <h1 className="enlace-icono text-4xl font-bold tracking-tight">
        <IconoCercalud nombre="mensaje" size={32} className="text-menta" />
        Pedir acceso
      </h1>
      <p className="text-muted">
        Las cuentas las crea la administración de Cercalud. Escribinos por WhatsApp: te damos usuario y contraseña para
        tu ficha o para cargar todo un centro de salud (profesionales y secretaría).
      </p>
      <section className="tarjeta grid gap-4">
        <a href={whatsapp} className="boton w-fit enlace-icono gap-2" target="_blank" rel="noopener noreferrer">
          <IconoCercalud nombre="contacto-directo" size={22} className="text-white" />
          Abrir WhatsApp
        </a>
        <p className="text-sm text-muted">
          Se abre un chat con Cercalud al{" "}
          <span className="font-semibold text-ink">{telefono}</span> y este mensaje (podés editarlo antes de enviar):
        </p>
        <p className="rounded-xl border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink">
          {MENSAJE_PEDIR_ACCESO}
        </p>
      </section>
      <p className="text-sm text-muted">
        Si ya tenés cuenta,{" "}
        <Link href="/entrar" className="font-semibold text-link">
          entrá acá
        </Link>
        . Más info en{" "}
        <Link href="/soy-profesional" className="font-semibold text-link">
          Sumate a Cercalud
        </Link>
        .
      </p>
    </div>
  );
}