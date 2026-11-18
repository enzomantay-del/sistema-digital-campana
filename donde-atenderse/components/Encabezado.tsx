import Link from "next/link";
import { usuarioActual } from "@/lib/auth";

export async function Encabezado() {
  const usuario = await usuarioActual();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95">
      <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Dónde atenderse
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-1 text-base">
          <Link href="/buscar" className="hover:text-accent">
            Buscar
          </Link>
          <Link href="/farmacia" className="hover:text-accent">
            Farmacia de turno
          </Link>
          {usuario ? (
            <Link href="/panel" className="font-semibold text-accent">
              Mi ficha
            </Link>
          ) : (
            <Link href="/entrar" className="font-semibold text-accent">
              Cargar mi ficha
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
