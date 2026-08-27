import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { colors, globalStyles } from "../theme/styles";
import { crearRegistro } from "../database/registroService";
import { obtenerPrimerPaciente } from "../database/pacienteService";
import { getTimestampUTC, formatFechaHora } from "../utils/dateTime";

interface InsulinaScreenProps {
  navigation: any;
}

export default function InsulinaScreen({ navigation }: InsulinaScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleRegistrar = () => {
    Alert.alert(
      "💉 Confirmar aplicación",
      "¿Confirma que la insulina fue aplicada correctamente?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: guardarRegistro },
      ],
    );
  };

  const guardarRegistro = async () => {
    setLoading(true);
    try {
      const paciente = await obtenerPrimerPaciente();
      if (!paciente) {
        Alert.alert("Error", "No hay un paciente activo");
        setLoading(false);
        return;
      }

      const timestampUTC = getTimestampUTC();
      await crearRegistro({
        paciente_id: paciente.id,
        tipo: "INSULINA",
        valor: "Aplicada",
        fecha_hora: timestampUTC,
      });

      Alert.alert(
        "✅ Registro exitoso",
        `Insulina aplicada\n${formatFechaHora(timestampUTC)}`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar la insulina");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>💉</Text>
        <Text style={globalStyles.title}>Registrar Insulina</Text>
        <Text style={globalStyles.subtitle}>
          Confirma que la insulina fue aplicada al paciente
        </Text>

        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonWarning,
            styles.button,
          ]}
          onPress={handleRegistrar}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? "Registrando..." : "💉 Registrar Aplicación"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.button, { backgroundColor: colors.grayLight }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[globalStyles.buttonText, { color: colors.text }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    alignItems: "center",
  },
  icon: {
    fontSize: 72,
    marginBottom: 20,
  },
  button: {
    width: "100%",
    marginTop: 12,
  },
});
