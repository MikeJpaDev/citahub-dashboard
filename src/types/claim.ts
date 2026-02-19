export interface Claim {
  id: number;
  nombre_titular: string;
  hora_franja: string;
  servicio: string;
  email: string;
  telefono: number | string;
  calendar_event_id: string;
  chat_id: number | string;
  fecha_cita: string;
  Numero_Cita: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  description: string;
  createdAt: string;
}
