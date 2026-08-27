import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { getDatabase } from "../database";
import { obtenerPrimerPaciente } from "../database/pacienteService";
import { obtenerRecordatoriosActivosHoy } from "../database/recordatorioService";
import { RegistroTipo } from "../models/types";

// Configurar el handler de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Solicitar permisos de notificación
export const solicitarPermisos = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log("⚠️ Las notificaciones solo funcionan en dispositivos físicos");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("❌ Permisos de notificación no concedidos");
    return false;
  }

  console.log("✅ Permisos de notificación concedidos");
  return true;
};

// Programar una notificación individual
export const programarNotificacion = async (
  tipo: RegistroTipo,
  hora: string,
  pacienteId: number,
): Promise<string | null> => {
  try {
    // Validar formato de hora
    if (!/^\d{2}:\d{2}$/.test(hora)) {
      console.error("Formato de hora inválido:", hora);
      return null;
    }

    // Extraer horas y minutos
    const [hours, minutes] = hora.split(":").map(Number);

    // Obtener el tipo de evento en español
    const tipoTexto =
      {
        GLUCOMETRIA: "glucometría",
        TENSION_ARTERIAL: "tensión arterial",
        INSULINA: "insulina",
      }[tipo] || tipo;

    // Programar la notificación con DailyTriggerInput (type: 'daily')
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Recordatorio de Control",
        body: `Es hora de registrar tu ${tipoTexto}`,
        data: {
          tipo: tipo,
          pacienteId: pacienteId,
          hora: hora,
        } as Record<string, unknown>,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: "daily", // 👈 Tipo 'daily' para recordatorios diarios
        hour: hours,
        minute: minutes,
        channelId: "recordatorios",
      } as Notifications.NotificationTriggerInput,
    });

    console.log(
      `✅ Notificación programada para ${tipo} a las ${hora} (ID: ${notificationId})`,
    );
    return notificationId;
  } catch (error) {
    console.error("❌ Error al programar notificación:", error);
    return null;
  }
};

// Programar todas las notificaciones para un paciente
export const programarTodasNotificaciones = async (
  pacienteId: number,
): Promise<void> => {
  try {
    // Cancelar todas las notificaciones existentes
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("🗑️ Notificaciones anteriores canceladas");

    // Obtener recordatorios activos
    const recordatorios = await obtenerRecordatoriosActivosHoy(pacienteId);
    console.log(`📋 ${recordatorios.length} recordatorios activos encontrados`);

    if (recordatorios.length === 0) {
      console.log("ℹ️ No hay recordatorios activos para programar");
      return;
    }

    // Programar cada recordatorio
    for (const rec of recordatorios) {
      await programarNotificacion(rec.tipo, rec.hora, pacienteId);
    }

    console.log(
      `✅ ${recordatorios.length} notificaciones programadas correctamente`,
    );
  } catch (error) {
    console.error("❌ Error al programar notificaciones:", error);
  }
};

// Verificar si un registro ya fue realizado hoy
export const verificarRegistroHoy = async (
  pacienteId: number,
  tipo: RegistroTipo,
): Promise<boolean> => {
  try {
    const db = getDatabase();

    // Obtener fecha actual en formato YYYY-MM-DD
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split("T")[0];

    // Buscar registros del tipo especificado en la fecha actual
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM registros 
       WHERE paciente_id = ? 
       AND tipo = ? 
       AND DATE(fecha_hora, 'localtime') = DATE(?)`,
      pacienteId,
      tipo,
      fechaStr,
    );

    const existe = (result?.count || 0) > 0;
    console.log(
      `🔍 Verificación ${tipo} para hoy: ${existe ? "✅ Registro existe" : "❌ Pendiente"}`,
    );
    return existe;
  } catch (error) {
    console.error("❌ Error al verificar registro:", error);
    return false;
  }
};

// Manejar el evento cuando se recibe una notificación (cuando la app está en foreground)
export const setupNotificationListeners = (): void => {
  // Escuchar cuando se recibe una notificación
  Notifications.addNotificationReceivedListener((notification) => {
    console.log("📨 Notificación recibida:", notification.request.content.data);

    // Verificar si el registro ya fue realizado y mostrar alerta si es necesario
    const data = notification.request.content.data as Record<string, unknown>;
    if (data?.tipo && data?.pacienteId) {
      const tipo = data.tipo as RegistroTipo;
      const pacienteId = data.pacienteId as number;
      verificarRegistroHoy(pacienteId, tipo).then((yaRegistrado) => {
        if (yaRegistrado) {
          console.log(
            `✅ ${tipo} ya fue registrado hoy. No se requiere acción.`,
          );
        } else {
          console.log(`⚠️ ${tipo} NO registrado hoy. Recordatorio activo.`);
        }
      });
    }
  });

  // Escuchar cuando el usuario interactúa con la notificación
  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("👆 Usuario interactuó con la notificación:", response);
    // Aquí se podría navegar a la pantalla correspondiente
  });
};

// Inicializar el sistema de notificaciones
export const inicializarNotificaciones = async (
  pacienteId: number,
): Promise<void> => {
  try {
    // Solicitar permisos
    const permisos = await solicitarPermisos();
    if (!permisos) {
      console.log("⚠️ No se pudieron obtener permisos de notificación");
      return;
    }

    // Configurar canal de Android (para versiones 8+)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("recordatorios", {
        name: "Recordatorios de Control",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
        enableVibrate: true,
      });
      console.log("✅ Canal de notificaciones configurado");
    }

    // Programar todas las notificaciones
    await programarTodasNotificaciones(pacienteId);

    // Configurar listeners
    setupNotificationListeners();

    console.log("✅ Sistema de notificaciones inicializado");
  } catch (error) {
    console.error("❌ Error al inicializar notificaciones:", error);
  }
};

// Re-programar notificaciones (cuando se cambian los recordatorios)
export const reprogramarNotificaciones = async (
  pacienteId: number,
): Promise<void> => {
  console.log("🔄 Reprogramando notificaciones...");
  await programarTodasNotificaciones(pacienteId);
};

// Función para probar una notificación inmediata
export const enviarNotificacionPrueba = async (): Promise<void> => {
  try {
    const paciente = await obtenerPrimerPaciente();
    if (!paciente) {
      console.log("⚠️ No hay paciente para prueba");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Prueba de Notificación",
        body: "Si ves esto, las notificaciones están funcionando correctamente.",
        sound: "default",
      },
      trigger: {
        type: "timeInterval", // 👈 Tipo 'timeInterval' para prueba
        seconds: 2,
      } as Notifications.NotificationTriggerInput,
    });
    console.log("✅ Notificación de prueba enviada (en 2 segundos)");
  } catch (error) {
    console.error("❌ Error al enviar notificación de prueba:", error);
  }
};
