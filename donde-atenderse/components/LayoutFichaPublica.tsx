import { ColumnaPublicidad } from "@/components/ColumnaPublicidad";

export function LayoutFichaPublica({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-page items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-5">
      <div className="min-w-0">{children}</div>
      <div className="w-full min-w-[280px] lg:sticky lg:top-24">
        <ColumnaPublicidad />
      </div>
    </div>
  );
}