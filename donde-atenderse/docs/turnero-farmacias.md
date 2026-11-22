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
- En **Farmacia de turno** solo se muestra la farmacia mientras `ahora` está entre inicio y fin (hora de Misiones).