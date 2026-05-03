import { Sidebar } from "@/components/panel/Sidebar";

export const dynamic = "force-dynamic";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:pl-64">
      <Sidebar />
      <main className="px-4 py-6 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}
