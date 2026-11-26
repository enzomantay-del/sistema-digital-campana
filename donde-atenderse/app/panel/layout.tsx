import { PanelBarraSesion } from "@/components/PanelBarraSesion";
import { usuarioActual } from "@/lib/auth";

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActual();

  return (
    <div className="grid gap-6">
      {usuario ? <PanelBarraSesion usuario={usuario} /> : null}
      {children}
    </div>
  );
}