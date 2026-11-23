import Image from "next/image";
import Link from "next/link";
import { IconoCercalud } from "@/components/iconos/IconoCercalud";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";
import { enlaceWhatsApp } from "@/lib/format";

export function PublicidadFarmaciaEjemplo() {
  const whatsapp = "3743000500";
  return (
    <TarjetaPublicidad variante="skyscraper" ejemplo>
      <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-[#0d9488]">
        <Image
          src="/ejemplos/publicidad-farmacia-promo.svg"
          alt=""
          fill
          className="object-cover opacity-95"
          sizes="400px"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12275c]/90 via-[#12275c]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-[#a7f3d0]">Oferta limitada</p>
          <p className="text-xl font-extrabold leading-tight">20% OFF en vitaminas y dermocosmética</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
          <Image src="/ejemplos/farmacia-lapachos.svg" alt="" fill className="object-contain p-0.5" sizes="44px" unoptimized />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">Farmacia Los Lapachos</p>
          <p className="text-sm text-muted">Jardín América · entrega en el centro</p>
        </div>
      </div>
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
        3x2 en agua mineral presentando este aviso. Válido hasta el domingo.
      </p>
      <div className="grid gap-2">
        <Link href="/farmacia" className="boton w-full gap-2 text-center text-base font-bold">
          <IconoCercalud nombre="farmacia" size={18} className="text-white/95" />
          Ver farmacia de turno hoy
        </Link>
        <a
          className="boton-suave w-full gap-2 text-center text-sm font-semibold"
          href={enlaceWhatsApp(whatsapp, "Hola, quiero consultar la promo que vi en Cercalud.")}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconoCercalud nombre="mensaje" size={17} className="text-link" />
          Pedir por WhatsApp
        </a>
      </div>
    </TarjetaPublicidad>
  );
}