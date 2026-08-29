import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, globalStyles } from '../theme/styles';
import { crearRegistro } from '../database/registroService';
import { obtenerPrimerPaciente } from '../database/pacienteService';
import {
  getTimestampUTC,
  formatFechaHora,
  convertirManualAUTC,
  validarFechaManual,
  validarHoraManual,
} from '../utils/dateTime';

interface GlucometriaScreenProps {
  navigation: any;
}

export default function GlucometriaScreen({ navigation }: GlucometriaScreenProps) {
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado para modo manual
  const [modoManual, setModoManual] = useState(false);
  const [fechaManual, setFechaManual] = useState('');
  const [horaManual, setHoraManual] = useState('');

  const handleGuardar = async () => {
    // Validar valor
    if (!valor.trim()) {
      Alert.alert('Error', 'Por favor, ingresa el valor de glucometría');
      return;
    }

    const valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Error', 'Ingresa un valor numérico válido mayor que 0');
      return;
    }

    // Validar fecha/hora manual si está activado
    let timestampUTC;
    if (modoManual) {
      if (!fechaManual.trim()) {
        Alert.alert('Error', 'Por favor, ingresa una fecha');
        return;
      }
      
      if (!validarFechaManual(fechaManual)) {
        Alert.alert('Error', 'Fecha inválida. Usa formato DD/MM/AAAA (ej: 25/08/2026)');
        return;
      }
      
      if (horaManual.trim() && !validarHoraManual(horaManual)) {
        Alert.alert('Error', 'Hora inválida. Usa formato HH:MM (ej: 14:30)');
        return;
      }
      
      timestampUTC = convertirManualAUTC(fechaManual, horaManual || '00:00');
    } else {
      timestampUTC = getTimestampUTC();
    }

    setLoading(true);
    try {
      const paciente = await obtenerPrimerPaciente();
      if (!paciente) {
        Alert.alert('Error', 'No hay un paciente activo');
        setLoading(false);
        return;
      }

      await crearRegistro({
        paciente_id: paciente.id,
        tipo: 'GLUCOMETRIA',
        valor: valorNumerico.toString(),
        fecha_hora: timestampUTC,
      });

      Alert.alert(
        '✅ Registro exitoso',
        `Glucometría: ${valorNumerico} mg/dL\n${formatFechaHora(timestampUTC)}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
      // Resetear campos
      setValor('');
      setFechaManual('');
      setHoraManual('');
      setModoManual(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la glucometría');
    } finally {
      setLoading(false);
    }
  };

  const toggleModoManual = () => {
    setModoManual(!modoManual);
    if (!modoManual) {
      // Al activar, establecer fecha actual como sugerencia
      const ahora = new Date();
      const dia = ahora.getDate().toString().padStart(2, '0');
      const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
      const anio = ahora.getFullYear();
      setFechaManual(`${dia}/${mes}/${anio}`);
      const horas = ahora.getHours().toString().padStart(2, '0');
      const minutos = ahora.getMinutes().toString().padStart(2, '0');
      setHoraManual(`${horas}:${minutos}`);
    } else {
      // Al desactivar, limpiar campos
      setFechaManual('');
      setHoraManual('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

        {/* Indicador de modo actual */}
        <View style={styles.modoContainer}>
          <Text style={styles.modoLabel}>
            {modoManual ? '📝 Modo manual activado' : '⏰ Modo automático (fecha/hora actual)'}
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
            {modoManual ? '❌ Usar fecha/hora actual' : '📝 Agregar manualmente'}
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
          style={[globalStyles.button, globalStyles.buttonPrimary, styles.button]}
          onPress={handleGuardar}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? 'Guardando...' : '💾 Guardar Registro'}
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
    justifyContent: 'center',
    padding: 30,
  },
  input: {
    fontSize: 32,
    textAlign: 'center',
    marginVertical: 12,
  },
  button: {
    marginTop: 12,
  },
  modoContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  modoLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  botonManual: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
    borderWidth: 1,
  },
  botonManualInactivo: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
  },
  botonManualActivo: {
    backgroundColor: '#FEF3C7',
    borderColor: colors.warning,
  },
  botonManualTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  manualContainer: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  manualLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  filaManual: {
    flexDirection: 'row',
    gap: 8,
  },
  inputFecha: {
    flex: 2,
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 4,
  },
  inputHora: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
});