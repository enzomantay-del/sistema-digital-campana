export type HorarioBorrador = {
  key: string;
  id?: string;
  placeId?: string;
  placeName: string;
  locality: string;
  address: string;
  kind: string;
  ownsPlace: boolean;
  sugerido: boolean;
  publicado: boolean;
  days: string[];
  shift: string;
  time: string;
  placeDays: string[];
  placeShift: string;
  placeTime: string;
  placeUpdatedAt: string | null;
};

export type BorradorProfesional = {
  fullName: string;
  license: string;
  area: string;
  specialty: string;
  whatsapp: string;
  phone: string;
  price: string;
  obras: string[];
  otraObra: string;
  horarios: HorarioBorrador[];
};

export type HorarioLugarBorrador = {
  key: string;
  id?: string;
  professionalId?: string;
  professionalName: string;
  specialty: string;
  area: string;
  license: string;
  days: string[];
  shift: string;
  time: string;
  professionalDays: string[];
  professionalShift: string;
  professionalTime: string;
  professionalUpdatedAt: string | null;
};

export type EstudioBorrador = {
  key: string;
  id?: string;
  name: string;
  preparation: string;
  attention: string;
};

export type BorradorLugar = {
  name: string;
  kind: string;
  locality: string;
  address: string;
  whatsapp: string;
  phone: string;
  scheduleNote: string;
  obras: string[];
  otraObra: string;
  studies: EstudioBorrador[];
  horarios: HorarioLugarBorrador[];
  dutyStart: string;
  dutyEnd: string;
  dutySource: string;
};
