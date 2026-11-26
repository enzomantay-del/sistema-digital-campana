"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmarVigenciaEnLugar, confirmarVigenciaProfesional } from "@/actions/confirmarInsignia";
import { InsigniaVerificacion } from "@/components/InsigniaVerificacion";
import { AVISO_PANEL_INSIGNIA_DIAS } from "@/lib/estadoInsigniaPanel";

type Props = {
  modo: "profesional" | "secretaria";
  diasRestantes: number;
  verificado: boolean;
  nombreProfesional?: string;
  lugarNombre?: string;
  professionalId?: string;
  placeId?: string;
};

function textoVencimiento(diasRestantes: number, verificado: boolean) {
  if (!verificado) {
    return "Tu ficha pública no muestra la insignia de verificación (más de 30 días sin actualizar).";
  }
  if (diasRestantes <= 0) return "La insignia ya no se muestra en la web.";
  if (diasRestantes === 1) return "La insignia vence mañana si no confirmás.";
  if (diasRestantes <= AVISO_PANEL_INSIGNIA_DIAS) {
    return `La insignia vence en ${diasRestantes} días si no confirmás que los datos siguen vigentes.`;
  }
  return "";
}

export function ConfirmarInsigniaBanner({
  modo,
  diasRestantes,
  verificado,
  nombreProfesional,
  lugarNombre,
  professionalId,
  placeId,
}: Props) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const texto =
    modo === "secretaria" && nombreProfesional
      ? verificado
        ? `Insignia de ${nombreProfesional}${lugarNombre ? ` en ${lugarNombre}` : ""}: ${diasRestantes <= 0 ? "vencida" : diasRestantes === 1 ? "vence mañana" : `vence en ${diasRestantes} días`}.`
        : `${nombreProfesional} no tiene insignia en la web. Confirmá el horario si sigue vigente.`
      : textoVencimiento(diasRestantes, verificado);

  function confirmar() {
    setError(null);
    setMensaje(null);
    startTransition(async () => {
      const resultado =
        modo === "profesional"
          ? await confirmarVigenciaProfesional()
          : professionalId && placeId
            ? await confirmarVigenciaEnLugar(professionalId, placeId)
            : { ok: false as const, error: "Faltan datos." };
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setMensaje("Listo. Renovamos la insignia por 30 días en la ficha pública.");
      router.refresh();
    });
  }

  return (
    <div className="mb-4 flex flex-wrap items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm">
      <InsigniaVerificacion activa={verificado} compacta />
      <div className="min-w-0 flex-1 grid gap-2">
        <p className="font-semibold text-ink">Insignia de verificación</p>
        <p className="text-muted">{texto}</p>
        <p className="text-xs text-muted">
          Si algo cambió (horario, WhatsApp, obras sociales), editá la ficha y guardá. Si está todo bien, confirmá en un
          toque.
        </p>
        {mensaje ? <p className="text-sm font-semibold text-menta">{mensaje}</p> : null}
        {error ? <p className="text-sm text-warn">{error}</p> : null}
      </div>
      <button type="button" className="boton shrink-0" disabled={pendiente} onClick={confirmar}>
        {pendiente ? "Guardando…" : "Confirmo que sigue vigente"}
      </button>
    </div>
  );
}