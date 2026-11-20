import type { ReactNode } from "react";

export function TarjetaPublicidad({ children, pie }: { children: ReactNode; pie?: ReactNode }) {
  return (
    <div className="grid w-full gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-sm sm:p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Publicidad · ejemplo</p>
      {children}
      {pie ? <p className="text-[11px] leading-snug text-muted">{pie}</p> : null}
    </div>
  );
}