import Link from "next/link";

export default function NoEncontrada() {
  return (
    <div className="grid max-w-xl gap-4">
      <h1 className="text-4xl font-bold tracking-tight">No encontramos esa página</h1>
      <Link href="/buscar" className="font-semibold text-link">
        Volver a buscar
      </Link>
    </div>
  );
}
