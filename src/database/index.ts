import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync("control_paciente.db");

    // Crear tabla pacientes
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        fecha_creacion TEXT NOT NULL
      );
    `);

    // Crear tabla registros
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        valor TEXT NULL,
        sistolica INTEGER NULL,
        diastolica INTEGER NULL,
        fecha_hora TEXT NOT NULL,
        fecha_creacion TEXT NOT NULL,
        FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE CASCADE
      );
    `);

    // Crear tabla recordatorios
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recordatorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        hora TEXT NOT NULL,
        activo INTEGER DEFAULT 1,
        FOREIGN KEY (paciente_id) REFERENCES pacientes (id) ON DELETE CASCADE
      );
    `);

    console.log("✅ Base de datos inicializada correctamente");
    return db;
  } catch (error) {
    console.error("❌ Error al inicializar la base de datos:", error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error(
      "Base de datos no inicializada. Llama a initDatabase() primero.",
    );
  }
  return db;
};
