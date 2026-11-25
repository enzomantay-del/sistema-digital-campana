import { ColumnaPublicidad } from "@/components/ColumnaPublicidad";

export function LayoutFichaPublica({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[76rem] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
      <div className="min-w-0 lg:max-w-[42rem]">{children}</div>
      <div className="w-full max-w-[300px] justify-self-end lg:sticky lg:top-24">
        <ColumnaPublicidad />
      </div>
    </div>
  );
}