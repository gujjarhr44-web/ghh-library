import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRemoteConfig } from "@/context/RemoteConfigContext";
import { useColors } from "@/hooks/useColors";

export function MaintenanceOverlay() {
  const { isMaintenanceMode, maintenanceTitle, maintenanceMessage } = useRemoteConfig();
  const colors = useColors();

  if (!isMaintenanceMode) return null;

  return (
    <Modal visible={true} transparent={false} animationType="fade">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.warning + "20" }]}>
            <MaterialCommunityIcons name="tools" size={48} color={colors.warning} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            {maintenanceTitle}
          </Text>
          <Text style={[styles.message, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {maintenanceMessage}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.primary + "15" }]}>
            <Text style={{ color: colors.primary, fontSize: 11, fontFamily: "Poppins_600SemiBold" }}>
              Live System Status: Maintenance
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
});
