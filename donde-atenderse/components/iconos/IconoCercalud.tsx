import type { ReactElement, SVGProps } from "react";

export type NombreIconoCercalud =
  | "profesional"
  | "estudios"
  | "farmacia"
  | "guia"
  | "buscar"
  | "mensaje"
  | "telefono"
  | "ubicacion"
  | "ficha"
  | "corredor"
  | "sello"
  | "areas"
  | "contacto-directo"
  | "area-cuerpo"
  | "area-mental"
  | "area-odontologia"
  | "reloj"
  | "flecha-izq";

type Props = SVGProps<SVGSVGElement> & {
  nombre: NombreIconoCercalud;
  /** Tamaño en px (ancho y alto). */
  size?: number;
};

/** Trazo un poco más marcado para que se lean bien en pantalla. */
const T = 2;

function SvgBase({
  size = 24,
  children,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

function Trazo({ d, ...rest }: { d: string } & SVGProps<SVGPathElement>) {
  return (
    <path
      d={d}
      stroke="currentColor"
      strokeWidth={T}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    />
  );
}

const ICONOS: Record<NombreIconoCercalud, (props: { size?: number; className?: string }) => ReactElement> = {
  profesional: (p) => (
    <SvgBase {...p}>
      <Trazo d="M12 4.25a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5Z" />
      <Trazo d="M7.25 19v-.85c0-2.35 2.13-3.65 4.75-3.65s4.75 1.3 4.75 3.65V19" />
      <path
        d="M18.5 9.25h2M19.5 8.25v2"
        stroke="currentColor"
        strokeWidth={T}
        strokeLinecap="round"
        className="text-menta"
      />
      <Trazo d="M17.25 12.25c.6 1 .95 2.15.95 3.35" className="opacity-70" />
    </SvgBase>
  ),
  estudios: (p) => (
    <SvgBase {...p}>
      <Trazo d="M4.75 7.5h14.5v9H4.75z" />
      <Trazo d="M8 7.5V5.75a1.25 1.25 0 0 1 1.25-1.25h5.5A1.25 1.25 0 0 1 16 5.75V7.5" />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth={T} className="text-menta" />
      <Trazo d="M9.25 12h-1.5M16.25 12h-1.5M12 9.25V7.75M12 16.25v-1.5" className="opacity-55" />
    </SvgBase>
  ),
  farmacia: (p) => (
    <SvgBase {...p}>
      <Trazo d="M9.5 5.25h5A1.75 1.75 0 0 1 16.25 7v11.25H7.75V7A1.75 1.75 0 0 1 9.5 5.25Z" />
      <Trazo d="M10 4.25h4v2.25H10z" />
      <path d="M12 9.75v4.75M9.625 12.125h4.75" stroke="currentColor" strokeWidth={T} strokeLinecap="round" className="text-menta" />
    </SvgBase>
  ),
  guia: (p) => (
    <SvgBase {...p}>
      <Trazo d="M6 5.5h6.25l5.75 3.25v10H6z" />
      <Trazo d="M12.25 5.5v3.25" />
      <Trazo d="M8.5 12h7M8.5 15h4.5" className="opacity-75" />
      <circle cx="15.25" cy="8.35" r="1.15" fill="currentColor" className="text-menta" />
    </SvgBase>
  ),
  buscar: (p) => (
    <SvgBase {...p}>
      <Trazo d="M10.25 5.75a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
      <Trazo d="M14.35 14.35 18.75 18.75" />
    </SvgBase>
  ),
  mensaje: (p) => (
    <SvgBase {...p}>
      <Trazo d="M5.75 6.5h12.5A1.75 1.75 0 0 1 20 8.25v6.75a1.75 1.75 0 0 1-1.75 1.75H10l-4.25 2.75V8.25A1.75 1.75 0 0 1 7.5 6.5Z" />
      <Trazo d="M8.5 11h7M8.5 13.75h4.25" className="opacity-70" />
      <circle cx="17.25" cy="7.25" r="1.5" fill="currentColor" className="text-menta" />
    </SvgBase>
  ),
  telefono: (p) => (
    <SvgBase {...p}>
      <Trazo d="M9.25 4.75h5.5A1.5 1.5 0 0 1 16.25 6.25v11.5A1.5 1.5 0 0 1 14.75 19.25h-5.5A1.5 1.5 0 0 1 7.75 17.75V6.25A1.5 1.5 0 0 1 9.25 4.75Z" />
      <Trazo d="M10.5 17.25h3" />
      <circle cx="12" cy="8" r=".85" fill="currentColor" className="text-menta" />
    </SvgBase>
  ),
  ubicacion: (p) => (
    <SvgBase {...p}>
      <Trazo d="M12 4.25c-2.85 0-5.15 2.08-5.15 4.65 0 3.55 5.15 9.85 5.15 9.85s5.15-6.3 5.15-9.85c0-2.57-2.3-4.65-5.15-4.65Z" />
      <circle cx="12" cy="8.85" r="1.65" stroke="currentColor" strokeWidth={T} className="text-menta" />
    </SvgBase>
  ),
  ficha: (p) => (
    <SvgBase {...p}>
      <Trazo d="M7.75 4.25h6.25l3.25 3.25V19a1.25 1.25 0 0 1-1.25 1.25H7.75A1.25 1.25 0 0 1 6.5 19V5.5a1.25 1.25 0 0 1 1.25-1.25Z" />
      <Trazo d="M14 4.25V7.5h3.25" />
      <Trazo d="M8.75 11.5h6.5M8.75 14.25h6.5M8.75 17h4" className="opacity-75" />
    </SvgBase>
  ),
  corredor: (p) => (
    <SvgBase {...p}>
      <Trazo d="M5.25 16.25c2.2-3.65 4.65-5.5 6.75-5.5s4.55 1.85 6.75 5.5" className="opacity-55" />
      <Trazo d="M6.25 9.5c0-1.65 1.35-3 3-3s3 1.35 3 3-1.35 3-3 3-3-1.35-3-3Z" />
      <Trazo d="M15.25 13.25c0-1.65 1.35-3 3-3s3 1.35 3 3-1.35 3-3 3-3-1.35-3-3Z" />
      <circle cx="9.25" cy="9.5" r="1.15" fill="currentColor" className="text-menta" />
      <circle cx="18.25" cy="13.25" r="1.15" fill="currentColor" className="text-menta" />
    </SvgBase>
  ),
  sello: (p) => (
    <SvgBase {...p}>
      <path
        d="M12 3.5 14.2 4.1l1.9-1.1.65 2.15 2.2.65-1.1 1.9 1.1 1.9-2.2.65-.65 2.2-1.9-1.1-1.9 1.1-.65-2.2-2.2-.65 1.1-1.9-1.1-1.9 2.2-.65.65-2.15 1.9 1.1z"
        stroke="currentColor"
        strokeWidth={T}
        strokeLinejoin="round"
      />
      <Trazo d="M9.25 12.25 11.25 14.35 15.25 10.2" className="text-menta" />
    </SvgBase>
  ),
  areas: (p) => (
    <SvgBase {...p}>
      <circle cx="8.25" cy="10" r="3.25" stroke="currentColor" strokeWidth={T} />
      <circle cx="15.75" cy="10" r="3.25" stroke="currentColor" strokeWidth={T} />
      <circle cx="12" cy="15.75" r="3.25" stroke="currentColor" strokeWidth={T} className="text-menta" />
    </SvgBase>
  ),
  "contacto-directo": (p) => (
    <SvgBase {...p}>
      <Trazo d="M5.5 12c1.65-3.25 4.15-5 6.5-5s4.85 1.75 6.5 5" className="opacity-45" />
      <Trazo d="M8.75 12.5 11 15l5.25-5.5" className="text-menta" />
      <Trazo d="M15.75 6.75h3.25v3.25" />
    </SvgBase>
  ),
  "area-cuerpo": (p) => (
    <SvgBase {...p}>
      <Trazo d="M12 6.25c-1.9 0-3.25 1.35-3.25 3.1 0 2.6 3.25 7.4 3.25 7.4s3.25-4.8 3.25-7.4c0-1.75-1.35-3.1-3.25-3.1Z" />
    </SvgBase>
  ),
  "area-mental": (p) => (
    <SvgBase {...p}>
      <Trazo d="M9.25 7.25c-2 0-3.25 1.55-3.25 3.35 0 1.05.45 2 1.25 2.65-.95.75-1.5 1.8-1.5 3.15 0 2.4 2 3.6 4.25 3.6h3.5c2.25 0 4.25-1.2 4.25-3.6 0-1.35-.55-2.4-1.5-3.15.8-.65 1.25-1.6 1.25-2.65 0-1.8-1.25-3.35-3.25-3.35-.85 0-1.55.25-2.15.65-.6-.4-1.3-.65-2.15-.65Z" />
      <path d="M9.75 11.25h.01M14.25 11.25h.01" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="text-menta" />
    </SvgBase>
  ),
  "area-odontologia": (p) => (
    <SvgBase {...p}>
      <Trazo d="M8.25 8.25c0-2.05 1.65-3.25 3.75-3.25s3.75 1.2 3.75 3.25c0 .85-.25 1.55-.65 2.1v3.65c0 1.45-.55 2.35-1.45 2.35-.75 0-1.15-.55-1.45-1.35-.3.8-.7 1.35-1.45 1.35-.9 0-1.45-.9-1.45-2.35V10.35c-.4-.55-.65-1.25-.65-2.1Z" />
      <Trazo d="M10.25 14.25v2.25M13.75 14.25v2.25" className="opacity-55" />
    </SvgBase>
  ),
  reloj: (p) => (
    <SvgBase {...p}>
      <Trazo d="M12 5.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z" />
      <Trazo d="M12 9.25V12l2.25 1.75" />
      <circle cx="12" cy="5.5" r=".75" fill="currentColor" className="text-menta" />
    </SvgBase>
  ),
  "flecha-izq": (p) => (
    <SvgBase {...p}>
      <Trazo d="M14.5 6.25 9.5 12l5 5.75" />
      <Trazo d="M19.25 12H10" />
    </SvgBase>
  ),
};

export function IconoCercalud({ nombre, size = 24, className }: Props) {
  const Dibujo = ICONOS[nombre];
  return <Dibujo size={size} className={className} />;
}

const ICONO_AREA: Record<string, NombreIconoCercalud> = {
  cuerpo: "area-cuerpo",
  mental: "area-mental",
  odontologia: "area-odontologia",
};

export function iconoArea(id: string): NombreIconoCercalud {
  return ICONO_AREA[id] ?? "areas";
}

export const ICONO_NAV: Record<string, NombreIconoCercalud> = {
  "/buscar": "profesional",
  "/buscar?estudios=1": "estudios",
  "/farmacia": "farmacia",
  "/#como-funciona": "guia",
};