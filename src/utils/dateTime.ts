import { DateTime } from 'luxon';

// Zona horaria de Bogotá, Colombia (GMT-5)
const ZONA_BOGOTA = 'America/Bogota';

/**
 * Obtiene la fecha y hora actual en la zona horaria de Bogotá
 * @returns Objeto DateTime de Luxon con la hora actual en Bogotá
 */
export const getCurrentBogotaDateTime = (): DateTime => {
  return DateTime.now().setZone(ZONA_BOGOTA);
};

/**
 * Obtiene la fecha actual en formato DD/MM/YYYY
 * @param fecha - Fecha en formato ISO (opcional, si no se proporciona usa la actual)
 * @returns Fecha formateada como DD/MM/YYYY
 */
export const formatFecha = (fecha?: string): string => {
  const dt = fecha 
    ? DateTime.fromISO(fecha, { zone: 'utc' }).setZone(ZONA_BOGOTA)
    : DateTime.now().setZone(ZONA_BOGOTA);
  return dt.toFormat('dd/MM/yyyy');
};

/**
 * Obtiene la hora actual en formato HH:MM
 * @param fecha - Fecha en formato ISO (opcional, si no se proporciona usa la actual)
 * @returns Hora formateada como HH:MM (24 horas)
 */
export const formatHora = (fecha?: string): string => {
  const dt = fecha 
    ? DateTime.fromISO(fecha, { zone: 'utc' }).setZone(ZONA_BOGOTA)
    : DateTime.now().setZone(ZONA_BOGOTA);
  return dt.toFormat('HH:mm');
};

/**
 * Obtiene la fecha y hora formateada como DD/MM/YYYY HH:MM
 * @param fecha - Fecha en formato ISO (opcional, si no se proporciona usa la actual)
 * @returns Fecha y hora formateada como DD/MM/YYYY HH:MM
 */
export const formatFechaHora = (fecha?: string): string => {
  const dt = fecha 
    ? DateTime.fromISO(fecha, { zone: 'utc' }).setZone(ZONA_BOGOTA)
    : DateTime.now().setZone(ZONA_BOGOTA);
  return dt.toFormat('dd/MM/yyyy HH:mm');
};

/**
 * Obtiene el timestamp actual en formato ISO (UTC) para almacenar en base de datos
 * @returns Timestamp en formato ISO (UTC)
 */
export const getTimestampUTC = (): string => {
  return DateTime.now().setZone(ZONA_BOGOTA).toUTC().toISO() || '';
};

/**
 * Convierte una fecha/hora de Bogotá a timestamp UTC para almacenar en BD
 * @param fecha - Fecha en formato ISO o string
 * @param hora - Hora en formato HH:MM (opcional)
 * @returns Timestamp en formato ISO (UTC)
 */
export const convertirBogotaAUTC = (fecha: string, hora?: string): string => {
  let dt: DateTime;
  
  if (hora) {
    const [year, month, day] = fecha.split('-').map(Number);
    const [hours, minutes] = hora.split(':').map(Number);
    dt = DateTime.fromObject(
      { year, month, day, hour: hours, minute: minutes },
      { zone: ZONA_BOGOTA }
    );
  } else {
    dt = DateTime.fromISO(fecha, { zone: ZONA_BOGOTA });
  }
  
  return dt.toUTC().toISO() || '';
};

/**
 * Convierte una fecha y hora manual (en zona horaria Bogotá) a UTC para almacenar en BD
 * @param fecha - Fecha en formato DD/MM/YYYY
 * @param hora - Hora en formato HH:MM (opcional, si no se proporciona usa 00:00)
 * @returns Timestamp en formato ISO (UTC)
 */
export const convertirManualAUTC = (fecha: string, hora?: string): string => {
  // Parsear fecha en formato DD/MM/YYYY
  const [dia, mes, anio] = fecha.split('/').map(Number);
  
  let horas = 0;
  let minutos = 0;
  
  if (hora) {
    const [h, m] = hora.split(':').map(Number);
    horas = h || 0;
    minutos = m || 0;
  }
  
  // Crear DateTime en zona Bogotá
  const dt = DateTime.fromObject(
    { year: anio, month: mes, day: dia, hour: horas, minute: minutos },
    { zone: ZONA_BOGOTA }
  );
  
  // Convertir a UTC y retornar ISO
  return dt.toUTC().toISO() || '';
};

/**
 * Valida si una fecha en formato DD/MM/YYYY es válida
 */
