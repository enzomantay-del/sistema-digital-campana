import Link from "next/link";

export function Marca({ oficial = false }: { oficial?: boolean }) {
  if (oficial) {
    return (
      <Link href="/" className="inline-flex w-fit">
        <img src="/cercalud.png" alt="Cercalud" width={635} height={511} className="h-auto w-36" />
      </Link>
    );
  }

  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <img src="/marca-icono.png" alt="" width={366} height={373} className="size-9 shrink-0" />
      <img src="/marca-nombre.png" alt="Cercalud" width={615} height={130} className="h-4 w-auto sm:h-5" />
    </Link>
  );
}
