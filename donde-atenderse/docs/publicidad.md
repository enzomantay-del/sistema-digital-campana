# Publicidad en Cercalud — estilo y ubicaciones

Referencia de presentación: portales de noticias como [La Nación](https://www.lanacion.com.ar/) — el aviso va **dentro del flujo** de la página, con una etiqueta discreta arriba, sin confundirse con el contenido editorial.

## Reglas siempre

- Todo aviso comercial lleva la etiqueta **Publicidad** (o **Publicidad · ejemplo** mientras sea material de muestra).
- Los avisos **no cambian** el orden de resultados de búsqueda ni parecen fichas de profesionales.
- Creatividad del anunciante; Cercalud no inventa ofertas en nombre de terceros sin contrato.

## Ubicaciones (como La Nación, adaptado a salud)

| Formato | Dónde | Medida orientativa | Estado hoy |
|--------|--------|-------------------|------------|
| **Leaderboard** (banda horizontal) | Portada, debajo del buscador y antes de “Por qué buscar” | ~970×250 px (responsive; ancho máx. del contenido) | Imagen ejemplo Farma-Tu, sin enlace |
| **Skyscraper** (columna) | Costado en fichas de lugar y profesional (columna sticky) | ~300×600 px (en celular ocupa ancho completo) | Ejemplo farmacia + profesional en modo demo; en producción real = “Espacio comercial” |
| **Barra inferior fija** | Pegada abajo, con botón cerrar (×) | Banda fina a lo ancho | **No implementada** — opcional en una fase posterior |

## Estilo visual (código)

Componente único: `TarjetaPublicidad` con variantes:

- `leaderboard` — banda ancha, centrada (`max-w-[970px]`).
- `skyscraper` — columna ~300 px.
- Etiqueta arriba en gris, mayúsculas pequeñas (estilo portal).
- Marco claro (`border` suave, fondo `#f8fafc`), sin sombra fuerte.

## Ejemplo vs real

| Situación | Qué ve el usuario |
|-----------|-------------------|
| Creatividad de prueba (Farma-Tu, carteles demo) | **Publicidad · ejemplo** |
| Espacio vacío a la venta | **Publicidad** + texto “Espacio comercial” y mail de contacto |
| Anunciante contratado | **Publicidad** + imagen o HTML acordado (link opcional según contrato) |

## Pasar de ejemplo a anuncio real

1. Recibir archivo (JPG/PNG/WebP) en las medidas de la tabla.
2. Subir a `public/patrocinios/` (o similar) y cambiar el componente de ese espacio **o** (futuro) cargarlo desde administración.
3. Quitar `ejemplo` en `TarjetaPublicidad`.
4. Republicar la app en Cursor.

## Venta

Contacto: `contacto@cercalud.com.ar` (subject sugerido: *Publicidad en Cercalud*). Ver también `/contacto` y `/terminos`.