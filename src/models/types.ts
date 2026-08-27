// Tipos para los registros
export type RegistroTipo = "GLUCOMETRIA" | "TENSION_ARTERIAL" | "INSULINA";

export interface Paciente {
  id: number;
  nombre: string;
  fecha_creacion: string;
}

export interface Registro {
  id: number;
  paciente_id: number;
  tipo: RegistroTipo;
  valor: string | null;
  sistolica: number | null;
  diastolica: number | null;
  fecha_hora: string;
  fecha_creacion: string;
}

export interface Recordatorio {
  id: number;
  paciente_id: number;
  tipo: RegistroTipo;
  hora: string; // Formato HH:MM
  activo: number; // 1 o 0
}
