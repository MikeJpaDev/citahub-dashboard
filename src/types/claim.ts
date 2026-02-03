export interface Claim {
  id: number;
  nombre_titular: string;
  hora_franja: string;
  servicio: string;
  email: string;
  telefono: string;
  calendar_event_id: string;
  chat_id: string;
  fecha_cita: string;
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