export const validarFechaManual = (fecha: string): boolean => {
  if (!fecha) return false;
  
  const partes = fecha.split('/');
  if (partes.length !== 3) return false;
  
  const dia = parseInt(partes[0]);
  const mes = parseInt(partes[1]);
  const anio = parseInt(partes[2]);
  
  if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return false;
  if (mes < 1 || mes > 12) return false;
  if (dia < 1 || dia > 31) return false;
  if (anio < 2000 || anio > 2100) return false;
  
  // Verificar días por mes
  const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Ajuste por año bisiesto
  if (mes === 2) {
    const esBisiesto = (anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0);
    if (dia > (esBisiesto ? 29 : 28)) return false;
  } else if (dia > diasPorMes[mes - 1]) {
    return false;
  }
  
  return true;
};

/**
 * Valida si una hora en formato HH:MM es válida
 */
export const validarHoraManual = (hora: string): boolean => {
  if (!hora) return true; // Hora es opcional
  
  const partes = hora.split(':');
  if (partes.length !== 2) return false;
  
  const horas = parseInt(partes[0]);
  const minutos = parseInt(partes[1]);
  
  if (isNaN(horas) || isNaN(minutos)) return false;
  if (horas < 0 || horas > 23) return false;
  if (minutos < 0 || minutos > 59) return false;
  
  return true;
};

/**
 * Determina si una fecha corresponde al día actual en Bogotá
 * @param fechaTimestamp - Timestamp en formato ISO (UTC)
 * @returns true si la fecha corresponde al día actual en Bogotá
 */
export const esFechaActual = (fechaTimestamp: string): boolean => {
  const fecha = DateTime.fromISO(fechaTimestamp, { zone: 'utc' }).setZone(ZONA_BOGOTA);
  const hoy = DateTime.now().setZone(ZONA_BOGOTA);
  
  return fecha.hasSame(hoy, 'day');
};

/**
 * Obtiene el día actual en formato DD/MM/YYYY
 * @returns Día actual formateado como DD/MM/YYYY
 */
export const getDiaActual = (): string => {
  return DateTime.now().setZone(ZONA_BOGOTA).toFormat('dd/MM/yyyy');
};

/**
 * Obtiene el nombre del mes actual
 * @param fecha - Fecha en formato ISO (opcional)
 * @returns Nombre del mes en español
 */
export const getNombreMes = (fecha?: string): string => {
  const dt = fecha 
    ? DateTime.fromISO(fecha, { zone: 'utc' }).setZone(ZONA_BOGOTA)
    : DateTime.now().setZone(ZONA_BOGOTA);
  return dt.toFormat('MMMM', { locale: 'es' });
};

/**
 * Obtiene el nombre del día de la semana
 * @param fecha - Fecha en formato ISO (opcional)
 * @returns Nombre del día en español
 */
export const getNombreDia = (fecha?: string): string => {
  const dt = fecha 
    ? DateTime.fromISO(fecha, { zone: 'utc' }).setZone(ZONA_BOGOTA)
    : DateTime.now().setZone(ZONA_BOGOTA);
  return dt.toFormat('cccc', { locale: 'es' });
};

/**
 * Compara dos fechas en Bogotá (solo día, mes, año)
 * @param fecha1 - Timestamp en formato ISO (UTC)
 * @param fecha2 - Timestamp en formato ISO (UTC)
 * @returns true si las fechas son el mismo día
 */
export const sonMismaFecha = (fecha1: string, fecha2: string): boolean => {
  const dt1 = DateTime.fromISO(fecha1, { zone: 'utc' }).setZone(ZONA_BOGOTA);
  const dt2 = DateTime.fromISO(fecha2, { zone: 'utc' }).setZone(ZONA_BOGOTA);
  
  return dt1.hasSame(dt2, 'day');
};

/**
 * Obtiene el timestamp de un registro en hora local de Bogotá para mostrar
 * @param utcTimestamp - Timestamp en formato ISO (UTC) de la base de datos
 * @returns Objeto con fecha y hora formateadas
 */
export const getFechaHoraLocal = (utcTimestamp: string) => {
  const dt = DateTime.fromISO(utcTimestamp, { zone: 'utc' }).setZone(ZONA_BOGOTA);
  return {
    fecha: dt.toFormat('dd/MM/yyyy'),
    hora: dt.toFormat('HH:mm'),
    fechaHora: dt.toFormat('dd/MM/yyyy HH:mm'),
    iso: dt.toISO() || '',
  };
};