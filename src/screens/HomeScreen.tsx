import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { colors, globalStyles } from "../theme/styles";
import { obtenerPrimerPaciente } from "../database/pacienteService";
import { Paciente } from "../models/types";

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPaciente();
    const unsubscribe = navigation.addListener("focus", () => {
      cargarPaciente();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarPaciente = async () => {
    try {
      const p = await obtenerPrimerPaciente();
      setPaciente(p);
    } catch (error) {
      console.error("Error al cargar paciente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPaciente = () => {
    Alert.alert(
      "Cambiar paciente",
      "¿Deseas crear un nuevo paciente? El actual se mantendrá.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Crear nuevo", onPress: () => navigation.navigate("Paciente") },
      ],
    );
  };

  if (loading) {
    return (
      <View style={globalStyles.containerCenter}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={globalStyles.title}>🏥 Control de Paciente</Text>
        {paciente && (
          <TouchableOpacity
            onPress={handleCambiarPaciente}
            style={styles.pacienteCard}
          >
            <Text style={styles.pacienteLabel}>👤 Paciente</Text>
            <Text style={styles.pacienteName}>{paciente.nombre}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("Glucometria")}
        >
          <Text style={styles.gridIcon}>📊</Text>
          <Text style={styles.gridText}>Glucometría</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.danger }]}
          onPress={() => navigation.navigate("TensionArterial")}
        >
          <Text style={styles.gridIcon}>❤️</Text>
          <Text style={styles.gridText}>Tensión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.warning }]}
          onPress={() => navigation.navigate("Insulina")}
        >
          <Text style={styles.gridIcon}>💉</Text>
          <Text style={styles.gridText}>Insulina</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate("Historial")}
        >
          <Text style={styles.gridIcon}>📋</Text>
          <Text style={styles.gridText}>Historial</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.purple }]}
          onPress={() => navigation.navigate("Recordatorios")}
        >
          <Text style={styles.gridIcon}>⏰</Text>
          <Text style={styles.gridText}>Recordatorios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.gray }]}
          onPress={() => navigation.navigate("Exportar")}
        >
          <Text style={styles.gridIcon}>📤</Text>
          <Text style={styles.gridText}>Exportar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  pacienteCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pacienteLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "500",
  },
  pacienteName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  gridIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  gridText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textLight,
  },
  version: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
});
