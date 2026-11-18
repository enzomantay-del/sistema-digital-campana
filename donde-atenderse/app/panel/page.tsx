import Link from "next/link";
import { redirect } from "next/navigation";
import { salir } from "@/actions/auth";
import { usuarioActual } from "@/lib/auth";
import { etiquetaLugar } from "@/lib/format";

export default async function Panel() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  return (
    <div className="grid max-w-2xl gap-8">
      <header className="grid gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">Hola, {usuario.name}</h1>
        <p className="text-muted">La ficha es gratis. Lo que cargues es lo que ve el paciente.</p>
      </header>
      <div className="flex flex-wrap gap-3">
        <Link className="boton" href="/panel/profesional">
          {usuario.professional ? "Editar mi ficha" : "Cargar mi ficha de profesional"}
        </Link>
        <Link className="boton-suave" href="/panel/lugar/nuevo">
          Cargar un lugar
        </Link>
      </div>
      {usuario.places.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-2xl font-semibold">Lugares</h2>
          {usuario.places.map((item) => (
            <Link key={item.placeId} href={`/panel/lugar/${item.placeId}`} className="border-t border-line py-3">
              <span className="font-semibold">{item.place.name}</span>
              <span className="text-muted">
                {" "}
                · {etiquetaLugar(item.place.kind)} · {item.place.locality}
              </span>
            </Link>
          ))}
        </section>
      ) : null}
      <form action={salir}>
        <button className="text-accent font-semibold" type="submit">
          Salir
        </button>
      </form>
    </div>
  );
}
