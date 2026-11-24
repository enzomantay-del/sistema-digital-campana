"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Consulta =
  | { estado: "incompleta" | "libre" }
  | {
      estado: "existe";
      id: string;
      fullName: string;
      tieneCuenta: boolean;
      publicada: boolean;
    };

export function AvisoMatriculaEditor({
  matricula,
  professionalId,
}: {
  matricula: string;
  professionalId: string;
}) {
  const [consulta, setConsulta] = useState<Consulta | null>(null);

  useEffect(() => {
    const texto = matricula.trim();
    if (texto.length < 3) {
      setConsulta({ estado: "incompleta" });
      return;
    }
    const control = new AbortController();
    const timer = setTimeout(() => {
      void fetch(
        `/api/profesional/consultar-matricula?license=${encodeURIComponent(texto)}&excluir=${encodeURIComponent(professionalId)}`,
        { credentials: "same-origin", signal: control.signal },
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) setConsulta(data as Consulta);
        })
        .catch(() => {});
    }, 450);
    return () => {
      clearTimeout(timer);
      control.abort();
    };
  }, [matricula, professionalId]);

  if (!consulta || consulta.estado !== "existe") return null;
  const existente = consulta;

  return (
    <div className="grid gap-2 rounded-2xl border border-warn/40 bg-[#fff8ed] px-4 py-3 text-sm">
      <p className="font-semibold text-ink">
        Ya existe en Cercalud la ficha de <strong>{existente.fullName}</strong> con la matrícula {matricula.trim()}.
        {existente.tieneCuenta
          ? " Está vinculada a otra cuenta: no cargues otra ficha."
          : " Si la cargó la secretaría de tu consultorio, no dupliques datos."}
      </p>
      <p className="text-muted">
        Para usar <strong>esa</strong> ficha con tu cuenta, pedile a la administración de Cercalud que vincule tu correo de
        ingreso. Mientras tanto podés{" "}
        <Link href="/contacto" className="font-semibold text-link">
          escribirnos por contacto
        </Link>
        .
      </p>
    </div>
  );
}