import type { ReactNode } from "react";

export function TarjetaPublicidad({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full gap-3 overflow-hidden rounded-2xl border-2 border-[#dce5ee] bg-white shadow-md ring-1 ring-black/5">
      <div className="bg-gradient-to-r from-[#12275c]/10 to-transparent px-3 py-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5c6b8a]">Publicidad</p>
      </div>
      <div className="grid gap-3 px-3.5 pb-4 pt-0 sm:px-4">{children}</div>
    </div>
  );
}