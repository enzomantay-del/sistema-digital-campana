import { AREAS, LOCALIDADES } from "@/lib/constants";

export function Buscador({
  q = "",
  localidad = "",
  area = "",
  obra = "",
  obras = [],
  mostrarFiltros = false,
}: {
  q?: string;
  localidad?: string;
  area?: string;
  obra?: string;
  obras?: string[];
  mostrarFiltros?: boolean;
}) {
  return (
    <form action="/buscar" className="grid gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="q">
          Buscar un profesional, una especialidad o un lugar
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Nombre, especialidad o lugar"
          className="campo"
        />
        <button className="boton shrink-0" type="submit">
          Buscar
        </button>
      </div>
      {mostrarFiltros ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm text-muted">
            Localidad
            <select name="localidad" defaultValue={localidad} className="campo">
              <option value="">Todas</option>
              {LOCALIDADES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Área
            <select name="area" defaultValue={area} className="campo">
              <option value="">Todas</option>
              {AREAS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Obra social
            <select name="obra" defaultValue={obra} className="campo">
              <option value="">Todas</option>
              {obras.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </form>
  );
}
