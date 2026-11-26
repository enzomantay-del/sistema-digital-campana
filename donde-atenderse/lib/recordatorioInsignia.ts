import { urlSitioPublico } from "@/lib/config";
import { enlaceWhatsApp } from "@/lib/format";
import {
  diasRestantesInsignia,
  profesionalVerificadoEnListado,
  ultimaActualizacionProfesional,
} from "@/lib/verificacion";

/** Cuántos días antes del vencimiento muestra el aviso en administración. */
export const AVISO_INSIGNIA_DIAS_ANTES = 5;

/** Incluimos fichas ya vencidas hasta esta cantidad de días (sin insignia). */
export const RECORDATORIO_DIAS_VENCIDO_MAX = 14;

export const MENSAJE_RECORDATORIO_INSIGNIA_PREFIJO =
  "Hola, te escribo desde Cercalud por la insignia de verificación de tu ficha pública.";

type AsistenciaRecordatorio = {
  professionalUpdatedAt: Date | null;
  place: { id: string; name: string; whatsapp: string; kind: string };
};

export type ContactoSecretariaInsignia = {
  placeId: string;
  lugarNombre: string;
  secretariaNombre: string;
  whatsapp: string;
};

export type FilaRecordatorioInsignia = {
  id: string;
  nombre: string;
  especialidad: string;
  diasRestantes: number;
  ultimaActualizacion: Date | null;
  verificado: boolean;
  whatsappProfesional: string;
  contactosLugar: { placeId: string; lugarNombre: string; whatsapp: string }[];
  contactosSecretaria: ContactoSecretariaInsignia[];
};

export { diasRestantesInsignia, ultimaActualizacionProfesional } from "@/lib/verificacion";

export function adminDebeRecordarInsignia(diasRestantes: number) {
  if (diasRestantes > AVISO_INSIGNIA_DIAS_ANTES) return false;
  return diasRestantes >= -RECORDATORIO_DIAS_VENCIDO_MAX;
}

function whatsappProfesional(input: {
  agendaWhatsapp: string;
  whatsapp: string;
}) {
  const agenda = input.agendaWhatsapp.trim();
  const general = input.whatsapp.trim();
  return agenda.length >= 10 ? agenda : general;
}

export function filasRecordatorioInsignia(
  personas: {
    id: string;
    fullName: string;
    specialty: string;
    updatedAt: Date;
    agendaWhatsapp: string;
    whatsapp: string;
    published: boolean;
    reviewed: boolean;
    example: boolean;
    attendances: AsistenciaRecordatorio[];
  }[],
  ahora = new Date(),
): FilaRecordatorioInsignia[] {
  const filas: FilaRecordatorioInsignia[] = [];
  for (const persona of personas) {
    if (!persona.published || !persona.reviewed || persona.example) continue;
    const ultima = ultimaActualizacionProfesional(persona);
    const diasRestantes = diasRestantesInsignia(ultima, ahora);
    if (!adminDebeRecordarInsignia(diasRestantes)) continue;
    const verificado = profesionalVerificadoEnListado({
      updatedAt: persona.updatedAt,
      attendances: persona.attendances.map((fila) => ({
        professionalUpdatedAt: fila.professionalUpdatedAt,
      })),
    });
    const vistos = new Set<string>();
    const contactosLugar: FilaRecordatorioInsignia["contactosLugar"] = [];
    for (const fila of persona.attendances) {
      const wa = fila.place.whatsapp.trim();
      if (wa.length < 10 || vistos.has(fila.place.id)) continue;
      vistos.add(fila.place.id);
      contactosLugar.push({
        placeId: fila.place.id,
        lugarNombre: fila.place.name,
        whatsapp: wa,
      });
    }
    filas.push({
      id: persona.id,
      nombre: persona.fullName,
      especialidad: persona.specialty,
      diasRestantes,
      ultimaActualizacion: ultima,
      verificado,
      whatsappProfesional: whatsappProfesional(persona),
      contactosLugar,
      contactosSecretaria: [],
    });
  }
  filas.sort((a, b) => a.diasRestantes - b.diasRestantes || a.nombre.localeCompare(b.nombre, "es"));
  return filas;
}

