import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { AvisoEjemplo } from "@/components/AvisoEjemplo";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const source = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
});

export const metadata: Metadata = {
  title: "Dónde atenderse",
  description:
    "Profesionales, consultorios, hospitales, sanatorios, estudios y farmacia de turno en el corredor de Jardín América.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ejemplos = await prisma.professional.count({ where: { example: true } });
  return (
    <html lang="es">
      <body className={`${source.variable} font-sans antialiased`}>
        {ejemplos > 0 ? <AvisoEjemplo /> : null}
        <Encabezado />
        <main className="mx-auto min-h-[70vh] max-w-page px-4 py-8">{children}</main>
        <Pie />
      </body>
    </html>
  );
}
