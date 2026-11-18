import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Cercalud",
  description:
    "Profesionales, consultorios, hospitales, sanatorios, estudios y farmacia de turno en el corredor de Jardín América.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ejemplos = await prisma.professional.count({ where: { example: true } });
  const ejemplo = ejemplos > 0;
  return (
    <html lang="es">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <Encabezado ejemplo={ejemplo} />
        <main className="mx-auto min-h-[70vh] max-w-page px-4 py-8">{children}</main>
        <Pie ejemplo={ejemplo} />
      </body>
    </html>
  );
}
