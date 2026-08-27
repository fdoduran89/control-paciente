import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { colors, globalStyles } from "../theme/styles";
import { obtenerPrimerPaciente } from "../database/pacienteService";
import { obtenerRegistros } from "../database/registroService";
import { generarPDF } from "../exports/pdfExport";
import { formatFecha } from "../utils/dateTime";
import { Registro } from "../models/types";

interface ExportarScreenProps {
  navigation: any;
}

export default function ExportarScreen({ navigation }: ExportarScreenProps) {
  const [loading, setLoading] = useState(false);
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    glucometrias: 0,
    tensiones: 0,
    insulinas: 0,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const paciente = await obtenerPrimerPaciente();
      if (paciente) {
        setPacienteNombre(paciente.nombre);
        const data = await obtenerRegistros(paciente.id);
        setRegistros(data);
        calcularEstadisticas(data);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const calcularEstadisticas = (data: Registro[]) => {
    const stats = {
      total: data.length,
      glucometrias: data.filter((r) => r.tipo === "GLUCOMETRIA").length,
      tensiones: data.filter((r) => r.tipo === "TENSION_ARTERIAL").length,
      insulinas: data.filter((r) => r.tipo === "INSULINA").length,
    };
    setEstadisticas(stats);
  };

  const generarPDFTodos = async () => {
    if (registros.length === 0) {
      Alert.alert("Sin datos", "No hay registros para exportar");
      return;
    }

    setLoading(true);
    try {
      const sorted = [...registros].sort((a, b) =>
        a.fecha_hora.localeCompare(b.fecha_hora),
      );
      const inicio = formatFecha(sorted[0].fecha_hora);
      const fin = formatFecha(sorted[sorted.length - 1].fecha_hora);

      await generarPDF(pacienteNombre, inicio, fin, registros);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      Alert.alert("Error", "No se pudo generar el PDF");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generando PDF...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>📤 Exportar Registros</Text>
        <Text style={styles.subtitle}>
          Genera un documento PDF con todos los registros del paciente
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Paciente</Text>
        <Text style={styles.cardValue}>{pacienteNombre || "Sin paciente"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Resumen</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{estadisticas.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {estadisticas.glucometrias}
            </Text>
            <Text style={styles.statLabel}>Glucometrías</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.danger }]}>
              {estadisticas.tensiones}
            </Text>
            <Text style={styles.statLabel}>Tensiones</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {estadisticas.insulinas}
            </Text>
            <Text style={styles.statLabel}>Insulinas</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[globalStyles.button, styles.pdfButton]}
        onPress={generarPDFTodos}
        disabled={registros.length === 0}
      >
        <Text style={globalStyles.buttonText}>📄 Generar PDF Completo</Text>
      </TouchableOpacity>

      {registros.length === 0 && (
        <Text style={styles.emptyText}>
          No hay registros disponibles para exportar. Comienza registrando datos
          desde la pantalla principal.
        </Text>
      )}

      <Text style={styles.footer}>
        El PDF incluye secciones separadas por tipo de registro. La tensión
        arterial se muestra como sistólica/diastólica (ej: 120/80).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textLight,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  pdfButton: {
    backgroundColor: "#607D8B",
    marginVertical: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 20,
    padding: 20,
  },
  footer: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    fontStyle: "italic",
    paddingHorizontal: 10,
  },
});
