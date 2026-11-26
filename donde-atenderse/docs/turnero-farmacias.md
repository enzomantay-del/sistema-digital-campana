# Turnero de farmacias

Las **farmacias** se publican como lugares (`kind: farmacia`). Los **turnos** los carga Cercalud desde la planilla, no en la ficha del lugar.

## Formato de importación

En **Administración → Turnero de farmacias**, CSV o TXT con separador `;`, coma o tab:

```
localidad; nombre de farmacia; inicio; fin; fuente
Jardín América; Farmacia Libertad; 22/11/2025 08:00; 23/11/2025 08:00; Turnero municipal
```

- **Inicio / fin:** con hora (`22/11/2025 08:00`, `2025-11-22 08:00` o ISO con zona).
- El nombre debe coincidir con una farmacia **ya publicada** en esa localidad.
- En **Farmacia de turno** solo se muestra la farmacia mientras `ahora` está entre inicio y fin (hora de Misiones, habitualmente **08:00 a 08:00** del día siguiente).

## Jardín América — noviembre 2026

Planilla oficial en `data/turnero-jardin-america-2026-11.txt` (30 turnos). Nombres del calendario y cómo deben figurar en Cercalud (el importador hace coincidencia flexible):

| Turnero (calendario) | Nombre sugerido en la ficha |
|----------------------|-----------------------------|
| SAN MATTEO | Farmacia San Matteo |
| ARGUS II | Farmacia Argus II |
| ALMEYER | Farmacia Almeyer |
| SAN BENITO | Farmacia San Benito |
| JARDIN | Farmacia Jardín |
| LIBERTAD | Farmacia Libertad |
| SOLEMAR | Farmacia Solemar |

**Cómo cargarlo:** Administración → **Turnero de farmacias** → pegá el contenido del archivo → Importar. Si alguna fila figura en “sin coincidencia”, revisá que el nombre de la ficha contenga la palabra del turnero (ej. “Libertad” dentro de “Farmacia Libertad”). No importes dos veces el mismo mes sin borrar turnos viejos (hoy cada importación **suma** filas).