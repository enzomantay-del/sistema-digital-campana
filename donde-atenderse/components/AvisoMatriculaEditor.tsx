"use client";

import { useEffect, useState } from "react";
import { vincularFichaPorMatricula } from "@/actions/vincularProfesional";

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
  onVinculado,
}: {
  matricula: string;
  professionalId: string;
  onVinculado?: () => void;
}) {
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [vinculando, setVinculando] = useState(false);
  const [mensaje, setMensaje] = useState("");

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

  async function vincular() {
    setVinculando(true);
    setMensaje("");
    const resultado = await vincularFichaPorMatricula(matricula);
    setVinculando(false);
    if (!resultado.ok) {
      setMensaje(resultado.error);
      return;
    }
    setMensaje("Ficha vinculada. Recargamos la página con tus datos.");
    onVinculado?.();
    window.location.assign("/panel/profesional");
  }

  return (
    <div className="grid gap-2 rounded-2xl border border-warn/40 bg-[#fff8ed] px-4 py-3 text-sm">
      <p className="font-semibold text-ink">
        Ya existe en Cercalud la ficha de <strong>{existente.fullName}</strong> con la matrícula {matricula.trim()}.
        {existente.tieneCuenta
          ? " Está vinculada a otra cuenta: no crees una ficha nueva."
          : " Si sos vos, vinculá esta cuenta a esa ficha."}
      </p>
      {!existente.tieneCuenta ? (
        <button
          type="button"
          className="boton-suave w-fit text-sm font-semibold"
          disabled={vinculando}
          onClick={() => void vincular()}
        >
          {vinculando ? "Vinculando…" : "Soy esa persona · vincular mi cuenta"}
        </button>
      ) : (
        <p className="text-muted">
          Si la creó la secretaría de tu consultorio, pediles que editen la existente. Para recuperar acceso usá Contacto.
        </p>
      )}
      {mensaje ? <p className="text-muted">{mensaje}</p> : null}
    </div>
  );
}