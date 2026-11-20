import { ColumnaPublicidad } from "@/components/ColumnaPublicidad";

export function LayoutFichaPublica({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full items-start gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="min-w-0 lg:max-w-[42rem]">{children}</div>
      <div className="min-w-0 lg:sticky lg:top-24">
        <ColumnaPublicidad />
      </div>
    </div>
  );
}