export const DIAS_DATOS_FRESCOS = 30;

export function datosActualizadosRecientes(valor: Date | null | undefined, ahora = new Date()) {
  if (!valor) return false;
  const limite = DIAS_DATOS_FRESCOS * 24 * 60 * 60 * 1000;
  return ahora.getTime() - valor.getTime() <= limite;
}

export function profesionalVerificadoEnListado(input: {
  updatedAt: Date;
  attendances: { professionalUpdatedAt: Date | null }[];
}) {
  return datosActualizadosRecientes(
    fechaMasReciente(input.updatedAt, ...input.attendances.map((fila) => fila.professionalUpdatedAt)),
  );
}

export function lugarVerificadoEnListado(input: {
  updatedAt: Date;
  attendances?: { placeUpdatedAt: Date | null }[];
}) {
  return datosActualizadosRecientes(
    fechaMasReciente(input.updatedAt, ...(input.attendances?.map((fila) => fila.placeUpdatedAt) ?? [])),
  );
}

export function fechaMasReciente(...valores: (Date | null | undefined)[]) {
  let mejor: Date | null = null;
  for (const valor of valores) {
    if (!valor) continue;
    if (!mejor || valor > mejor) mejor = valor;
  }
  return mejor;
}

export function ultimaActualizacionProfesional(input: {
  updatedAt: Date;
  attendances: { professionalUpdatedAt: Date | null }[];
}) {
  return fechaMasReciente(input.updatedAt, ...input.attendances.map((fila) => fila.professionalUpdatedAt));
}

export function diasRestantesInsignia(ultima: Date | null | undefined, ahora = new Date()) {
  if (!ultima) return -DIAS_DATOS_FRESCOS;
  const transcurridoMs = ahora.getTime() - ultima.getTime();
  const transcurridoDias = transcurridoMs / (24 * 60 * 60 * 1000);
  return Math.ceil(DIAS_DATOS_FRESCOS - transcurridoDias);
}