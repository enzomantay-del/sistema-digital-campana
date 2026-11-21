import Link from "next/link";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { contactoEmail, contactoWhatsApp } from "@/lib/config";
import { enlaceWhatsApp } from "@/lib/format";

export default function RecuperarContrasena() {
  const mail = contactoEmail();
  const wa = contactoWhatsApp();
  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <h1 className="enlace-icono text-4xl font-bold tracking-tight">
        <IconoCercalud nombre="mensaje" size={32} className="text-menta" />
        Recuperar contraseña
      </h1>
      <p className="text-muted">
        Todavía no hay recuperación automática por correo. Si olvidaste la contraseña, escribinos con el correo de tu
        cuenta y te ayudamos a restablecerla de forma manual.
      </p>
      <section className="tarjeta grid gap-3">
        <a href={`mailto:${mail}?subject=Recuperar%20contraseña%20Cercalud`} className="font-semibold text-link hover:underline">
          {mail}
        </a>
        {wa ? (
          <a
            href={enlaceWhatsApp(wa, "Hola, necesito recuperar mi contraseña de Cercalud.")}
            className="font-semibold text-link hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp institucional
          </a>
        ) : null}
      </section>
      <p>
        <Link href="/entrar" className="font-semibold text-link">
          Volver a entrar
        </Link>
      </p>
    </div>
  );
}