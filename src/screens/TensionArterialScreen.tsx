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
import {
  getTimestampUTC,
  formatFechaHora,
  convertirManualAUTC,
  validarFechaManual,
  validarHoraManual,
} from "../utils/dateTime";

interface TensionArterialScreenProps {
  navigation: any;
}

export default function TensionArterialScreen({
  navigation,
}: TensionArterialScreenProps) {
  const [sistolica, setSistolica] = useState("");
  const [diastolica, setDiastolica] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado para modo manual
  const [modoManual, setModoManual] = useState(false);
  const [fechaManual, setFechaManual] = useState("");
  const [horaManual, setHoraManual] = useState("");

  const guardarRegistro = async () => {
    const sistolicaNum = parseFloat(sistolica);
    const diastolicaNum = parseFloat(diastolica);

    // Validar fecha/hora manual si está activado
    let timestampUTC;
    if (modoManual) {
      if (!fechaManual.trim()) {
        Alert.alert("Error", "Por favor, ingresa una fecha");
        return;
      }

      if (!validarFechaManual(fechaManual)) {
        Alert.alert(
          "Error",
          "Fecha inválida. Usa formato DD/MM/AAAA (ej: 25/08/2026)",
        );
        return;
      }

      if (horaManual.trim() && !validarHoraManual(horaManual)) {
        Alert.alert("Error", "Hora inválida. Usa formato HH:MM (ej: 14:30)");
        return;
      }

      timestampUTC = convertirManualAUTC(fechaManual, horaManual || "00:00");
    } else {
      timestampUTC = getTimestampUTC();
    }

    setLoading(true);
    try {
      const paciente = await obtenerPrimerPaciente();
      if (!paciente) {
        Alert.alert("Error", "No hay un paciente activo");
        setLoading(false);
        return;
      }

      await crearRegistro({
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
      setFechaManual("");
      setHoraManual("");
      setModoManual(false);
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

  const toggleModoManual = () => {
    setModoManual(!modoManual);
    if (!modoManual) {
      const ahora = new Date();
      const dia = ahora.getDate().toString().padStart(2, "0");
      const mes = (ahora.getMonth() + 1).toString().padStart(2, "0");
      const anio = ahora.getFullYear();
      setFechaManual(`${dia}/${mes}/${anio}`);
      const horas = ahora.getHours().toString().padStart(2, "0");
      const minutos = ahora.getMinutes().toString().padStart(2, "0");
      setHoraManual(`${horas}:${minutos}`);
    } else {
      setFechaManual("");
      setHoraManual("");
    }
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

        {/* Indicador de modo actual */}
        <View style={styles.modoContainer}>
          <Text style={styles.modoLabel}>
            {modoManual
              ? "📝 Modo manual activado"
              : "⏰ Modo automático (fecha/hora actual)"}
          </Text>
        </View>

        {/* Botón para activar/desactivar modo manual */}
        <TouchableOpacity
          style={[
            styles.botonManual,
            modoManual ? styles.botonManualActivo : styles.botonManualInactivo,
          ]}
          onPress={toggleModoManual}
        >
          <Text style={styles.botonManualTexto}>
            {modoManual
              ? "❌ Usar fecha/hora actual"
              : "📝 Agregar manualmente"}
          </Text>
        </TouchableOpacity>

        {/* Campos de fecha/hora manual (visibles solo en modo manual) */}
        {modoManual && (
          <View style={styles.manualContainer}>
            <Text style={styles.manualLabel}>Fecha y hora del registro:</Text>
            <View style={styles.filaManual}>
              <TextInput
                style={[globalStyles.input, styles.inputFecha]}
                placeholder="DD/MM/AAAA"
                value={fechaManual}
                onChangeText={setFechaManual}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
              <TextInput
                style={[globalStyles.input, styles.inputHora]}
                placeholder="HH:MM"
                value={horaManual}
                onChangeText={setHoraManual}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
            <Text style={styles.hint}>
              Formato: DD/MM/AAAA y HH:MM (la hora es opcional)
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
  modoContainer: {
    alignItems: "center",
    marginVertical: 6,
  },
  modoLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: "italic",
  },
  botonManual: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
    borderWidth: 1,
  },
  botonManualInactivo: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  botonManualActivo: {
    backgroundColor: "#FEF3C7",
    borderColor: colors.warning,
  },
  botonManualTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  manualContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  manualLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  filaManual: {
    flexDirection: "row",
    gap: 8,
  },
  inputFecha: {
    flex: 2,
    fontSize: 18,
    textAlign: "center",
    marginVertical: 4,
  },
  inputHora: {
    flex: 1,
    fontSize: 18,
    textAlign: "center",
    marginVertical: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 4,
  },
  button: {
    marginTop: 12,
  },
});
