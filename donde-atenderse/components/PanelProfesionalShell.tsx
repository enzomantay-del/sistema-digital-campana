import Link from "next/link";
import type { ReactNode } from "react";

export function PanelProfesionalShell({
  nombre,
  publicada,
  revisada,
  children,
}: {
  nombre: string;
  publicada: boolean;
  revisada: boolean;
  children: ReactNode;
}) {
  const estadoPublicacion = publicada
    ? "Publicada en la web"
    : revisada
      ? "En revisión para publicar"
      : "Borrador · primera revisión pendiente";

  return (
    <div className="min-h-[60vh] rounded-3xl border border-menta/25 bg-gradient-to-b from-[#e8f7f3]/80 via-white to-white p-4 shadow-sm sm:p-8">
      <header className="mb-8 grid gap-4 border-b border-menta/20 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-menta">Panel del profesional</p>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{nombre || "Tu ficha"}</h1>
            <p className="text-sm text-muted">{estadoPublicacion}</p>
          </div>
          <Link href="/" className="boton-suave text-sm">
            Ver sitio público
          </Link>
        </div>
        <ol className="grid gap-2 text-sm sm:grid-cols-2">
          <li className="rounded-2xl border border-line bg-white/90 px-4 py-3">
            <span className="font-semibold text-menta">1 · Tus datos</span>
            <p className="mt-1 text-muted">Foto, matrícula y especialidades. Una sola ficha por matrícula.</p>
          </li>
          <li className="rounded-2xl border border-line bg-white/90 px-4 py-3">
            <span className="font-semibold text-menta">2 · Dónde atendés</span>
            <p className="mt-1 text-muted">
              Agregá cada sede (hospital, consultorio…), el horario y las obras sociales en ese centro.
            </p>
          </li>
        </ol>
      </header>
      {children}
    </div>
  );
}