import Link from "next/link";
import { redirect } from "next/navigation";
import { salir } from "@/actions/auth";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { etiquetaLugar } from "@/lib/format";

export default async function Panel() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  if (esAdmin(usuario)) redirect("/panel/admin");

  const pendiente = usuario.professional && !usuario.professional.reviewed;
  const bajada = usuario.professional?.reviewed && !usuario.professional.published;

  return (
    <div className="grid max-w-2xl gap-8">
      <header className="grid gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Hola, {usuario.name}</h1>
        <p className="text-muted">
          Cargás tu ficha y los días en que atendés. Los lugares los publica Cercalud.
        </p>
      </header>
      {pendiente ? (
        <p className="rounded-2xl border border-line bg-paper px-4 py-3">
          Tu ficha está a la espera de la primera revisión. Mientras tanto no aparece en la búsqueda.
        </p>
      ) : null}
      {bajada ? (
        <p className="rounded-2xl border border-line bg-paper px-4 py-3">
          Tu ficha está bajada. Podés seguir editándola.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Link className="boton" href="/panel/profesional">
          {usuario.professional ? "Editar mi ficha" : "Cargar mi ficha de profesional"}
        </Link>
      </div>
      {usuario.places.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-2xl font-semibold">Lugares que te asignaron</h2>
          <p className="text-muted">Si trabajás en la recepción de un lugar, Cercalud te da acceso a esa ficha.</p>
          {usuario.places.map((item) => (
            <Link key={item.placeId} href={`/panel/lugar/${item.placeId}`} className="border-t border-line py-3">
              <span className="font-semibold">{item.place.name}</span>
              <span className="text-muted">
                {" "}
                · {etiquetaLugar(item.place.kind)} · {item.place.locality}
                {item.place.published ? "" : " · Sin publicar"}
              </span>
            </Link>
          ))}
        </section>
      ) : null}
      <form action={salir}>
        <button className="font-semibold text-link" type="submit">
          Salir
        </button>
      </form>
    </div>
  );
}
