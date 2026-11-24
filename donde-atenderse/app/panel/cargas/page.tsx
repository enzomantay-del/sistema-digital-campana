import Link from "next/link";
import { redirect } from "next/navigation";
import { salir } from "@/actions/auth";
import { esSecretaria, usuarioActual } from "@/lib/auth";
import { etiquetaLugar } from "@/lib/format";
import { lugarPermiteCargaSecretaria } from "@/lib/lugarAsignacion";

export default async function PanelCargas() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  if (!esSecretaria(usuario)) redirect("/panel");

  const lugaresAsignados = usuario.places.filter((item) => lugarPermiteCargaSecretaria(item.place.kind));

  return (
    <div className="grid max-w-2xl gap-8">
      <header className="grid gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Carga de profesionales</h1>
        <p className="text-muted">
          Elegí el lugar donde trabajás en recepción. Cargás o actualizás la ficha del profesional y el horario en ese
          lugar. Si el médico atiende en otro centro, la secretaría de ese otro lugar carga su horario allí.
        </p>
      </header>
      {lugaresAsignados.length === 0 ? (
        <p className="text-warn">Todavía no tenés un lugar asignado. Pedile a la administración que te dé acceso.</p>
      ) : (
        <section className="grid gap-3">
          <h2 className="text-xl font-semibold">Tus lugares</h2>
          {lugaresAsignados.map((item) => (
            <Link
              key={item.placeId}
              href={`/panel/cargas/${item.placeId}`}
              className="tarjeta grid gap-1 transition hover:ring-2 hover:ring-menta/30"
            >
              <span className="text-xl font-semibold">{item.place.name}</span>
              <span className="text-muted">
                {etiquetaLugar(item.place.kind)} · {item.place.locality}
              </span>
            </Link>
          ))}
        </section>
      )}
      <form action={salir}>
        <button className="font-semibold text-link" type="submit">
          Salir
        </button>
      </form>
    </div>
  );
}