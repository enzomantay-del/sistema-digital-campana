"use client";

import { useState } from "react";

export function CampoContrasena({
  name = "password",
  autoComplete = "current-password",
  label = "Contraseña",
  minLength,
}: {
  name?: string;
  autoComplete?: "current-password" | "new-password";
  label?: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="grid gap-1">
      {label}
      <span className="relative block">
        <input
          name={name}
          type={visible ? "text" : "password"}
          className="campo pr-11"
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6A2 2 0 0 0 12 15a2 2 0 0 0 1.4-3.4" />
              <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c7 0 10 8 10 8a18.6 18.6 0 0 1-4.8 6.2M6.6 6.6A18.8 18.8 0 0 0 2 12s3 8 10 8a10.2 10.2 0 0 0 4.9-1.2" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </span>
    </label>
  );
}