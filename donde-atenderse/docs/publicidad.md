# Publicidad en Cercalud — formatos y ubicaciones

Referencia visual: portales de noticias — aviso **dentro del flujo**, etiqueta **Publicidad** arriba, padding mínimo.

## Formatos (`lib/formatosPublicidad.ts`)

| Variante | Medida orientativa | Uso |
|---------|-------------------|-----|
| `leaderboard` | 970×250 | Portada, pie de búsqueda |
| `banner` | 728×90 | Franja fina entre secciones |
| `mpu` | 300×250 | Columnas, bloques, listados |
| `cuadrado` | 300×300 | Variación visual en columnas |
| `skyscraper` | 300×600 | Columna lateral en fichas |
| `vertical-alto` | 300×400 | Columna e intercalado móvil |
| `contenido` | Flexible | Creatividades rich (demo) |

## Componentes

- **`TarjetaPublicidad`**: marco + rótulo. Prop `compacto` para menos aire.
- **`EspacioPublicitario`**: hueco a la venta con silueta del formato y mail de contacto.
- **`PublicidadPortada`**: leaderboard (ejemplo en demo, hueco en producción).
- **`ColumnaPublicidad`**: perfil `ficha` (3 formatos) o `listado` (2 formatos).
- **`intercalarPublicidadEnListado`**: cada 4 resultados en `/buscar`.

## Dónde hay espacios hoy

| Página | Ubicaciones |
|--------|-------------|
| **Inicio** | Leaderboard bajo buscador; banner antes de beneficios; MPU + cuadrado antes del FAQ |
| **Buscar** | Banner bajo filtros; inserciones en listas; columna XL; vertical en móvil; leaderboard al cierre |
| **Ficha** prof./lugar | Columna sticky: skyscraper + vertical + MPU (prod) |
| **Farmacia** | Banner superior; MPU + cuadrado al pie |

## Ejemplo vs producción

| `CERCALUD_MOSTRAR_EJEMPLOS` | Comportamiento |
|---------------------------|----------------|
| activo | Creatividades Farma-Tu, farmacia y Ortiz donde corresponde + algunos huecos |
| desactivado (real) | Todos los huecos = `EspacioPublicitario` |

## Contratar espacio

1. Enviar creatividad en el tamaño de la variante.
2. Reemplazar el `EspacioPublicitario` del slot (o futuro panel admin).
3. Publicar.

Contacto: `contacto@cercalud.com.ar` — asunto: *Publicidad en Cercalud*.