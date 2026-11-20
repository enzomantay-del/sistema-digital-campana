function contornoSello(picos = 12) {
  const cx = 28;
  const cy = 28;
  const exterior = 26;
  const interior = 22;
  const coords: string[] = [];
  for (let i = 0; i < picos * 2; i++) {
    const angulo = (Math.PI * 2 * i) / (picos * 2) - Math.PI / 2;
    const radio = i % 2 === 0 ? exterior : interior;
    coords.push(`${(cx + radio * Math.cos(angulo)).toFixed(2)},${(cy + radio * Math.sin(angulo)).toFixed(2)}`);
  }
  return `M ${coords.join(" L ")} Z`;
}

export function InsigniaVerificacion({ activa }: { activa: boolean }) {
  if (!activa) return null;
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      className="h-14 w-14 shrink-0"
      role="img"
      aria-hidden
    >
      <title>Ficha actualizada en los últimos 30 días</title>
      <path fill="#1d9bf0" d={contornoSello()} />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.5 28 25 35.5 40.5 19.5"
      />
    </svg>
  );
}