/** Agrega WhatsApp de cuentas secretaría asignadas a cada sede (prioridad sobre el del lugar). */
export function agregarContactosSecretaria(
  filas: FilaRecordatorioInsignia[],
  editores: {
    placeId: string;
    user: { name: string; role: string; whatsapp: string };
    place: { name: string };
  }[],
): FilaRecordatorioInsignia[] {
  const porLugar = new Map<string, ContactoSecretariaInsignia[]>();
  for (const fila of editores) {
    if (fila.user.role !== "secretaria") continue;
    const wa = fila.user.whatsapp.trim();
    if (wa.length < 10) continue;
    const item: ContactoSecretariaInsignia = {
      placeId: fila.placeId,
      lugarNombre: fila.place.name,
      secretariaNombre: fila.user.name,
      whatsapp: wa,
    };
    const lista = porLugar.get(fila.placeId) ?? [];
    if (!lista.some((otro) => otro.whatsapp === wa)) lista.push(item);
    porLugar.set(fila.placeId, lista);
  }
  return filas.map((persona) => {
    const secretarias: ContactoSecretariaInsignia[] = [];
    const vistos = new Set<string>();
    for (const sede of persona.contactosLugar) {
      for (const contacto of porLugar.get(sede.placeId) ?? []) {
        const clave = `${contacto.placeId}:${contacto.whatsapp}`;
        if (vistos.has(clave)) continue;
        vistos.add(clave);
        secretarias.push(contacto);
      }
    }
    return { ...persona, contactosSecretaria: secretarias };
  });
}

function textoVencimiento(diasRestantes: number) {
  if (diasRestantes <= 0) {
    return "ya no muestra la insignia de verificación (pasaron más de 30 días sin actualizar la ficha)";
  }
  if (diasRestantes === 1) return "pierde la insignia mañana si no actualizás";
  return `pierde la insignia en ${diasRestantes} días si no actualizás`;
}

export function mensajeRecordatorioProfesional(fila: Pick<FilaRecordatorioInsignia, "nombre" | "diasRestantes">) {
  const url = `${urlSitioPublico()}/entrar`;
  const nombre = fila.nombre.trim().split(/\s+/)[0] ?? "";
  const saludo = nombre ? `Hola, ${nombre}.` : "Hola.";
  return `${saludo} ${MENSAJE_RECORDATORIO_INSIGNIA_PREFIJO} Tu ficha ${textoVencimiento(fila.diasRestantes)}. Entrá a ${url}, revisá horarios y contacto y tocá «Confirmo que sigue vigente» (o guardá la ficha si cambiaste algo). Gracias.`;
}

export function mensajeRecordatorioSecretaria(
  fila: Pick<FilaRecordatorioInsignia, "nombre" | "diasRestantes">,
  lugarNombre: string,
  placeId: string,
) {
  const url = `${urlSitioPublico()}/panel/cargas/${placeId}`;
  const estado =
    fila.diasRestantes <= 0
      ? "ya no tiene la insignia de verificación"
      : fila.diasRestantes === 1
        ? "pierde la insignia mañana"
        : `pierde la insignia en ${fila.diasRestantes} días`;
  return `Hola, te escribo desde Cercalud. La ficha de ${fila.nombre.trim()} ${estado} en el directorio. Si los datos siguen bien, entrá a ${url}, abrí la ficha y tocá «Confirmo que sigue vigente» (o guardá si hubo cambios). Gracias.`;
}

export function enlaceRecordatorioProfesional(fila: Pick<FilaRecordatorioInsignia, "nombre" | "diasRestantes" | "whatsappProfesional">) {
  const wa = fila.whatsappProfesional.trim();
  if (wa.length < 10) return null;
  return enlaceWhatsApp(wa, mensajeRecordatorioProfesional(fila));
}

export function enlaceRecordatorioSecretaria(
  fila: Pick<FilaRecordatorioInsignia, "nombre" | "diasRestantes">,
  lugar: { lugarNombre: string; whatsapp: string; placeId: string },
) {
  const wa = lugar.whatsapp.trim();
  if (wa.length < 10) return null;
  return enlaceWhatsApp(wa, mensajeRecordatorioSecretaria(fila, lugar.lugarNombre, lugar.placeId));
}

export function enlaceRecordatorioCuentaSecretaria(
  fila: Pick<FilaRecordatorioInsignia, "nombre" | "diasRestantes">,
  contacto: ContactoSecretariaInsignia,
) {
  return enlaceRecordatorioSecretaria(fila, {
    placeId: contacto.placeId,
    lugarNombre: contacto.lugarNombre,
    whatsapp: contacto.whatsapp,
  });
}