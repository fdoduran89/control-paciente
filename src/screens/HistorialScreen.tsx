import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { colors, globalStyles } from "../theme/styles";
import { obtenerRegistros } from "../database/registroService";
import { obtenerPrimerPaciente } from "../database/pacienteService";
import { Registro } from "../models/types";
import { formatFecha, formatHora } from "../utils/dateTime";

interface HistorialScreenProps {
  navigation: any;
}

export default function HistorialScreen({ navigation }: HistorialScreenProps) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarRegistros();
  }, []);

  const cargarRegistros = async () => {
    try {
      const paciente = await obtenerPrimerPaciente();
      if (paciente) {
        const data = await obtenerRegistros(paciente.id);
        setRegistros(data);
      }
    } catch (error) {
      console.error("Error al cargar registros:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarRegistros();
  };

  const getTipoTexto = (tipo: string): string => {
    const tipos: Record<string, string> = {
      GLUCOMETRIA: "Glucometría",
      TENSION_ARTERIAL: "Tensión arterial",
      INSULINA: "Insulina",
    };
    return tipos[tipo] || tipo;
  };

  const getValorMostrado = (registro: Registro): string => {
    switch (registro.tipo) {
      case "GLUCOMETRIA":
        return registro.valor || "N/A";
      case "TENSION_ARTERIAL":
        if (registro.sistolica && registro.diastolica) {
          return `${registro.sistolica}/${registro.diastolica}`;
        }
        return registro.valor || "N/A";
      case "INSULINA":
        return "✅ Aplicada";
      default:
        return "N/A";
    }
  };

  const getColorTipo = (tipo: string): string => {
    const colores: Record<string, string> = {
      GLUCOMETRIA: colors.primary,
      TENSION_ARTERIAL: colors.danger,
      INSULINA: colors.warning,
    };
    return colores[tipo] || colors.gray;
  };

  const renderItem = ({ item }: { item: Registro }) => {
    const fecha = formatFecha(item.fecha_hora);
    const hora = formatHora(item.fecha_hora);
    const valor = getValorMostrado(item);
    const tipoTexto = getTipoTexto(item.tipo);
    const color = getColorTipo(item.tipo);

    return (
      <View style={globalStyles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: color + "20" }]}>
            <Text style={[styles.badgeText, { color }]}>{tipoTexto}</Text>
          </View>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.valor}>{valor}</Text>
          <Text style={styles.hora}>{hora}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={globalStyles.containerCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Sin registros</Text>
            <Text style={styles.emptySubtitle}>
              Registra glucometría, tensión o insulina desde inicio
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
      {registros.length > 0 && (
        <Text style={styles.total}>Total: {registros.length} registros</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  fecha: {
    fontSize: 14,
    color: colors.textLight,
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valor: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  hora: {
    fontSize: 16,
    color: colors.textLight,
  },
  empty: {
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 4,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  total: {
    textAlign: "center",
    fontSize: 14,
    color: colors.textLight,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 4,
  },
});
