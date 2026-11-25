import { EspacioPublicitario } from "@/components/EspacioPublicitario";

/** Segunda franja en portada: formatos más chicos, en fila en pantallas anchas. */
export function PublicidadBloqueInicio() {
  return (
    <div className="mx-auto grid w-full max-w-page gap-1 px-1 sm:grid-cols-2 sm:justify-items-center">
      <EspacioPublicitario formato="mpu" />
      <EspacioPublicitario formato="cuadrado" />
    </div>
  );
}