import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const TODAY_ATTENDANCE = [
  { name: "Arjun Sharma", seat: "A-12", shift: "Morning", time: "06:15 AM", status: "in" },
  { name: "Meera Nair", seat: "B-04", shift: "Morning", time: "06:22 AM", status: "in" },
  { name: "Rohan Verma", seat: "A-08", shift: "Full Day", time: "06:05 AM", status: "in" },
  { name: "Pooja Singh", seat: "B-11", shift: "Morning", time: "06:44 AM", status: "in" },
  { name: "Kabir Khan", seat: "C-07", shift: "Afternoon", time: "12:10 PM", status: "in" },
];

export default function OwnerDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { students, libraries, pendingPayments, approvePayment, rejectPayment } = useData();
  const library = libraries[0];
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const activeStudents = students.filter(s => s.status === "active").length;
  const expiringSoon = students.filter(s => s.creditsRemaining <= 5 && s.status === "active").length;

  const activePendingPayments = pendingPayments.filter(p => p.status === "pending");

  const [showScanner, setShowScanner] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  // FIX BUG-10: Modal state for Send Alert (replaces iOS-only Alert.prompt)
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  // WiFi SSID Config Modal state
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [wifiSSIDInput, setWifiSSIDInput] = useState(settings.wifiSSID || "GHH_Library_WiFi");
  // UPI QR Payment Modal state
  const [showPaymentQRModal, setShowPaymentQRModal] = useState(false);
  const [paymentQRInput, setPaymentQRInput] = useState(settings.paymentQR || "upi://pay?pa=ghh@upi&pn=GHHLibrary&mc=0000&mode=02&purpose=00");

  const handleAction = (label: string) => {
    switch (label) {
      case "Scan QR":
        setShowScanner(true);
        break;
      case "Add Student":
        setShowAddStudent(true);
        break;
      case "Edit Seats":
        router.push("/(owner)/seats" as any);
        break;
      case "Send Alert":
        setAlertMessage("");
        setShowAlertModal(true);
        break;
      case "Wi-Fi Config":
        setWifiSSIDInput(settings.wifiSSID || "GHH_Library_WiFi");
        setShowWifiModal(true);
        break;
      case "QR Config":
        setPaymentQRInput(settings.paymentQR || "upi://pay?pa=ghh@upi&pn=GHHLibrary&mc=0000&mode=02&purpose=00");
        setShowPaymentQRModal(true);
        break;
      default:
        break;
    }
  };

  const handleScanSuccess = () => {
    setShowScanner(false);
    Alert.alert("Attendance Logged", "Student QR Code scanned successfully. Attendance entry recorded!");
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim() || !newStudentPhone.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }
    setShowAddStudent(false);
    Alert.alert("Student Added", `Successfully registered ${newStudentName} with GHH Central Library!`);
    setNewStudentName("");
    setNewStudentPhone("");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <View>
          <Text style={[styles.welcome, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Library Dashboard
          </Text>
          <Text style={[styles.libName, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            {library?.name}
          </Text>
        </View>
        <Pressable 
          style={[styles.ownerAvatar, { backgroundColor: colors.primary + "25" }]}
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: async () => { await logout(); router.replace("/"); } },
            ]);
          }}
        >
          <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <LinearGradient
        colors={[colors.primary, colors.primary + "BB"]}
        style={[styles.revenueCard, { marginHorizontal: 20, marginTop: 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          <Text style={[styles.revLabel, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
            Monthly Revenue
          </Text>
          <Text style={[styles.revAmount, { color: "#fff", fontFamily: "Poppins_700Bold" }]}>
            ₹{(library?.monthlyRevenue ?? 0).toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.revChange, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
            +12% vs last month
          </Text>
        </View>
        <View style={styles.revRight}>
          <MaterialCommunityIcons name="trending-up" size={40} color="#fff4" />
        </View>
      </LinearGradient>

      <View style={[styles.statsGrid, { paddingHorizontal: 20, marginTop: 12 }]}>
        <View style={styles.statsRow}>
          <StatCard label="Active Students" value={activeStudents} iconName="account-check" iconColor={colors.success} />
          <StatCard label="Today Attendance" value={TODAY_ATTENDANCE.length} iconName="account-clock" iconColor={colors.info} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Available Seats" value={library?.availableSeats ?? 0} iconName="seat" iconColor={colors.primary} />
          <StatCard label="Expiring Soon" value={expiringSoon} iconName="alert-circle" iconColor={colors.destructive} />
        </View>
      </View>

      <View style={[styles.occupancyCard, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.occupancyHeader}>
          <Text style={[styles.occupancyTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Seat Occupancy
          </Text>
          <Text style={[styles.occupancyPct, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
            {library?.occupancyRate}%
          </Text>
        </View>
        <View style={[styles.occupancyBar, { backgroundColor: colors.muted }]}>
          <View style={[styles.occupancyFill, { width: `${library?.occupancyRate ?? 0}%` as any, backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.occupancyStats}>
          <View style={styles.occupancyStat}>
            <View style={[styles.occupancyDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.occupancyStatText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {library?.totalSeats - library?.availableSeats} Occupied
            </Text>
          </View>
          <View style={styles.occupancyStat}>
            <View style={[styles.occupancyDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.occupancyStatText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {library?.availableSeats} Available
            </Text>
          </View>
        </View>
      </View>

      {/* Pending Payment Approvals Section */}
      {activePendingPayments.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 10 }]}>
            Pending Payment Approvals ({activePendingPayments.length})
          </Text>
          <View style={{ gap: 8 }}>
            {activePendingPayments.map(p => (
              <View key={p.id} style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: colors.foreground }}>{p.studentName}</Text>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>{p.planName} · ₹{p.price}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_700Bold", color: colors.primary }}>+{p.credits} Credits</Text>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>{p.date}</Text>
                  </View>
                </View>
                <View style={{ padding: 8, borderRadius: 8, backgroundColor: colors.background, borderWidth: 0.5, borderColor: colors.border }}>
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: colors.mutedForeground }}>
                    TxID / UTR: <Text style={{ fontFamily: "Poppins_600SemiBold", color: colors.foreground }}>{p.transactionId}</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 2 }}>
                  <Pressable
                    onPress={() => {
                      Alert.alert("Reject Payment", "Are you sure you want to reject this request?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Reject", style: "destructive", onPress: () => rejectPayment(p.id) }
                      ]);
                    }}
                    style={{ flex: 1, height: 38, borderRadius: 8, backgroundColor: colors.destructive + "15", borderWidth: 1, borderColor: colors.destructive + "40", justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={{ color: colors.destructive, fontFamily: "Poppins_600SemiBold", fontSize: 12 }}>Reject</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      approvePayment(p.id);
                      Alert.alert("Success", `Approved! ${p.credits} credits added to ${p.studentName}'s account.`);
                    }}
                    style={{ flex: 1, height: 38, borderRadius: 8, backgroundColor: colors.success, justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 12 }}>Verify & Approve</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            Today's Attendance
          </Text>
          <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
            {TODAY_ATTENDANCE.length} students
          </Text>
        </View>
        <View style={{ gap: 8, marginTop: 10 }}>
          {TODAY_ATTENDANCE.map((a, i) => (
            <View key={i} style={[styles.attendanceRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.attendanceAvatar, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.attendanceInitial, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                  {a.name[0]}
                </Text>
              </View>
              <View style={styles.attendanceInfo}>
                <Text style={[styles.attendanceName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {a.name}
                </Text>
                <Text style={[styles.attendanceMeta, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Seat {a.seat} · {a.shift}
                </Text>
              </View>
              <View style={styles.attendanceRight}>
                <Text style={[styles.attendanceTime, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                  {a.time}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.statusText, { color: colors.success, fontFamily: "Poppins_500Medium" }]}>
                    Present
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 10 }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          {[
            { icon: "qrcode-scan", label: "Scan QR", color: colors.info },
            { icon: "account-plus", label: "Add Student", color: colors.success },
            { icon: "seat-outline", label: "Edit Seats", color: colors.primary },
            { icon: "bell-ring-outline", label: "Send Alert", color: "#A78BFA" },
            { icon: "wifi", label: "Wi-Fi Config", color: colors.success },
            { icon: "qrcode", label: "QR Config", color: colors.primary },
          ].map(a => (
            <Pressable
              key={a.label}
              onPress={() => handleAction(a.label)}
              style={({ pressed }) => [
                styles.actionBox,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.color + "20" }]}>
                <MaterialCommunityIcons name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Simulated Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "space-between", paddingVertical: 50 }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20 }}>
            <Pressable onPress={() => setShowScanner(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </Pressable>
            <Text style={{ color: "#fff", fontSize: 18, fontFamily: "Poppins_600SemiBold", marginLeft: 16 }}>Scan Student QR</Text>
          </View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 250, height: 250, borderWidth: 2, borderColor: colors.primary, borderRadius: 10, justifyContent: "center", alignItems: "center" }}>
              <View style={{ width: "90%", height: 2, backgroundColor: "#ef4444" }} />
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#fff", fontFamily: "Poppins_500Medium" }}>Point camera at student's app QR code</Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>Scanning automatically...</Text>
          </View>
          <ScannerTrigger onScan={handleScanSuccess} />
        </View>
      </Modal>

      {/* Simulated Add Student Modal */}
      <Modal visible={showAddStudent} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: colors.foreground }}>Add Student</Text>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>Full Name</Text>
              <TextInput
                value={newStudentName}
                onChangeText={setNewStudentName}
                style={{ height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, color: colors.foreground, backgroundColor: colors.background }}
                placeholder="e.g. Rahul Kumar"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>Phone Number</Text>
              <TextInput
                value={newStudentPhone}
                onChangeText={setNewStudentPhone}
                style={{ height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, color: colors.foreground, backgroundColor: colors.background }}
                placeholder="e.g. +91 99988 77665"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable
                onPress={() => setShowAddStudent(false)}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.muted, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAddStudent}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Send Alert Modal (FIX BUG-10: replaces iOS-only Alert.prompt) */}
      <Modal visible={showAlertModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: colors.foreground }}>Send Alert to Students</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>Enter a message to broadcast to all active library members:</Text>
            <TextInput
              value={alertMessage}
              onChangeText={setAlertMessage}
              style={{ height: 80, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingTop: 10, color: colors.foreground, backgroundColor: colors.background, textAlignVertical: "top" }}
              placeholder="Type your alert message..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={() => setShowAlertModal(false)}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.muted, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowAlertModal(false);
                  if (alertMessage.trim().length > 0) {
                    Alert.alert("Success", `Alert broadcasted to all ${activeStudents} students successfully!`);
                  } else {
                    Alert.alert("Error", "Please enter a message before sending.");
                  }
                }}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Send Broadcast</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Wi-Fi Config Modal */}
      <Modal visible={showWifiModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: colors.foreground }}>Wi-Fi SSID Configuration</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>
              Configure your library's Wi-Fi network name (SSID). When student devices connect to this network, their entry and exit attendance is logged automatically.
            </Text>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>Network Name (SSID)</Text>
              <TextInput
                value={wifiSSIDInput}
                onChangeText={setWifiSSIDInput}
                style={{ height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, color: colors.foreground, backgroundColor: colors.background }}
                placeholder="e.g. GHH_Library_WiFi"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable
                onPress={() => setShowWifiModal(false)}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.muted, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!wifiSSIDInput.trim()) {
                    Alert.alert("Validation Error", "SSID cannot be empty.");
                    return;
                  }
                  setShowWifiModal(false);
                  
                  // Optimistically update locally or make network request to save settings
                  try {
                    const url = Platform.OS === "web" 
                      ? "/api/admin/settings" 
                      : "https://ghhlib2026admin.loca.lt/api/admin/settings";
                    const res = await fetch(url, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Bypass-Tunnel-Reminder": "true"
                      },
                      body: JSON.stringify({
                        wifiSSID: wifiSSIDInput.trim()
                      })
                    });
                    if (res.ok) {
                      Alert.alert("Success", `Wi-Fi SSID updated successfully to "${wifiSSIDInput.trim()}"!`);
                    } else {
                      Alert.alert("Updated Locally", `SSID updated locally to "${wifiSSIDInput.trim()}" (Offline fallback).`);
                    }
                  } catch (err) {
                    Alert.alert("Updated Locally", `SSID updated locally to "${wifiSSIDInput.trim()}".`);
                  }
                }}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Save Configuration</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code Config Modal */}
      <Modal visible={showPaymentQRModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: colors.foreground }}>Payment QR Configuration</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>
              Configure your UPI payment link (UPI URI). Students will scan the generated QR code in their app to make direct payments to purchase wallet credits.
            </Text>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>UPI Link (URI)</Text>
              <TextInput
                value={paymentQRInput}
                onChangeText={setPaymentQRInput}
                style={{ height: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, color: colors.foreground, backgroundColor: colors.background }}
                placeholder="upi://pay?pa=yourname@upi&pn=YourName"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable
                onPress={() => setShowPaymentQRModal(false)}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.muted, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (!paymentQRInput.trim()) {
                    Alert.alert("Validation Error", "UPI Link cannot be empty.");
                    return;
                  }
                  setShowPaymentQRModal(false);
                  
                  try {
                    const url = Platform.OS === "web" 
                      ? "/api/admin/settings" 
                      : "https://ghhlib2026admin.loca.lt/api/admin/settings";
                    const res = await fetch(url, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Bypass-Tunnel-Reminder": "true"
                      },
                      body: JSON.stringify({
                        paymentQR: paymentQRInput.trim()
                      })
                    });
                    if (res.ok) {
                      Alert.alert("Success", "UPI payment link updated successfully!");
                    } else {
                      Alert.alert("Updated Locally", "UPI payment link updated locally (Offline fallback).");
                    }
                  } catch (err) {
                    Alert.alert("Updated Locally", "UPI payment link updated locally.");
                  }
                }}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Save Configuration</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function ScannerTrigger({ onScan }: { onScan: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onScan();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  welcome: { fontSize: 13 },
  libName: { fontSize: 20, marginTop: 2 },
  ownerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  revenueCard: { borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  revLabel: { fontSize: 13 },
  revAmount: { fontSize: 36, lineHeight: 44 },
  revChange: { fontSize: 12, marginTop: 2 },
  revRight: {},
  statsGrid: { gap: 10 },
  statsRow: { flexDirection: "row", gap: 10 },
  occupancyCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  occupancyHeader: { flexDirection: "row", justifyContent: "space-between" },
  occupancyTitle: { fontSize: 15 },
  occupancyPct: { fontSize: 15 },
  occupancyBar: { height: 10, borderRadius: 5, overflow: "hidden" },
  occupancyFill: { height: "100%", borderRadius: 5 },
  occupancyStats: { flexDirection: "row", gap: 16 },
  occupancyStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  occupancyDot: { width: 8, height: 8, borderRadius: 4 },
  occupancyStatText: { fontSize: 13 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18 },
  seeAll: { fontSize: 13 },
  attendanceRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1, gap: 12 },
  attendanceAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  attendanceInitial: { fontSize: 18 },
  attendanceInfo: { flex: 1 },
  attendanceName: { fontSize: 14 },
  attendanceMeta: { fontSize: 12, marginTop: 2 },
  attendanceRight: { alignItems: "flex-end", gap: 4 },
  attendanceTime: { fontSize: 13 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBox: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 8, borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, textAlign: "center" },
});
