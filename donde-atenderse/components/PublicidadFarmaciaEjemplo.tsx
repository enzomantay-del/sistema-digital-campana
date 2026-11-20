import Image from "next/image";
import Link from "next/link";
import { enlaceWhatsApp } from "@/lib/format";

/** Espacio de publicidad de demostración (no es un anuncio real). */
export function PublicidadFarmaciaEjemplo() {
  const whatsapp = "3743000500";
  return (
    <aside
      className="grid gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm"
      aria-label="Espacio publicitario de ejemplo"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Publicidad · ejemplo</p>
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-white">
          <Image
            src="/ejemplos/farmacia-lapachos.svg"
            alt=""
            fill
            className="object-contain p-1"
            sizes="56px"
            unoptimized
          />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">Farmacia Los Lapachos</p>
          <p className="text-sm text-muted">Jardín América</p>
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-[#e8f7f4]">
        <Image
          src="/ejemplos/publicidad-farmacia-promo.svg"
          alt=""
          fill
          className="object-cover"
          sizes="320px"
          unoptimized
        />
      </div>
      <p className="text-base font-semibold leading-snug">20% en dermocosmética y vitaminas hasta fin de mes</p>
      <p className="text-sm text-muted">
        Horario de ejemplo: lun a sáb 8 a 21 · dom 9 a 13. Entrega a domicilio en el centro del pueblo.
      </p>
      <div className="grid gap-2">
        <Link href="/farmacia" className="boton w-full text-center">
          Ver farmacia de turno
        </Link>
        <a
          className="boton-suave w-full text-center"
          href={enlaceWhatsApp(whatsapp, "Hola, vi la publicación en Cercalud.")}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>
      <p className="text-xs text-muted">Maqueta para mostrar cómo podría verse un anuncio pagado. No es contratación real.</p>
    </aside>
  );
}