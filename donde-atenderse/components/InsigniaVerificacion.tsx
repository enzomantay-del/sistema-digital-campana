export function InsigniaVerificacion({ activa }: { activa: boolean }) {
  if (!activa) return null;
  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-menta/50 bg-[#e8f7f3] px-2.5 py-1 text-xs font-semibold text-[#0d7a6b]"
      title="Quien carga la ficha actualizó sus datos en los últimos 30 días."
    >
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden className="shrink-0 text-menta">
        <path
          fill="currentColor"
          d="M6.2 11.4 3.4 8.6l1.1-1.1 1.7 1.7 4.3-4.3 1.1 1.1z"
        />
        <path
          fill="currentColor"
          fillOpacity="0.35"
          d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 1.8a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Z"
        />
      </svg>
      Datos actualizados
    </span>
  );
}