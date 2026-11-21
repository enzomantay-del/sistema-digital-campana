import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Encabezado } from "@/components/Encabezado";
import { Pie } from "@/components/Pie";
import { mostrarDatosEjemplo } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Cercalud",
  applicationName: "Cercalud",
  description:
    "Profesionales, consultorios, hospitales, sanatorios, estudios y farmacia de turno en el corredor de Jardín América.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ejemplo =
    mostrarDatosEjemplo() && (await prisma.professional.count({ where: { example: true, published: true } })) > 0;
  return (
    <html lang="es">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <Encabezado ejemplo={ejemplo} />
        <main className="mx-auto min-h-[70vh] max-w-page px-4 py-8">{children}</main>
        <Pie ejemplo={ejemplo} />
      </body>
    </html>
  );
}
