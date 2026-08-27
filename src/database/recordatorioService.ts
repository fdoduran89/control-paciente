import { getDatabase } from "./index";
import { Recordatorio, RegistroTipo } from "../models/types";

// Tipos para recordatorios
export interface RecordatorioDB extends Recordatorio {
  id: number;
  paciente_id: number;
  tipo: RegistroTipo;
  hora: string; // Formato HH:MM
  activo: number; // 1 o 0
}

// Crear un recordatorio
export const crearRecordatorio = async (
  pacienteId: number,
  tipo: RegistroTipo,
  hora: string,
): Promise<number> => {
  const db = getDatabase();

  // Validar formato de hora (HH:MM)
  if (!/^\d{2}:\d{2}$/.test(hora)) {
    throw new Error("Formato de hora inválido. Use HH:MM");
  }

  const result = await db.runAsync(
    "INSERT INTO recordatorios (paciente_id, tipo, hora, activo) VALUES (?, ?, ?, 1)",
    pacienteId,
    tipo,
    hora,
  );

  return result.lastInsertRowId;
};

// Obtener todos los recordatorios de un paciente
export const obtenerRecordatorios = async (
  pacienteId: number,
): Promise<RecordatorioDB[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<RecordatorioDB>(
    "SELECT * FROM recordatorios WHERE paciente_id = ? ORDER BY hora ASC",
    pacienteId,
  );
  return result;
};

// Obtener recordatorios por tipo
export const obtenerRecordatoriosPorTipo = async (
  pacienteId: number,
  tipo: RegistroTipo,
): Promise<RecordatorioDB[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<RecordatorioDB>(
    "SELECT * FROM recordatorios WHERE paciente_id = ? AND tipo = ? ORDER BY hora ASC",
    pacienteId,
    tipo,
  );
  return result;
};

// Actualizar estado de un recordatorio (activar/desactivar)
export const actualizarEstadoRecordatorio = async (
  id: number,
  activo: boolean,
): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    "UPDATE recordatorios SET activo = ? WHERE id = ?",
    activo ? 1 : 0,
    id,
  );
};

// Eliminar un recordatorio
export const eliminarRecordatorio = async (id: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync("DELETE FROM recordatorios WHERE id = ?", id);
};

// Actualizar hora de un recordatorio
export const actualizarHoraRecordatorio = async (
  id: number,
  hora: string,
): Promise<void> => {
  const db = getDatabase();

  if (!/^\d{2}:\d{2}$/.test(hora)) {
    throw new Error("Formato de hora inválido. Use HH:MM");
  }

  await db.runAsync("UPDATE recordatorios SET hora = ? WHERE id = ?", hora, id);
};

// Verificar si un registro ya fue realizado para un tipo y fecha específicos
export const verificarRegistroRealizado = async (
  pacienteId: number,
  tipo: RegistroTipo,
  fecha: string, // Formato YYYY-MM-DD (en zona horaria Bogotá)
): Promise<boolean> => {
  const db = getDatabase();

  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM registros 
     WHERE paciente_id = ? 
     AND tipo = ? 
     AND DATE(fecha_hora) = DATE(?)`,
    pacienteId,
    tipo,
    fecha,
  );

  return (result?.count || 0) > 0;
};

// Verificar si un recordatorio debe generar notificación
export const debeNotificar = async (
  pacienteId: number,
  tipo: RegistroTipo,
  fecha: string,
): Promise<boolean> => {
  const yaRealizado = await verificarRegistroRealizado(pacienteId, tipo, fecha);
  return !yaRealizado;
};

// Obtener recordatorios activos para hoy
export const obtenerRecordatoriosActivosHoy = async (
  pacienteId: number,
): Promise<RecordatorioDB[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<RecordatorioDB>(
    "SELECT * FROM recordatorios WHERE paciente_id = ? AND activo = 1 ORDER BY hora ASC",
    pacienteId,
  );
  return result;
};

// Inicializar recordatorios por defecto (para prueba)
export const inicializarRecordatoriosDefault = async (
  pacienteId: number,
): Promise<void> => {
  const existentes = await obtenerRecordatorios(pacienteId);

  if (existentes.length === 0) {
    // Crear recordatorios por defecto
    const defaults = [
      { tipo: "GLUCOMETRIA", hora: "08:00" },
      { tipo: "TENSION_ARTERIAL", hora: "12:00" },
      { tipo: "INSULINA", hora: "20:00" },
    ];

    for (const def of defaults) {
      await crearRecordatorio(pacienteId, def.tipo as RegistroTipo, def.hora);
    }

    console.log("✅ Recordatorios por defecto creados");
  }
};
