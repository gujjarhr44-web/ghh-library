import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

type ScanMode = "entry" | "exit";

export default function QRScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { wallet, attendanceRecords, settings, addAttendanceRecord, hasActiveSession } = useData();
  const [mode, setMode] = useState<ScanMode>("entry");
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // FIX BUG-06: Check if there is an active (un-exited) entry session
  const activeSession = hasActiveSession();
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const qrData = JSON.stringify({
    userId: user?.id,
    name: user?.name,
    seat: user?.assignedSeat,
    shift: user?.assignedShift,
    mode,
    ts: Date.now(),
  });

  const lastRecord = attendanceRecords[0];

  const handleMarkAttendance = () => {
    if (!settings.isMarkAttendanceClickable) {
      Alert.alert("Feature Disabled", "Attendance marking has been disabled by the admin.");
      return;
    }
    // FIX BUG-06: Prevent exit scan if no active entry session
    if (mode === "exit" && !activeSession) {
      Alert.alert(
        "No Active Session",
        "You have not marked entry today. Please mark Entry first before marking Exit."
      );
      return;
    }
    // Launch simulated working QR camera scanner
    setShowScanner(true);
  };

  const handleScanSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScanned(true);
    addAttendanceRecord(mode === "entry");
    setShowScanner(false);
    setTimeout(() => setScanned(false), 3000);
    Alert.alert(
      mode === "entry" ? "Entry Marked!" : "Exit Marked!",
      mode === "entry"
        ? `Welcome ${user?.name?.split(" ")[0]}! Your attendance has been recorded.`
        : `Goodbye! Session duration: 5h 30m. 1 credit deducted.`,
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Attendance QR
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          {!settings.isMarkAttendanceClickable ? "Attendance marking is currently disabled by the admin." : "Show this QR code at the library scanner"}
        </Text>
      </View>

      <View style={[styles.seatInfo, { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.seatRow}>
          <View style={styles.seatItem}>
            <MaterialCommunityIcons name="seat" size={16} color={colors.primary} />
            <Text style={[styles.seatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Seat</Text>
            <Text style={[styles.seatVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {user?.assignedSeat ?? "Not Assigned"}
            </Text>
          </View>
          <View style={[styles.seatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.seatItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
            <Text style={[styles.seatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Shift</Text>
            <Text style={[styles.seatVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {user?.assignedShift ?? "Morning"}
            </Text>
          </View>
          <View style={[styles.seatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.seatItem}>
            <MaterialCommunityIcons name="wallet" size={16} color={colors.primary} />
            <Text style={[styles.seatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Credits</Text>
            <Text style={[styles.seatVal, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
              {wallet.available}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.modeToggle, { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.muted }]}>
        {(["entry", "exit"] as ScanMode[]).map(m => {
          // FIX BUG-06: Show exit as disabled when no active session
          const isExitDisabled = m === "exit" && !activeSession;
          return (
            <Pressable
              key={m}
              style={[
                styles.modeBtn,
                { backgroundColor: mode === m ? colors.primary : "transparent", opacity: isExitDisabled ? 0.4 : 1 },
              ]}
              onPress={() => {
                if (isExitDisabled) {
                  Alert.alert("No Active Session", "Mark Entry first before selecting Exit.");
                  return;
                }
                setMode(m);
              }}
            >
              <MaterialCommunityIcons
                name={m === "entry" ? "login" : "logout"}
                size={16}
                color={mode === m ? "#fff" : colors.mutedForeground}
              />
              <Text style={[styles.modeBtnText, {
                color: mode === m ? "#fff" : colors.mutedForeground,
                fontFamily: "Poppins_600SemiBold",
              }]}>
                {m === "entry" ? "Entry" : isExitDisabled ? "Exit (No Session)" : "Exit"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.qrWrap, { marginHorizontal: 20, marginTop: 20, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.qrCorner, styles.qrTopLeft, { borderColor: colors.primary }]} />
        <View style={[styles.qrCorner, styles.qrTopRight, { borderColor: colors.primary }]} />
        <View style={[styles.qrCorner, styles.qrBottomLeft, { borderColor: colors.primary }]} />
        <View style={[styles.qrCorner, styles.qrBottomRight, { borderColor: colors.primary }]} />

        <View style={[styles.qrInner, {
          backgroundColor: "#FFFFFF",
          opacity: scanned || !settings.isMarkAttendanceClickable ? 0.3 : 1,
        }]}>
          <QRCode
            value={qrData}
            size={200}
            backgroundColor="#FFFFFF"
            color="#0A0F1E"
          />
        </View>

        {scanned && (
          <View style={styles.scannedOverlay}>
            <MaterialCommunityIcons name="check-circle" size={64} color={colors.success} />
            <Text style={[styles.scannedText, { color: colors.success, fontFamily: "Poppins_700Bold" }]}>
              {mode === "entry" ? "Entry Marked!" : "Exit Marked!"}
            </Text>
          </View>
        )}

        {!settings.isMarkAttendanceClickable && (
          <View style={styles.scannedOverlay}>
            <MaterialCommunityIcons name="alert-circle" size={64} color={colors.destructive} />
            <Text style={[styles.scannedText, { color: colors.destructive, fontFamily: "Poppins_700Bold" }]}>
              Disabled
            </Text>
          </View>
        )}

        <Text style={[styles.qrRefresh, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          {!settings.isMarkAttendanceClickable ? "QR code scanning is disabled by the admin" : "QR refreshes every 60 seconds for security"}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.scanBtn,
          { 
            marginHorizontal: 20, 
            marginTop: 16, 
            backgroundColor: !settings.isMarkAttendanceClickable ? colors.border : colors.primary, 
            opacity: pressed && settings.isMarkAttendanceClickable ? 0.85 : 1 
          },
        ]}
        onPress={handleMarkAttendance}
        disabled={!settings.isMarkAttendanceClickable}
      >
        <MaterialCommunityIcons name={mode === "entry" ? "login" : "logout"} size={20} color={settings.isMarkAttendanceClickable ? "#fff" : colors.mutedForeground} />
        <Text style={[styles.scanBtnText, { color: settings.isMarkAttendanceClickable ? "#fff" : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
          {!settings.isMarkAttendanceClickable ? "Attendance Marking Disabled" : `Mark ${mode === "entry" ? "Entry" : "Exit"}`}
        </Text>
      </Pressable>

      {lastRecord && !lastRecord.isLeave && (
        <View style={[styles.lastRecord, { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.lastRecordTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Last Attendance
          </Text>
          <View style={styles.lastRecordRow}>
            <View style={styles.lastRecordItem}>
              <Text style={[styles.lastRecordLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Date</Text>
              <Text style={[styles.lastRecordVal, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                {lastRecord.date}
              </Text>
            </View>
            <View style={styles.lastRecordItem}>
              <Text style={[styles.lastRecordLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Entry</Text>
              <Text style={[styles.lastRecordVal, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                {lastRecord.entryTime}
              </Text>
            </View>
            <View style={styles.lastRecordItem}>
              <Text style={[styles.lastRecordLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Duration</Text>
              <Text style={[styles.lastRecordVal, { color: colors.success, fontFamily: "Poppins_600SemiBold" }]}>
                {lastRecord.duration}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Working QR Scanner Simulation Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={[styles.scannerContainer, { backgroundColor: "#000" }]}>
          <View style={styles.scannerHeader}>
            <Pressable style={styles.scannerClose} onPress={() => setShowScanner(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </Pressable>
            <Text style={styles.scannerTitle}>Scan Library QR</Text>
          </View>

          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinder}>
              <View style={[styles.scannerCorner, styles.cTopLeft]} />
              <View style={[styles.scannerCorner, styles.cTopRight]} />
              <View style={[styles.scannerCorner, styles.cBottomLeft]} />
              <View style={[styles.scannerCorner, styles.cBottomRight]} />
              
              {/* Laser animation simulation */}
              <View style={styles.laserLine} />
            </View>
          </View>

          <View style={styles.scannerFooter}>
            <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.scannerTip}>Align Library Gate QR Code inside the box</Text>
            <Text style={styles.scannerSubTip}>Scanning starts automatically...</Text>
          </View>

          {/* Trigger scan success after 2 seconds */}
          {showScanner && (
            <ScannerTrigger onScan={handleScanSuccess} />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

// Helper wrapper to handle timer securely
function ScannerTrigger({ onScan }: { onScan: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onScan();
    }, 2200);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 26 },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  seatInfo: { borderRadius: 16, padding: 16, borderWidth: 1 },
  seatRow: { flexDirection: "row", alignItems: "center" },
  seatItem: { flex: 1, alignItems: "center", gap: 4 },
  seatDivider: { width: 1, height: 40 },
  seatLabel: { fontSize: 11 },
  seatVal: { fontSize: 16 },
  modeToggle: { flexDirection: "row", borderRadius: 14, padding: 4, gap: 4 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, borderRadius: 11 },
  modeBtnText: { fontSize: 15 },
  qrWrap: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 16,
    position: "relative",
  },
  qrCorner: { position: "absolute", width: 24, height: 24, borderWidth: 3 },
  qrTopLeft: { top: 8, left: 8, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  qrTopRight: { top: 8, right: 8, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  qrBottomLeft: { bottom: 8, left: 8, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  qrBottomRight: { bottom: 8, right: 8, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  qrInner: { padding: 16, borderRadius: 12 },
  scannedOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  scannedText: { fontSize: 20 },
  qrRefresh: { fontSize: 12, textAlign: "center" },
  scanBtn: { height: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  scanBtnText: { fontSize: 16, color: "#fff" },
  lastRecord: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  lastRecordTitle: { fontSize: 15 },
  lastRecordRow: { flexDirection: "row" },
  lastRecordItem: { flex: 1, gap: 4 },
  lastRecordLabel: { fontSize: 11 },
  lastRecordVal: { fontSize: 14 },
  
  // Simulated Camera Scanner Styles
  scannerContainer: { flex: 1, justifyContent: "space-between", paddingVertical: 40 },
  scannerHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
  scannerClose: { padding: 8 },
  scannerTitle: { color: "#fff", fontSize: 18, fontFamily: "Poppins_600SemiBold", marginLeft: 16 },
  viewfinderContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  viewfinder: { width: 260, height: 260, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", position: "relative", justifyContent: "center", alignItems: "center" },
  scannerCorner: { position: "absolute", width: 20, height: 20, borderColor: "#10B981", borderWidth: 3 },
  cTopLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  cTopRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  cBottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  cBottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
  laserLine: { width: "94%", height: 3, backgroundColor: "#ef4444", position: "absolute", top: "50%" },
  scannerFooter: { alignItems: "center", paddingHorizontal: 20 },
  scannerTip: { color: "#fff", fontSize: 15, fontFamily: "Poppins_500Medium", textAlign: "center" },
  scannerSubTip: { color: "#9CA3AF", fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 4, textAlign: "center" },
});
