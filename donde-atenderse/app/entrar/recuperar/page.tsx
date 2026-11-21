import Link from "next/link";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import {
  MENSAJE_RECUPERACION_INGRESO,
  enlaceRecuperacionIngreso,
  numeroWhatsAppRecuperacion,
} from "@/lib/recuperacion";

export default function RecuperarContrasena() {
  const whatsapp = enlaceRecuperacionIngreso();
  const telefono = numeroWhatsAppRecuperacion();
  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <h1 className="enlace-icono text-4xl font-bold tracking-tight">
        <IconoCercalud nombre="mensaje" size={32} className="text-menta" />
        Recuperar ingreso
      </h1>
      <p className="text-muted">
        Si olvidaste el correo o la contraseña, escribinos por WhatsApp. Te respondemos para restablecer el acceso.
      </p>
      <section className="tarjeta grid gap-4">
        <a
          href={whatsapp}
          className="boton w-fit enlace-icono gap-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconoCercalud nombre="contacto-directo" size={22} className="text-white" />
          Abrir WhatsApp
        </a>
        <p className="text-sm text-muted">
          Se abre un chat con el mensaje: «{MENSAJE_RECUPERACION_INGRESO}» al número{" "}
          <span className="font-semibold text-ink">{telefono}</span>. Podés agregar tu nombre y el correo que creías
          usar.
        </p>
      </section>
      <p>
        <Link href="/entrar" className="font-semibold text-link">
          Volver a entrar
        </Link>
      </p>
    </div>
  );
}