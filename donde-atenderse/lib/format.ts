import { AREAS, DIAS, TIPOS_LUGAR, TURNOS } from "./constants";

export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function incluye(texto: string, consulta: string) {
  if (!consulta.trim()) return true;
  return normalizar(texto).includes(normalizar(consulta));
}

export function fecha(date: Date | string | null | undefined) {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(value);
}

export function textoDias(ids: string[]) {
  const orden = DIAS.map((dia) => dia.id);
  const elegidos = orden.filter((id) => ids.includes(id));
  if (elegidos.length === 0) return "";
  if (elegidos.join(",") === "lun,mar,mie,jue,vie") return "lunes a viernes";
  if (elegidos.join(",") === "lun,mar,mie,jue,vie,sab,dom") return "todos los días";
  const labels = elegidos.map((id) => DIAS.find((dia) => dia.id === id)?.label ?? id);
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
}

export function diasDesdeTexto(texto: string) {
  return texto.split(",").map((parte) => parte.trim()).filter(Boolean);
}

export function etiquetaArea(id: string) {
  return AREAS.find((area) => area.id === id)?.label ?? "Salud del cuerpo";
}

export function etiquetaLugar(id: string) {
  return TIPOS_LUGAR.find((tipo) => tipo.id === id)?.label ?? "Lugar";
}

export function etiquetaTurno(id: string) {
  return TURNOS.find((turno) => turno.id === id)?.label ?? "";
}

export function detalleHorario(days: string, time: string) {
  return [textoDias(diasDesdeTexto(days)), time.trim()].filter(Boolean).join(" · ");
}

export function notaHorarioLugar(days: string[], shift: string, time: string) {
  const detalle = detalleHorario(days.join(","), time);
  if (shift === "guardia") {
    return [detalle, "Guardia"].filter(Boolean).join(" · ");
  }
  const turno = etiquetaTurno(shift);
  if (!detalle) return shift === "manana" ? "" : turno;
  if (shift === "manana" || !turno) return detalle;
  return `${detalle} · ${turno}`;
}

export function textoPrecio(price: string) {
  const limpio = price.trim();
  if (!limpio) return "";
  if (/^\d+$/.test(limpio)) {
    return `$ ${Number(limpio).toLocaleString("es-AR")}`;
  }
  return limpio;
}

export function enlaceWhatsApp(phone: string, message: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!digits.startsWith("54")) digits = `54${digits}`;
  if (digits.startsWith("54") && !digits.startsWith("549")) digits = `549${digits.slice(2)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function fechaInput(date: Date | string | null | undefined) {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
  return partes;
}
