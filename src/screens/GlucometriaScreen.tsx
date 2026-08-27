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

interface GlucometriaScreenProps {
  navigation: any;
}

export default function GlucometriaScreen({
  navigation,
}: GlucometriaScreenProps) {
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!valor.trim()) {
      Alert.alert("Error", "Por favor, ingresa el valor de glucometría");
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert("Error", "Ingresa un valor numérico válido mayor que 0");
      return;
    }

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
        tipo: "GLUCOMETRIA",
        valor: valorNumerico.toString(),
        fecha_hora: timestampUTC,
      });

      Alert.alert(
        "✅ Registro exitoso",
        `Glucometría: ${valorNumerico} mg/dL\n${formatFechaHora(timestampUTC)}`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
      setValor("");
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar la glucometría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={globalStyles.title}>📊 Glucometría</Text>
        <Text style={globalStyles.subtitle}>Ingresa el valor en mg/dL</Text>

        <TextInput
          style={[globalStyles.input, styles.input]}
          placeholder="Ej: 120"
          value={valor}
          onChangeText={setValor}
          keyboardType="numeric"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleGuardar}
        />

        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
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
  input: {
    fontSize: 32,
    textAlign: "center",
    marginVertical: 12,
  },
  button: {
    marginTop: 12,
  },
});
