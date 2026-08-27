import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PacienteScreen from "../screens/PacienteScreen";
import GlucometriaScreen from "../screens/GlucometriaScreen";
import TensionArterialScreen from "../screens/TensionArterialScreen";
import InsulinaScreen from "../screens/InsulinaScreen";
import HistorialScreen from "../screens/HistorialScreen";
import RecordatoriosScreen from "../screens/RecordatoriosScreen";
import AgregarRecordatorioScreen from "../screens/AgregarRecordatorioScreen";
import EditarRecordatorioScreen from "../screens/EditarRecordatorioScreen";
import ExportarScreen from "../screens/ExportarScreen"; // 👈 NUEVO

const Stack = createNativeStackNavigator();

interface AppNavigatorProps {
  pacienteExiste: boolean;
  onPacienteCreado: () => void;
}

export default function AppNavigator({
  pacienteExiste,
  onPacienteCreado,
}: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!pacienteExiste ? (
          <Stack.Screen name="Paciente" options={{ title: "Nuevo Paciente" }}>
            {(props) => (
              <PacienteScreen {...props} onPacienteCreado={onPacienteCreado} />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Control de Paciente" }}
            />
            <Stack.Screen
              name="Glucometria"
              component={GlucometriaScreen}
              options={{ title: "Glucometría" }}
            />
            <Stack.Screen
              name="TensionArterial"
              component={TensionArterialScreen}
              options={{ title: "Tensión Arterial" }}
            />
            <Stack.Screen
              name="Insulina"
              component={InsulinaScreen}
              options={{ title: "Insulina" }}
            />
            <Stack.Screen
              name="Historial"
              component={HistorialScreen}
              options={{ title: "Historial" }}
            />
            <Stack.Screen
              name="Recordatorios"
              component={RecordatoriosScreen}
              options={{ title: "Recordatorios" }}
            />
            <Stack.Screen
              name="AgregarRecordatorio"
              component={AgregarRecordatorioScreen}
              options={{ title: "Nuevo Recordatorio" }}
            />
            <Stack.Screen
              name="EditarRecordatorio"
              component={EditarRecordatorioScreen}
              options={{ title: "Editar Recordatorio" }}
            />
            {/* 👈 NUEVA RUTA */}
            <Stack.Screen
              name="Exportar"
              component={ExportarScreen}
              options={{ title: "Exportar Registros" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
