import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, globalStyles } from "../theme/styles";
import { crearRegistro } from "../database/registroService";
import { obtenerPrimerPaciente } from "../database/pacienteService";
import { getTimestampUTC, formatFechaHora } from "../utils/dateTime";

interface TensionArterialScreenProps {
  navigation: any;
}

export default function TensionArterialScreen({
  navigation,
}: TensionArterialScreenProps) {
  const [sistolica, setSistolica] = useState("");
  const [diastolica, setDiastolica] = useState("");
  const [loading, setLoading] = useState(false);

  const guardarRegistro = async () => {
    const sistolicaNum = parseFloat(sistolica);
    const diastolicaNum = parseFloat(diastolica);

    setLoading(true);
    try {
      const paciente = await obtenerPrimerPaciente();
      if (!paciente) {
        Alert.alert("Error", "No hay un paciente activo");
        setLoading(false);
        return;
      }

      const timestampUTC = getTimestampUTC();
      const id = await crearRegistro({
        paciente_id: paciente.id,
        tipo: "TENSION_ARTERIAL",
        valor: `${sistolicaNum}/${diastolicaNum}`,
        sistolica: sistolicaNum,
        diastolica: diastolicaNum,
        fecha_hora: timestampUTC,
      });

      Alert.alert(
        "✅ Registro exitoso",
        `Tensión: ${sistolicaNum}/${diastolicaNum} mmHg\n${formatFechaHora(timestampUTC)}`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
      setSistolica("");
      setDiastolica("");
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar la tensión arterial");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = () => {
    if (!sistolica.trim() || !diastolica.trim()) {
      Alert.alert("Error", "Ingresa ambos valores");
      return;
    }

    const s = parseFloat(sistolica);
    const d = parseFloat(diastolica);
    if (isNaN(s) || isNaN(d) || s <= 0 || d <= 0) {
      Alert.alert("Error", "Valores numéricos válidos mayores que 0");
      return;
    }

    if (s <= d) {
      Alert.alert(
        "Advertencia",
        "La sistólica debe ser mayor que la diastólica",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Guardar igual", onPress: guardarRegistro },
        ],
      );
      return;
    }
    guardarRegistro();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={globalStyles.title}>❤️ Tensión Arterial</Text>
        <Text style={globalStyles.subtitle}>Ingresa los valores en mmHg</Text>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sistólica</Text>
            <TextInput
              style={[globalStyles.input, styles.inputSmall]}
              placeholder="120"
              value={sistolica}
              onChangeText={setSistolica}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          <Text style={styles.separator}>/</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diastólica</Text>
            <TextInput
              style={[globalStyles.input, styles.inputSmall]}
              placeholder="80"
              value={diastolica}
              onChangeText={setDiastolica}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleGuardar}
            />
          </View>
        </View>

        {sistolica && diastolica && (
          <View style={styles.preview}>
            <Text style={styles.previewText}>
              {sistolica}/{diastolica} mmHg
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonDanger,
            styles.button,
          ]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? "Guardando..." : "💾 Guardar Registro"}
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
    </KeyboardAvoidingView>
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
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  inputGroup: {
    flex: 1,
    alignItems: "center",
  },
  inputSmall: {
    textAlign: "center",
    fontSize: 28,
    height: 64,
    width: "100%",
  },
  label: {
    ...globalStyles.label,
    textAlign: "center",
  },
  separator: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    paddingHorizontal: 4,
  },
  preview: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.danger,
  },
  button: {
    marginTop: 12,
  },
});
