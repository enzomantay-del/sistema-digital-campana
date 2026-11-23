import Image from "next/image";
import { TarjetaPublicidad } from "@/components/TarjetaPublicidad";

/** Prueba visual: banner debajo del buscador en inicio (sin enlace). */
export function PublicidadPruebaInicio() {
  return (
    <TarjetaPublicidad variante="leaderboard" ejemplo>
      <div className="relative w-full overflow-hidden">
        <Image
          src="/ejemplos/publicidad-farma-tu-prueba.jpg"
          alt="Aviso de ejemplo: formato de banda horizontal en la portada"
          width={1712}
          height={624}
          className="h-auto w-full object-contain"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) min(100vw - 2rem, 48rem), 48rem"
          priority={false}
        />
      </div>
    </TarjetaPublicidad>
  );
}