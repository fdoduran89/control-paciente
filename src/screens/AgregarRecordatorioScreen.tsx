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
import { crearRecordatorio } from "../database/recordatorioService";
import { RegistroTipo } from "../models/types";
import { reprogramarNotificaciones } from "../notifications";

interface AgregarRecordatorioScreenProps {
  navigation: any;
}

export default function AgregarRecordatorioScreen({
  navigation,
}: AgregarRecordatorioScreenProps) {
  const [tipo, setTipo] = useState<RegistroTipo>("GLUCOMETRIA");
  const [hora, setHora] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const tipos: { label: string; value: RegistroTipo }[] = [
    { label: "Glucometría", value: "GLUCOMETRIA" },
    { label: "Tensión arterial", value: "TENSION_ARTERIAL" },
    { label: "Insulina", value: "INSULINA" },
  ];

  // Formatear hora automáticamente mientras escribe
  const formatearHora = (texto: string): string => {
    // Solo números
    let numeros = texto.replace(/\D/g, "");

    // Limitar a 4 dígitos
    if (numeros.length > 4) {
      numeros = numeros.slice(0, 4);
    }

    // Si está vacío, retornar vacío
    if (numeros.length === 0) {
      return "";
    }

    // Construir hora formateada
    let resultado = "";

    // Agregar los dos puntos en la posición correcta
    for (let i = 0; i < numeros.length; i++) {
      if (i === 2) {
        resultado += ":";
      }
      resultado += numeros[i];
    }

    // Si tenemos menos de 2 dígitos, mostrar solo los números sin dos puntos
    if (numeros.length < 2) {
      return numeros;
    }

    return resultado;
  };

  const handleHoraChange = (texto: string) => {
    // Si el usuario borra todo, limpiar
    if (texto === "") {
      setHora("");
      return;
    }

    // Formatear automáticamente
    const formateado = formatearHora(texto);
    setHora(formateado);
  };

  const validarHora = (horaStr: string): boolean => {
    // Si no tiene dos puntos, no está completa
    if (!horaStr.includes(":")) {
      return false;
    }

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
    // Si no tiene dos puntos, no está completa
    if (!hora.includes(":")) {
      return "";
    }

    const partes = hora.split(":");
    const horas = partes[0].padStart(2, "0");
    const minutos = partes[1]?.padEnd(2, "0") || "00";

    return `${horas}:${minutos}`;
  };

  const handleGuardar = async () => {
    const horaCompleta = obtenerHoraCompleta();

    if (!horaCompleta || !validarHora(horaCompleta)) {
      Alert.alert(
        "Error",
        "Por favor, ingresa una hora completa (HH:MM)\nEjemplos: 8 → 08:00 | 830 → 08:30",
      );
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

      const id = await crearRecordatorio(paciente.id, tipo, horaCompleta);
      console.log("✅ Recordatorio creado con ID:", id);

      await reprogramarNotificaciones(paciente.id);

      Alert.alert(
        "✅ Recordatorio creado",
        `Recordatorio de ${tipos.find((t) => t.value === tipo)?.label} a las ${horaCompleta}`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      console.error("❌ Error al crear recordatorio:", error);
      Alert.alert("Error", "No se pudo crear el recordatorio");
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
        <Text style={styles.title}>➕ Nuevo Recordatorio</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de evento</Text>
          <View style={styles.tipoContainer}>
            {tipos.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.tipoButton,
                  tipo === t.value && styles.tipoButtonActive,
                ]}
                onPress={() => setTipo(t.value)}
              >
                <Text
                  style={[
                    styles.tipoButtonText,
                    tipo === t.value && styles.tipoButtonTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hora</Text>
          <TextInput
            ref={inputRef}
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
            {loading ? "Guardando..." : "💾 Guardar Recordatorio"}
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
  tipoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tipoButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginRight: 8,
    marginBottom: 8,
  },
  tipoButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tipoButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  tipoButtonTextActive: {
    color: colors.white,
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
