import Image from "next/image";

export function InsigniaVerificacion({ activa }: { activa: boolean }) {
  if (!activa) return null;
  return (
    <Image
      src="/iconos/sello-verificado.png"
      alt=""
      width={44}
      height={44}
      className="h-11 w-11 shrink-0 drop-shadow-sm"
      title="Ficha actualizada en los últimos 30 días"
      unoptimized
    />
  );
}