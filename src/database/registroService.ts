import { getDatabase } from "./index";
import { Registro, RegistroTipo } from "../models/types";

interface CrearRegistroParams {
  paciente_id: number;
  tipo: RegistroTipo;
  valor?: string | null;
  sistolica?: number | null;
  diastolica?: number | null;
  fecha_hora: string;
}

export const crearRegistro = async (
  params: CrearRegistroParams,
): Promise<number> => {
  const db = getDatabase();
  const fechaCreacion = new Date().toISOString();

  const result = await db.runAsync(
    `INSERT INTO registros 
     (paciente_id, tipo, valor, sistolica, diastolica, fecha_hora, fecha_creacion) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    params.paciente_id,
    params.tipo,
    params.valor || null,
    params.sistolica || null,
    params.diastolica || null,
    params.fecha_hora,
    fechaCreacion,
  );

  return result.lastInsertRowId;
};

export const obtenerRegistros = async (
  pacienteId?: number,
): Promise<Registro[]> => {
  const db = getDatabase();
  let query = "SELECT * FROM registros";
  const params: any[] = [];

  if (pacienteId) {
    query += " WHERE paciente_id = ?";
    params.push(pacienteId);
  }

  query += " ORDER BY fecha_hora DESC";

  const result = await db.getAllAsync<Registro>(query, ...params);
  return result;
};

export const obtenerRegistrosPorTipo = async (
  tipo: RegistroTipo,
  pacienteId?: number,
): Promise<Registro[]> => {
  const db = getDatabase();
  let query = "SELECT * FROM registros WHERE tipo = ?";
  const params: any[] = [tipo];

  if (pacienteId) {
    query += " AND paciente_id = ?";
    params.push(pacienteId);
  }

  query += " ORDER BY fecha_hora DESC";

  const result = await db.getAllAsync<Registro>(query, ...params);
  return result;
};

export const contarRegistros = async (pacienteId?: number): Promise<number> => {
  const db = getDatabase();
  let query = "SELECT COUNT(*) as count FROM registros";
  const params: any[] = [];

  if (pacienteId) {
    query += " WHERE paciente_id = ?";
    params.push(pacienteId);
  }

  const result = await db.getFirstAsync<{ count: number }>(query, ...params);
  return result?.count || 0;
};
