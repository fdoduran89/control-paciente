import { getDatabase } from "./index";
import { Paciente } from "../models/types";

export const crearPaciente = async (nombre: string): Promise<number> => {
  const db = getDatabase();
  const fechaCreacion = new Date().toISOString();

  const result = await db.runAsync(
    "INSERT INTO pacientes (nombre, fecha_creacion) VALUES (?, ?)",
    nombre,
    fechaCreacion,
  );

  return result.lastInsertRowId;
};

export const obtenerPacientes = async (): Promise<Paciente[]> => {
  const db = getDatabase();
  const result = await db.getAllAsync<Paciente>(
    "SELECT * FROM pacientes ORDER BY id DESC",
  );
  return result;
};

export const obtenerPacientePorId = async (
  id: number,
): Promise<Paciente | null> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<Paciente>(
    "SELECT * FROM pacientes WHERE id = ?",
    id,
  );
  return result || null;
};

export const obtenerPrimerPaciente = async (): Promise<Paciente | null> => {
  const db = getDatabase();
  const result = await db.getFirstAsync<Paciente>(
    "SELECT * FROM pacientes ORDER BY id LIMIT 1",
  );
  return result || null;
};
