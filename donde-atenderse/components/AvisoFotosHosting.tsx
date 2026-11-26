import { avisoFotosHosting } from "@/lib/config";

export function AvisoFotosHosting() {
  if (!avisoFotosHosting()) return null;
  return (
    <p className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-muted">
      Las fotos están en el disco del hosting y pueden perderse al republicar. Configurá almacenamiento S3/R2 en los
      Secrets de la app (ver documentación en el repo) o guardá una copia en tu equipo.
    </p>
  );
}