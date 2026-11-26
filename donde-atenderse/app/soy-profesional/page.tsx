import Link from "next/link";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { LayoutContenidoConColumna } from "@/components/LayoutContenidoConColumna";

const PASOS = [
  {
    titulo: "Cercalud te crea la cuenta",
    texto: "No hay registro abierto: pedís acceso por WhatsApp, validamos matrícula y datos, y te damos usuario y contraseña.",
    icono: "sello" as const,
  },
  {
    titulo: "Cargás o actualizás tu ficha",
    texto: "Horarios por sede, obras sociales, contacto de agenda y foto. Si atendés en un centro, la secretaría también puede cargar profesionales del lugar.",
    icono: "ficha" as const,
  },
  {
    titulo: "El paciente te encuentra y te escribe",
    texto: "En la web pública ven tu especialidad, dónde atendés, horarios y WhatsApp o teléfono. Cercalud no saca turnos: el contacto es directo con vos.",
    icono: "contacto-directo" as const,
  },
];

const VE_PACIENTE = [
  "Nombre, especialidad y matrícula",
  "Foto y datos de verificación si actualizaste la ficha",
  "Cada lugar donde atendés, con horarios y obras sociales",
  "WhatsApp y teléfono de agenda (y del lugar cuando corresponda)",
];

export default function PaginaSoyProfesional() {
  return (
    <LayoutContenidoConColumna>
    <div className="grid max-w-2xl gap-8">
      <header className="grid gap-3">
        <h1 className="enlace-icono text-4xl font-bold tracking-tight">
          <IconoCercalud nombre="profesional" size={36} className="text-menta" />
          Sumate a Cercalud
        </h1>
        <p className="text-lg text-muted">
          Es gratis para profesionales del corredor: tu ficha en un directorio local que usan vecinos para buscar quién
          atiende, con qué obra social y cómo contactarte.
        </p>
      </header>

      <section className="tarjeta grid gap-4">
        <h2 className="text-xl font-semibold">Cómo funciona</h2>
        <ol className="grid gap-4">
          {PASOS.map((paso, indice) => (
            <li key={paso.titulo} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-sm font-bold text-link">
                {indice + 1}
              </span>
              <div className="grid gap-1">
                <p className="enlace-icono font-semibold">
                  <IconoCercalud nombre={paso.icono} size={18} className="text-menta" />
                  {paso.titulo}
                </p>
                <p className="text-sm text-muted">{paso.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Qué ve el paciente</h2>
        <ul className="grid gap-2 text-sm text-muted">
          {VE_PACIENTE.map((item) => (
            <li key={item} className="enlace-icono">
              <IconoCercalud nombre="buscar" size={16} className="shrink-0 text-menta" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          Podés ver una{" "}
          <Link href="/ejemplo/profesional" className="font-semibold text-link">
            ficha de ejemplo
          </Link>{" "}
          antes de pedir tu cuenta.
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/entrar" className="boton gap-2">
          Ya tengo cuenta — entrar
        </Link>
        <Link href="/crear-cuenta" className="boton-suave gap-2">
          Pedir acceso
        </Link>
        <Link href="/contacto" className="text-sm font-semibold text-link self-center">
          Consultas
        </Link>
      </section>
    </div>
    </LayoutContenidoConColumna>
  );
}