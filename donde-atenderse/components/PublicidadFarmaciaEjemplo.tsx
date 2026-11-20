import Image from "next/image";
import Link from "next/link";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";
import { enlaceWhatsApp } from "@/lib/format";

export function PublicidadFarmaciaEjemplo() {
  const whatsapp = "3743000500";
  return (
    <TarjetaPublicidad pie="Maqueta de anuncio pagado. No es contratación real.">
      <div className="flex gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-white">
          <Image
            src="/ejemplos/farmacia-lapachos.svg"
            alt=""
            fill
            className="object-contain p-1"
            sizes="48px"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold leading-tight">Farmacia Los Lapachos</p>
          <p className="text-xs text-muted">Jardín América · 20% vitaminas</p>
        </div>
        <div className="relative hidden h-12 w-24 shrink-0 overflow-hidden rounded-lg border border-line sm:block">
          <Image src="/ejemplos/publicidad-farmacia-promo.svg" alt="" fill className="object-cover" sizes="96px" unoptimized />
        </div>
      </div>
      <p className="text-sm text-muted">Lun a sáb 8 a 21 · dom 9 a 13 · entrega en el centro.</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/farmacia" className="boton flex-1 min-w-[8rem] text-center text-sm">
          Farmacia de turno
        </Link>
        <a
          className="boton-suave flex-1 min-w-[8rem] text-center text-sm"
          href={enlaceWhatsApp(whatsapp, "Hola, vi la publicación en Cercalud.")}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </TarjetaPublicidad>
  );
}