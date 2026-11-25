import { LOCALIDADES } from "@/lib/constants";
import { etiquetaLugar } from "@/lib/format";

export function CrearUsuarioAdmin({
  lugares,
}: {
  lugares: { id: string; name: string; locality: string; kind: string }[];
}) {
  const ordenados = [...lugares].sort((a, b) => {
    const loc = a.locality.localeCompare(b.locality, "es");
    return loc !== 0 ? loc : a.name.localeCompare(b.name, "es");
  });

  return (
    <form action="/api/admin/usuarios" method="post" className="grid gap-3">
      <label className="grid gap-1 text-sm">
        Nombre (aparece en el panel)
        <input name="name" className="campo" autoComplete="name" required minLength={2} />
      </label>
      <label className="grid gap-1 text-sm">
        Correo de ingreso
        <input name="email" type="email" className="campo" autoComplete="email" required />
      </label>
      <label className="grid gap-1 text-sm">
        Contraseña inicial (mínimo 8 caracteres)
        <input name="password" type="text" className="campo" autoComplete="new-password" required minLength={8} />
      </label>
      <label className="grid gap-1 text-sm">
        Tipo de cuenta
        <select name="role" className="campo" defaultValue="secretaria" id="rol-usuario">
          <option value="secretaria">Secretaria de lugar (carga profesionales de su/s lugar/es)</option>
          <option value="profesional">Profesional (edita solo su ficha)</option>
        </select>
      </label>
      <fieldset className="grid gap-2 rounded-xl border border-line bg-paper/60 p-3">
        <legend className="px-1 text-sm font-semibold">Lugares asignados (solo secretaria)</legend>
        <p className="text-xs text-muted">Corredor: {LOCALIDADES.join(" · ")}</p>
        <div className="grid max-h-48 gap-2 overflow-y-auto rounded-lg border border-line bg-white p-2">
          {ordenados.map((lugar) => (
            <label key={lugar.id} className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="placeIds" value={lugar.id} className="mt-1 size-3.5 accent-accent" />
              <span>
                {lugar.name} · {etiquetaLugar(lugar.kind)} · {lugar.locality}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="boton w-fit">
        Crear usuario
      </button>
    </form>
  );
}