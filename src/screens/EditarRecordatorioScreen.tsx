import React, { useState, useRef } from "react";
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
import { obtenerPrimerPaciente } from "../database/pacienteService";
import {
  actualizarHoraRecordatorio,
  RecordatorioDB,
} from "../database/recordatorioService";
import { reprogramarNotificaciones } from "../notifications";

interface EditarRecordatorioScreenProps {
  navigation: any;
  route: any;
}

export default function EditarRecordatorioScreen({
  navigation,
  route,
}: EditarRecordatorioScreenProps) {
  const recordatorio: RecordatorioDB = route.params?.recordatorio;
  const [hora, setHora] = useState(recordatorio?.hora || "");
  const [loading, setLoading] = useState(false);

  if (!recordatorio) {
    navigation.goBack();
    return null;
  }

  const getTipoTexto = (tipo: string): string => {
    const tipos: Record<string, string> = {
      GLUCOMETRIA: "Glucometría",
      TENSION_ARTERIAL: "Tensión arterial",
      INSULINA: "Insulina",
    };
    return tipos[tipo] || tipo;
  };

  // Formatear hora automáticamente mientras escribe
  const formatearHora = (texto: string): string => {
    let numeros = texto.replace(/\D/g, "");

    if (numeros.length > 4) {
      numeros = numeros.slice(0, 4);
    }

    if (numeros.length === 0) {
      return "";
    }

    let resultado = "";
    for (let i = 0; i < numeros.length; i++) {
      if (i === 2) {
        resultado += ":";
      }
      resultado += numeros[i];
    }

    if (numeros.length < 2) {
      return numeros;
    }

    return resultado;
  };

  const handleHoraChange = (texto: string) => {
    if (texto === "") {
      setHora("");
      return;
    }
    const formateado = formatearHora(texto);
    setHora(formateado);
  };

  const validarHora = (horaStr: string): boolean => {
    if (!horaStr.includes(":")) return false;
    const partes = horaStr.split(":");
    if (partes.length !== 2) return false;
    const horas = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);
    if (isNaN(horas) || isNaN(minutos)) return false;
    if (horas < 0 || horas > 23) return false;
    if (minutos < 0 || minutos > 59) return false;
    return true;
  };

  const obtenerHoraCompleta = (): string => {
    if (!hora.includes(":")) return "";
    const partes = hora.split(":");
    const horas = partes[0].padStart(2, "0");
    const minutos = partes[1]?.padEnd(2, "0") || "00";
    return `${horas}:${minutos}`;
  };

  const handleGuardar = async () => {
    const horaCompleta = obtenerHoraCompleta();

    if (!horaCompleta || !validarHora(horaCompleta)) {
      Alert.alert("Error", "Por favor, ingresa una hora completa (HH:MM)");
      return;
    }

    setLoading(true);
    try {
      await actualizarHoraRecordatorio(recordatorio.id, horaCompleta);
      console.log("✅ Recordatorio actualizado");

      const paciente = await obtenerPrimerPaciente();
      if (paciente) {
        await reprogramarNotificaciones(paciente.id);
      }

      Alert.alert(
        "✅ Recordatorio actualizado",
        `Nueva hora: ${horaCompleta}`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      console.error("❌ Error al actualizar recordatorio:", error);
      Alert.alert("Error", "No se pudo actualizar el recordatorio");
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
        <Text style={styles.title}>✏️ Editar Recordatorio</Text>
        <Text style={styles.subtitle}>{getTipoTexto(recordatorio.tipo)}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hora</Text>
          <TextInput
            style={styles.input}
            placeholder="8, 830 o 1430"
            value={hora}
            onChangeText={handleHoraChange}
            keyboardType="number-pad"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleGuardar}
            maxLength={5}
          />
          <Text style={styles.hint}>
            Escribe solo números. Ejemplos: 8 → 08:00 | 830 → 08:30 | 1430 →
            14:30
          </Text>
          {hora && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>
                {hora.includes(":")
                  ? `✅ ${obtenerHoraCompleta()}`
                  : `⏳ ${hora}...`}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[globalStyles.button, styles.button]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? "Guardando..." : "💾 Actualizar Recordatorio"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonCancel]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.buttonCancelText}>Cancelar</Text>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
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
    fontSize: 32,
    textAlign: "center",
    height: 70,
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 8,
  },
  previewContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    alignItems: "center",
  },
  previewText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
  },
  button: {
    backgroundColor: colors.primary,
    marginVertical: 10,
  },
  buttonCancel: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  buttonCancelText: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: "600",
  },
});
