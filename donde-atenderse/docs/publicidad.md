# Publicidad en Cercalud — formatos y ubicaciones

Referencia visual: portales de noticias — aviso **dentro del flujo**, etiqueta **Publicidad** arriba, padding mínimo.

## Regla de experiencia

**Como máximo 2 avisos por página** (creatividad real, hueco a la venta o ejemplo). Sin intercalados en listados ni columnas con tres formatos apilados.

## Formatos (`lib/formatosPublicidad.ts`)

| Variante | Medida orientativa | Uso habitual |
|---------|-------------------|--------------|
| `leaderboard` | 970×250 | Portada (bajo el buscador) |
| `banner` | 728×90 | Búsqueda, farmacia |
| `mpu` | 300×250 | Segundo slot en portada / móvil |
| `cuadrado` | 300×300 | Reserva para campañas puntuales |
| `skyscraper` | 300×600 | Columna en búsqueda (XL) y fichas |
| `vertical-alto` | 300×400 | Reserva |
| `contenido` | Flexible | Creatividades rich (demo) |

## Componentes

- **`TarjetaPublicidad`**: marco + rótulo. Prop `compacto` para menos aire.
- **`EspacioPublicitario`**: hueco a la venta con silueta del formato y mail de contacto.
- **`PublicidadPortada`**: leaderboard en inicio (ejemplo en demo, hueco en producción).
- **`ColumnaPublicidad`**: un solo slot en producción (skyscraper); en demo de ficha, hasta dos ejemplos.

## Dos avisos por página (implementación actual)

| Página | Aviso 1 | Aviso 2 |
|--------|---------|---------|
| **Inicio** | Leaderboard bajo el buscador | Banner ancho antes del FAQ |
| **Buscar** | Banner bajo filtros | Skyscraper en columna (XL) **o** MPU al pie en móvil |
| **Ficha** prof./lugar | Skyscraper en columna (producción) | — (solo uno) |
| **Ficha** (demo) | Ejemplo farmacia | Ejemplo profesional |
| **Farmacia** | Banner a todo el ancho bajo título | Skyscraper (300×600) en columna XL **o** leaderboard ancho al pie en móvil |

## Ejemplo vs producción

| `CERCALUD_MOSTRAR_EJEMPLOS` | Comportamiento |
|---------------------------|----------------|
| activo | Creatividades de muestra donde corresponda, respetando el tope de 2 por página |
| desactivado (real) | Huecos `EspacioPublicitario` en esos mismos lugares |

## Creatividades en video (`public/patrocinios/`)

| Archivo | Slot actual |
|---------|-------------|
| `leaderboard-970x250.mp4` | Inicio (bajo buscador) |
| `banner-728x90.mp4` | Búsqueda y farmacia (banda superior) |
| `vertical-300x400.mp4` | Columna en fichas de profesional/lugar |

En cada página pública queda al menos un `EspacioPublicitario` vacío para mostrar disponibilidad comercial.

## Contratar espacio

1. Enviar creatividad en el tamaño de la variante (MP4, JPG o PNG).
2. Reemplazar ruta en `lib/patrocinios.ts` o el `EspacioPublicitario` del slot.
3. Publicar.

Contacto: `contacto@cercalud.com.ar` — asunto: *Publicidad en Cercalud*.