import { StyleSheet } from "react-native";

export const colors = {
  primary: "#2563EB", // Azul más moderno
  primaryLight: "#60A5FA",
  primaryDark: "#1D4ED8",
  secondary: "#10B981", // Verde
  secondaryLight: "#34D399",
  danger: "#EF4444", // Rojo
  dangerLight: "#F87171",
  warning: "#F59E0B", // Naranja/Ámbar
  warningLight: "#FBBF24",
  purple: "#8B5CF6", // Morado
  purpleLight: "#A78BFA",
  gray: "#6B7280",
  grayLight: "#9CA3AF",
  grayDark: "#374151",
  background: "#F3F4F6",
  white: "#FFFFFF",
  black: "#111827",
  text: "#1F2937",
  textLight: "#6B7280",
  textDark: "#111827",
  cardShadow: "#00000020",
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  containerCenter: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  buttonWarning: {
    backgroundColor: colors.warning,
  },
  buttonPurple: {
    backgroundColor: colors.purple,
  },
  buttonGray: {
    backgroundColor: colors.gray,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginVertical: 6,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
});
