import { textoHorarioUnido } from "@/lib/horarioTexto";

/** Presentación uniforme del horario en toda la web pública. */
export function ListaHorarioTexto({
  lineas,
  className = "text-base text-ink",
  compacto = false,
}: {
  lineas: string[];
  className?: string;
  compacto?: boolean;
}) {
  if (lineas.length === 0) return null;

  if (compacto) {
    const texto = textoHorarioUnido(lineas);
    return (
      <p className={`line-clamp-2 text-xs leading-snug text-muted`} title={texto}>
        {texto}
      </p>
    );
  }

  if (lineas.length === 1) {
    return <p className={className}>{lineas[0]}</p>;
  }

  return (
    <ul className={`grid gap-1 ${className}`}>
      {lineas.map((linea) => (
        <li key={linea}>{linea}</li>
      ))}
    </ul>
  );
}