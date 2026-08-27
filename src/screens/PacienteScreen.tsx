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
import { crearPaciente } from "../database/pacienteService";
import { colors, globalStyles } from "../theme/styles";

interface PacienteScreenProps {
  navigation: any;
  onPacienteCreado: () => void;
}

export default function PacienteScreen({
  navigation,
  onPacienteCreado,
}: PacienteScreenProps) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCrearPaciente = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "Por favor, ingresa el nombre del paciente");
      return;
    }

    setLoading(true);
    try {
      const id = await crearPaciente(nombre.trim());
      console.log("✅ Paciente creado con ID:", id);

      Alert.alert("Éxito", `Paciente "${nombre.trim()}" creado correctamente`);
      onPacienteCreado();
    } catch (error) {
      console.error("❌ Error al crear paciente:", error);
      Alert.alert("Error", "No se pudo crear el paciente");
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
        <Text style={styles.title}>👋 Bienvenido</Text>
        <Text style={styles.subtitle}>
          Para comenzar, ingresa el nombre del paciente
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre del paciente</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            value={nombre}
            onChangeText={setNombre}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCrearPaciente}
          />
        </View>

        <TouchableOpacity
          style={[globalStyles.button, styles.button]}
          onPress={handleCrearPaciente}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? "Guardando..." : "💾 Guardar Paciente"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Los datos se guardan localmente en tu dispositivo
        </Text>
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    ...globalStyles.input,
    fontSize: 18,
  },
  button: {
    backgroundColor: colors.primary,
    marginVertical: 10,
  },
  footer: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 20,
  },
});
