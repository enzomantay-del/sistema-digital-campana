import { avisoFotosHosting } from "@/lib/config";

export function AvisoFotosHosting() {
  if (!avisoFotosHosting()) return null;
  return (
    <p className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-muted">
      Las fotos se guardan en el servidor del hosting. Si republicamos la app, pueden perderse hasta que activemos
      almacenamiento permanente. Guardá una copia en tu equipo.
    </p>
  );
}