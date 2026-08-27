import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AppNavigator from "./src/navigation";
import { initDatabase } from "./src/database";
import { obtenerPrimerPaciente } from "./src/database/pacienteService";
import { inicializarNotificaciones } from "./src/notifications";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pacienteExiste, setPacienteExiste] = useState(false);

  useEffect(() => {
    const setupApp = async () => {
      try {
        // 1. Inicializar base de datos
        await initDatabase();

        // 2. Verificar paciente
        const paciente = await obtenerPrimerPaciente();

        if (paciente) {
          console.log("✅ Paciente encontrado:", paciente.nombre);
          setPacienteExiste(true);

          // 3. Inicializar notificaciones (solo si hay paciente)
          await inicializarNotificaciones(paciente.id);
        } else {
          console.log("ℹ️ No hay paciente, esperando creación");
          setPacienteExiste(false);
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error al configurar la app:", err);
        setError("Error al configurar la aplicación");
        setLoading(false);
      }
    };

    setupApp();
  }, []);

  const handlePacienteCreado = async () => {
    const paciente = await obtenerPrimerPaciente();
    if (paciente) {
      setPacienteExiste(true);
      // Inicializar notificaciones para el nuevo paciente
      await inicializarNotificaciones(paciente.id);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Inicializando aplicación...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "red", fontSize: 18 }}>{error}</Text>
      </View>
    );
  }

  return (
    <AppNavigator
      pacienteExiste={pacienteExiste}
      onPacienteCreado={handlePacienteCreado}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
  },
});
