import { redirect } from "next/navigation";
import { crearLugar } from "@/actions/place";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { LOCALIDADES, TIPOS_LUGAR } from "@/lib/constants";

export default async function NuevoLugar({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar");
  if (!esAdmin(usuario)) redirect("/panel");

  const { error } = await searchParams;
  const mensaje =
    error === "nombre"
      ? "Escribí el nombre del lugar."
      : error === "localidad"
        ? "Elegí una localidad del corredor."
        : error
          ? "Revisá los datos del lugar."
          : "";

  return (
    <form action={crearLugar} className="grid max-w-xl gap-4">
      <h1 className="text-4xl font-semibold tracking-tight">Cargar un lugar</h1>
      <p className="text-muted">Hospitales, sanatorios, consultorios, estudios y farmacias del corredor.</p>
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
            <option key={localidad}>{localidad}</option>
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
