export function InsigniaVerificacion({ activa }: { activa: boolean }) {
  if (!activa) return null;
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      className="h-12 w-12 shrink-0"
      role="img"
      aria-hidden
    >
      <title>Ficha actualizada en los últimos 30 días</title>
      <path
        fill="#1d9bf0"
        d="M24 3.2 27.1 8.3 33.1 7.5 33.4 13.5 39 15.2 36.7 20.4 41 24 36.7 27.6 39 32.8 33.4 34.5 33.1 40.5 27.1 39.7 24 44.8 20.9 39.7 14.9 40.5 14.6 34.5 9 32.8 11.3 27.6 7 24 11.3 20.4 9 15.2 14.6 13.5 14.9 7.5 20.9 8.3Z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M32.2 17.6 21.4 28.4l-5.6-5.6 1.65-1.65 3.95 3.95 9.1-9.1z"
        clipRule="evenodd"
      />
    </svg>
  );
}