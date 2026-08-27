import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, globalStyles } from '../theme/styles';
import { obtenerPrimerPaciente } from '../database/pacienteService';
import {
  obtenerRecordatorios,
  actualizarEstadoRecordatorio,
  eliminarRecordatorio,
  inicializarRecordatoriosDefault,
  RecordatorioDB,
} from '../database/recordatorioService';
import { RegistroTipo } from '../models/types';
import { reprogramarNotificaciones, enviarNotificacionPrueba } from '../notifications';

interface RecordatoriosScreenProps {
  navigation: any;
}

export default function RecordatoriosScreen({ navigation }: RecordatoriosScreenProps) {
  const [recordatorios, setRecordatorios] = useState<RecordatorioDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarRecordatorios();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarRecordatorios = async () => {
    try {
      const paciente = await obtenerPrimerPaciente();
      if (paciente) {
        await inicializarRecordatoriosDefault(paciente.id);
        const data = await obtenerRecordatorios(paciente.id);
        setRecordatorios(data);
        
        // Reprogramar notificaciones después de cargar
        await reprogramarNotificaciones(paciente.id);
      }
    } catch (error) {
      console.error('Error al cargar recordatorios:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoTexto = (tipo: string): string => {
    const tipos: Record<string, string> = {
      'GLUCOMETRIA': 'Glucometría',
      'TENSION_ARTERIAL': 'Tensión arterial',
      'INSULINA': 'Insulina',
    };
    return tipos[tipo] || tipo;
  };

  const getColorTipo = (tipo: string): string => {
    const colores: Record<string, string> = {
      'GLUCOMETRIA': colors.primary,
      'TENSION_ARTERIAL': colors.danger,
      'INSULINA': colors.warning,
    };
    return colores[tipo] || colors.textLight;
  };

  const handleToggleSwitch = async (id: number, activo: boolean) => {
    try {
      await actualizarEstadoRecordatorio(id, activo);
      
      setRecordatorios(prev =>
        prev.map(r => r.id === id ? { ...r, activo: activo ? 1 : 0 } : r)
      );
      
      const paciente = await obtenerPrimerPaciente();
      if (paciente) {
        await reprogramarNotificaciones(paciente.id);
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Alert.alert('Error', 'No se pudo actualizar el recordatorio');
    }
  };

  const handleEliminar = (id: number, tipo: string) => {
    Alert.alert(
      'Eliminar recordatorio',
      `¿Deseas eliminar el recordatorio de ${getTipoTexto(tipo)} a las ${recordatorios.find(r => r.id === id)?.hora}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarRecordatorio(id);
              setRecordatorios(prev => prev.filter(r => r.id !== id));
              
              const paciente = await obtenerPrimerPaciente();
              if (paciente) {
                await reprogramarNotificaciones(paciente.id);
              }
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', 'No se pudo eliminar el recordatorio');
            }
          },
        },
      ]
    );
  };

  const handleAgregar = () => {
    navigation.navigate('AgregarRecordatorio');
  };

  const handleEditar = (recordatorio: RecordatorioDB) => {
    navigation.navigate('EditarRecordatorio', { recordatorio });
  };

  const renderItem = ({ item }: { item: RecordatorioDB }) => {
    const tipoTexto = getTipoTexto(item.tipo);
    const color = getColorTipo(item.tipo);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleEditar(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.tipoBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.tipoText, { color: color }]}>{tipoTexto}</Text>
          </View>
          <Switch
            value={item.activo === 1}
            onValueChange={(value) => handleToggleSwitch(item.id, value)}
            trackColor={{ false: '#D1D1D6', true: color }}
            thumbColor={item.activo === 1 ? colors.white : '#F4F4F4'}
          />
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.horaText}>⏰ {item.hora}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => handleEditar(item)}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleEliminar(item.id, item.tipo)}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⏰</Text>
      <Text style={styles.emptyTitle}>No hay recordatorios</Text>
      <Text style={styles.emptySubtitle}>
        Agrega un nuevo recordatorio usando el botón "+"
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando recordatorios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⏰ Recordatorios</Text>
        <Text style={styles.headerSubtitle}>
          Los recordatorios te avisarán si no has registrado un evento
        </Text>
      </View>

      <FlatList
        data={recordatorios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={recordatorios.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[globalStyles.button, styles.addButton]}
          onPress={handleAgregar}
        >
          <Text style={globalStyles.buttonText}>➕ Agregar Recordatorio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton]}
          onPress={async () => {
            await enviarNotificacionPrueba();
            Alert.alert('📨 Notificación de prueba', 'Revisa tu teléfono en 2 segundos');
          }}
        >
          <Text style={styles.testButtonText}>🔔 Probar Notificación</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 180,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horaText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionText: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: colors.primary,
    marginBottom: 8,
  },
  testButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#607D8B',
  },
  testButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});