"use client";

import { useRef } from "react";
import { crearContacto } from "./actions";

export function FormNuevoContacto() {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (fd) => {
        const r = await crearContacto(fd);
        if (r.ok) ref.current?.reset();
      }}
      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-panel sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h3 className="font-bold text-campana-azul">Alta rápida</h3>
        <p className="text-xs text-slate-500">Un vecino o referente a la vez.</p>
      </div>
      <label className="block text-sm">
        <span className="text-slate-600">Nombre</span>
        <input
          name="nombre"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-campana-azul-claro focus:ring-2"
          placeholder="Ej. Ana Martínez"
        />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Teléfono</span>
        <input
          name="telefono"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-campana-azul-claro focus:ring-2"
          placeholder="11… o +549…"
        />
      </label>
      <label className="block text-sm">
        <span className="text-slate-600">Barrio</span>
        <input
          name="barrio"
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-campana-azul-claro focus:ring-2"
          placeholder="Ej. Centro"
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="text-slate-600">Notas (opcional)</span>
        <input
          name="notas"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-campana-azul-claro focus:ring-2"
          placeholder="Referente, timbreo, etc."
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-xl bg-campana-rojo px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95"
        >
          Guardar contacto
        </button>
      </div>
    </form>
  );
}
