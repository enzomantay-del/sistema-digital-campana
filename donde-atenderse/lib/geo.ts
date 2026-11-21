import { LOCALIDADES } from "./constants";

export const PUEBLOS: { nombre: (typeof LOCALIDADES)[number]; lat: number; lng: number }[] = [
  { nombre: "Santo Pipó", lat: -27.1400034, lng: -55.4087254 },
  { nombre: "Hipólito Yrigoyen", lat: -27.0911185, lng: -55.2858959 },
  { nombre: "Jardín América", lat: -27.0432, lng: -55.2271 },
  { nombre: "Ruiz de Montoya", lat: -26.969406, lng: -55.0556386 },
  { nombre: "Capioví", lat: -26.9282667, lng: -55.0573222 },
  { nombre: "Puerto Rico", lat: -26.8101, lng: -55.0252 },
];

export function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const tierra = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * tierra * Math.asin(Math.sqrt(a));
}

export function distanciaALocalidad(localidad: string, lat: number, lng: number) {
  const pueblo = PUEBLOS.find((item) => item.nombre === localidad);
  if (!pueblo) return Number.POSITIVE_INFINITY;
  return distanciaKm(lat, lng, pueblo.lat, pueblo.lng);
}

export function puebloMasCercano(lat: number, lng: number) {
  return PUEBLOS.map((pueblo) => ({
    nombre: pueblo.nombre,
    km: distanciaKm(lat, lng, pueblo.lat, pueblo.lng),
  })).sort((a, b) => a.km - b.km)[0];
}
