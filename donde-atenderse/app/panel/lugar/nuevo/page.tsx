import { redirect } from "next/navigation";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";

export default async function NuevoLugar({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string; nombre?: string; n?: string }>;
}) {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  if (!esAdmin(usuario)) redirect("/panel");

  const { error, ok, nombre, n } = await searchParams;
  const cantidad = Number(n);
  const variosPublicados = ok === "publicado" && Number.isFinite(cantidad) && cantidad > 1;
  const mensaje =
    error === "nombre"
      ? "Escribí el nombre del lugar."
      : error === "localidad"
        ? "Elegí una localidad del corredor."
        : error === "servidor"
          ? "No pudimos guardar el lugar en la base (suele pasar si el hosting no actualizó las tablas). Volvé a publicar la app en Cursor y probá otra vez; si sigue, avisanos."
        : error
          ? "Revisá los datos del lugar."
          : "";

  return (
    <form action="/api/lugar/crear" method="post" className="grid max-w-xl gap-4">
      <h1 className="text-4xl font-semibold tracking-tight">Cargar un lugar</h1>
      <p className="text-muted">Hospitales, sanatorios, consultorios, estudios y farmacias del corredor.</p>
      {ok === "publicado" ? (
        <div className="rounded-2xl border border-menta bg-[#e8f7f3] p-4" role="status">
          <p className="font-semibold text-menta">
            {variosPublicados
              ? `Publicaste ${cantidad} lugares en la web.`
              : nombre?.trim()
                ? `«${nombre.trim()}» quedó publicado en la web.`
                : "El lugar quedó publicado en la web."}
          </p>
          <p className="mt-1 text-sm text-muted">Completá el formulario de abajo para cargar otro.</p>
        </div>
      ) : null}
      <label className="grid gap-1">
        Nombre
        <input name="name" className="campo" required />
      </label>
      <label className="grid gap-1">
        Tipo
        <select name="kind" className="campo" defaultValue="hospital">
          {TIPOS_LUGAR.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        Localidad
        <select name="locality" className="campo" defaultValue="Jardín América">
          {LOCALIDADES.map((localidad) => (
            <option key={localidad} value={localidad}>
              {localidad}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        Dirección
        <input name="address" className="campo" />
      </label>
      {mensaje ? <p className="text-warn">{mensaje}</p> : null}
      <button className="boton w-fit">Continuar</button>
    </form>
  );
}
