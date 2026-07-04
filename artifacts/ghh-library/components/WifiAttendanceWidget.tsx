import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";

export function WifiAttendanceWidget() {
  const colors = useColors();
  const { settings, addAttendanceRecord, hasActiveSession } = useData();
  const [currentSSID, setCurrentSSID] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectedToTarget, setConnectedToTarget] = useState(false);

  const targetSSID = settings.wifiSSID || "GHH_Library_WiFi";
  const activeSession = hasActiveSession();

  // Simulated wifi scanner checking status
  useEffect(() => {
    // Check connection initially and set up interval
    const checkWifi = () => {
      // For demonstration, we simulate checking the active Wifi interface SSID.
      // If we are on mobile or simulator, we read the configured targetSSID.
      // Initially, we simulate being on default cellular/other wifi (null/other)
    };
    checkWifi();
  }, []);

  const simulateWifiConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentSSID(targetSSID);
      setConnectedToTarget(true);

      // Auto mark attendance on connect
      if (!activeSession) {
        addAttendanceRecord(true); // Auto check-in
        Alert.alert(
          "Auto Attendance",
          `Connected to library Wi-Fi: "${targetSSID}". Your Entry Attendance has been marked automatically!`
        );
      } else {
        Alert.alert(
          "Wi-Fi Connected",
          `Connected to library Wi-Fi: "${targetSSID}". You already have an active session.`
        );
      }
    }, 1500);
  };

  const simulateWifiDisconnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentSSID("Home_Network_WiFi");
      setConnectedToTarget(false);

      // Auto mark check-out if user is active
      if (activeSession) {
        addAttendanceRecord(false); // Auto check-out
        Alert.alert(
          "Auto Check-out",
          `Disconnected from library Wi-Fi: "${targetSSID}". Your Exit Attendance has been marked automatically!`
        );
      }
    }, 1200);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: connectedToTarget ? colors.success + "20" : colors.primary + "20" }]}>
          <MaterialCommunityIcons 
            name={connectedToTarget ? "wifi" : "wifi-off"} 
            size={20} 
            color={connectedToTarget ? colors.success : colors.primary} 
          />
        </View>
        <View style={styles.titleInfo}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Auto Wi-Fi Attendance
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Target Wi-Fi SSID: <Text style={{ fontFamily: "Poppins_600SemiBold", color: colors.foreground }}>"{targetSSID}"</Text>
          </Text>
        </View>
      </View>

      <View style={[styles.statusBox, { backgroundColor: colors.background }]}>
        <Text style={[styles.statusLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          Current Network Status:
        </Text>
        <Text style={[styles.statusValue, { color: connectedToTarget ? colors.success : colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : connectedToTarget ? (
            `Connected to "${currentSSID}"`
          ) : (
            `Connected to "${currentSSID || "Not connected to library WiFi"}"`
          )}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        {!connectedToTarget ? (
          <Pressable
            style={({ pressed }) => [
              styles.btn, 
              { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 }
            ]}
            onPress={simulateWifiConnect}
            disabled={loading}
          >
            <MaterialCommunityIcons name="wifi" size={16} color="#fff" />
            <Text style={[styles.btnText, { color: "#fff", fontFamily: "Poppins_600SemiBold" }]}>
              Connect Library Wi-Fi
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.btn, 
              { backgroundColor: colors.destructive, opacity: pressed || loading ? 0.8 : 1 }
            ]}
            onPress={simulateWifiDisconnect}
            disabled={loading}
          >
            <MaterialCommunityIcons name="wifi-off" size={16} color="#fff" />
            <Text style={[styles.btnText, { color: "#fff", fontFamily: "Poppins_600SemiBold" }]}>
              Disconnect Library Wi-Fi
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 12
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  titleInfo: {
    flex: 1
  },
  title: {
    fontSize: 15
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2
  },
  statusBox: {
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  statusLabel: {
    fontSize: 12
  },
  statusValue: {
    fontSize: 13
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  btnText: {
    fontSize: 13
  }
});
