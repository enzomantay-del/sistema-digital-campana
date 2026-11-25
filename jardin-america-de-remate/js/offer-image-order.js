/**
 * Criterio para la primera imagen en la card pública (bloque ~100% × 280px, object-fit: contain):
 * priorizamos fotos con proporción cercana a ~1,45:1 (paisaje amplio, similar al recuadro horizontal
 * de la card), y en empate mayor ancho en píxeles y ratio ancho/alto (más “anchas”).
 * Así la portada suele ocupar mejor el marco sin bandas gigantes arriba/abajo.
 */
(function (global) {
  const TARGET_AR = 1.45;

  function offerImageHeroSortKey(width, height) {
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    if (w < 1 || h < 1) return -1e9;
    const r = w / h;
    const fit = 1 / (1 + Math.abs(Math.log(r / TARGET_AR)));
    return fit * 1000 + Math.log(w + 1) * 80 + r * 25;
  }

  global.offerImageHeroSortKey = offerImageHeroSortKey;
})(typeof window !== "undefined" ? window : globalThis);
