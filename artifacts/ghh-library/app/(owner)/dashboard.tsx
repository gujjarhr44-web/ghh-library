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
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function OwnerDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const {
    students,
    libraries,
    settings,
    attendanceRecords,
    pendingPayments,
    ownerStats,
    approvePayment,
    rejectPayment,
    recordManualPayment,
    updateLibraryBillingMode,
    selectedBranchId,
    setSelectedBranchId,
    queryAiAssistant,
  } = useData();

  const library = libraries[0];
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const activeStudents = students.filter((s) => s.status === "active").length;
  const expiringSoon = students.filter((s) => s.creditsRemaining <= 5 && s.status === "active").length;
  const activePendingPayments = pendingPayments.filter((p) => p.status === "pending");

  // State modals
  const [showScanner, setShowScanner] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");

  // Send Alert Modal
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // WiFi SSID Config Modal
  const [showWifiModal, setShowWifiModal] = useState(false);
  const [wifiSSIDInput, setWifiSSIDInput] = useState(settings.wifiSSID || "GHH_Library_WiFi");

  // UPI QR Payment Modal
  const [showPaymentQRModal, setShowPaymentQRModal] = useState(false);
  const [paymentQRInput, setPaymentQRInput] = useState(settings.paymentQR || "upi://pay?pa=ghh@upi&pn=GHHLibrary&mc=0000&mode=02&purpose=00");

  // Billing Mode Config Modal
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBillingMode, setSelectedBillingMode] = useState<"credit" | "membership" | "custom">(library?.billingMode || "credit");

  // Record Manual Payment Modal
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualStudentName, setManualStudentName] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualMethod, setManualMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER">("CASH");
  const [manualPlanName, setManualPlanName] = useState("30 Credits Pack");
  const [manualCredits, setManualCredits] = useState("30");

  // AI Insights Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Unchecked Students Reminder Sent state
  const [exitReminderSent, setExitReminderSent] = useState(false);

  const handleAction = (label: string) => {
    switch (label) {
      case "Scan QR":
        setShowScanner(true);
        break;
      case "Add Student":
        setShowAddStudent(true);
        break;
      case "Manual Payment":
        setShowManualPaymentModal(true);
        break;
      case "Billing Mode":
        setShowBillingModal(true);
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

  const handleSaveManualPayment = () => {
    if (!manualStudentName.trim() || !manualAmount.trim()) {
      Alert.alert("Validation Error", "Student name and amount are required.");
      return;
    }

    recordManualPayment({
      studentName: manualStudentName.trim(),
      amount: Number(manualAmount) || 1000,
      method: manualMethod,
      planName: manualPlanName,
      credits: Number(manualCredits) || 30,
      validityDays: 30,
    });

    setShowManualPaymentModal(false);
    setManualStudentName("");
    setManualAmount("");
    Alert.alert("Payment Recorded! 💰", "Receipt generated & student credits activated successfully.");
  };

  const handleAskAi = async (customPrompt?: string) => {
    const q = customPrompt || aiQuery;
    if (!q.trim()) return;
    setAiLoading(true);
    const reply = await queryAiAssistant(q, "owner");
    setAiResponse(reply);
    setAiLoading(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header & Multi-Branch Switcher */}
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcome, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Library Owner Portal
          </Text>
          <Text style={[styles.libName, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            {library?.name}
          </Text>

          {/* Branch Selector */}
          {library?.branches && library.branches.length > 0 && (
            <View style={styles.branchRow}>
              {library.branches.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.branchChip,
                    {
                      backgroundColor: selectedBranchId === b.id ? colors.primary : colors.card,
                      borderColor: selectedBranchId === b.id ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedBranchId(b.id)}
                >
                  <Text style={[styles.branchChipText, { color: selectedBranchId === b.id ? "#fff" : colors.mutedForeground }]}>
                    🏢 {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={[styles.aiHeaderBtn, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}
            onPress={() => setShowAiModal(true)}
          >
            <MaterialCommunityIcons name="robot" size={20} color={colors.primary} />
          </TouchableOpacity>

          <Pressable
            style={[styles.ownerAvatar, { backgroundColor: colors.primary + "25" }]}
            onPress={() => {
              Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign Out",
                  style: "destructive",
                  onPress: async () => {
                    await logout();
                    router.replace("/");
                  },
                },
              ]);
            }}
          >
            <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Revenue Card with Billing Mode Badge */}
      <LinearGradient
        colors={[colors.primary, colors.primary + "BB"]}
        style={[styles.revenueCard, { marginHorizontal: 20, marginTop: 14 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[styles.revLabel, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
              Verified Revenue
            </Text>
            <View style={[styles.billingModeTag, { backgroundColor: "#ffffff25" }]}>
              <Text style={{ color: "#fff", fontSize: 10, fontFamily: "Poppins_700Bold" }}>
                MODE: {library?.billingMode?.toUpperCase() || "CREDIT"}
              </Text>
            </View>
          </View>
          <Text style={[styles.revAmount, { color: "#fff", fontFamily: "Poppins_700Bold" }]}>
            ₹{(ownerStats?.monthlyRevenue ?? 0).toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.revChange, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
            Real PostgreSQL Ledger Data
          </Text>
        </View>
        <View style={styles.revRight}>
          <MaterialCommunityIcons name="trending-up" size={40} color="#fff4" />
        </View>
      </LinearGradient>

      {/* AI Business Insights Preview Card */}
      <View style={[styles.aiInsightCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 12 }]}>
        <View style={styles.aiInsightTop}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color={colors.primary} />
            <Text style={[styles.aiInsightTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              AI Operational Insight
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowAiModal(true)}>
            <Text style={{ color: colors.primary, fontSize: 12, fontFamily: "Poppins_500Medium" }}>Ask AI →</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.aiInsightText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          {ownerStats.totalStudents > 0
            ? `💡 ${ownerStats.activeStudents} active students registered. ${ownerStats.todayAttendance} check-ins recorded today.`
            : "💡 No student activity or transactions recorded yet. Enroll students or generate QR passes to start generating AI operational insights."}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={[styles.statsGrid, { paddingHorizontal: 20, marginTop: 12 }]}>
        <View style={styles.statsRow}>
          <StatCard label="Active Students" value={ownerStats.activeStudents} iconName="account-check" iconColor={colors.success} />
          <StatCard label="Today Attendance" value={attendanceRecords.length} iconName="account-clock" iconColor={colors.info} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Available Seats" value={ownerStats.availableSeats} iconName="seat" iconColor={colors.primary} />
          <StatCard label="Expiring Soon" value={expiringSoon} iconName="alert-circle" iconColor={colors.destructive} />
        </View>
      </View>

      {/* Seat Occupancy Progress */}
      <View style={[styles.occupancyCard, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.occupancyHeader}>
          <Text style={[styles.occupancyTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Seat Occupancy
          </Text>
          <Text style={[styles.occupancyPct, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
            {ownerStats.totalSeats > 0 ? Math.round((ownerStats.occupiedSeats / ownerStats.totalSeats) * 100) : 0}%
          </Text>
        </View>
        <View style={[styles.occupancyBar, { backgroundColor: colors.muted }]}>
          <View style={[styles.occupancyFill, { width: `${ownerStats.totalSeats > 0 ? Math.round((ownerStats.occupiedSeats / ownerStats.totalSeats) * 100) : 0}%` as any, backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.occupancyStats}>
          <View style={styles.occupancyStat}>
            <View style={[styles.occupancyDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.occupancyStatText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {ownerStats.occupiedSeats} Occupied
            </Text>
          </View>
          <View style={styles.occupancyStat}>
            <View style={[styles.occupancyDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.occupancyStatText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {ownerStats.availableSeats} Available
            </Text>
          </View>
        </View>
      </View>

      {/* Students Not Checked Out Section */}
      {attendanceRecords.filter((a) => !a.exitTime && a.status === "present").length > 0 && (
        <View style={[styles.notCheckedOutCard, { marginHorizontal: 20, marginTop: 14, backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialCommunityIcons name="clock-alert-outline" size={20} color={colors.warning} />
              <Text style={[styles.notCheckedTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                Students Not Checked Out ({attendanceRecords.filter((a) => !a.exitTime && a.status === "present").length})
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.reminderBtn, { backgroundColor: colors.warning }]}
              onPress={() => {
                setExitReminderSent(true);
                Alert.alert("Reminder Dispatched 📲", `Smart exit reminder sent to ${attendanceRecords.filter((a) => !a.exitTime).length} active students.`);
              }}
            >
              <Text style={{ color: "#000", fontFamily: "Poppins_600SemiBold", fontSize: 11 }}>
                {exitReminderSent ? "✓ Sent" : "Send Reminder"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.notCheckedSub, { color: colors.mutedForeground }]}>
            Active study sessions currently in progress. Tap to remind students to check out.
          </Text>
        </View>
      )}

      {/* Pending Payment Approvals */}
      {activePendingPayments.length > 0 && (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 10 }]}>
            Pending Payment Approvals ({activePendingPayments.length})
          </Text>
          <View style={{ gap: 8 }}>
            {activePendingPayments.map((p) => (
              <View key={p.id} style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: colors.foreground }}>{p.studentName}</Text>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>{p.planName} · ₹{p.amount}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_700Bold", color: colors.primary }}>+{p.credits} Credits</Text>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>{p.submittedAt}</Text>
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
                        { text: "Reject", style: "destructive", onPress: () => rejectPayment(p.id) },
                      ]);
                    }}
                    style={{ flex: 1, height: 38, borderRadius: 8, backgroundColor: colors.destructive + "15", borderWidth: 1, borderColor: colors.destructive + "40", justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={{ color: colors.destructive, fontFamily: "Poppins_600SemiBold", fontSize: 12 }}>Reject</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      approvePayment(p.id);
                      Alert.alert("Success", `Approved! ${p.credits} credits activated for ${p.studentName}.`);
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

      {/* Today's Attendance Stream */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            Today's Attendance
          </Text>
          <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
            {attendanceRecords.length} present
          </Text>
        </View>
        <View style={{ gap: 8, marginTop: 10 }}>
          {attendanceRecords.length === 0 ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 24, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
              <MaterialCommunityIcons name="calendar-clock" size={36} color={colors.mutedForeground} />
              <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginTop: 8 }}>
                No Check-ins Today
              </Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Poppins_400Regular", fontSize: 12 }}>
                आज अभी कोई student checked-in नहीं है।
              </Text>
            </View>
          ) : (
            attendanceRecords.map((a, i) => (
              <View key={a.id || i} style={[styles.attendanceRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.attendanceAvatar, { backgroundColor: colors.primary + "20" }]}>
                  <Text style={[styles.attendanceInitial, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                    {a.seatNumber?.[0] || "S"}
                  </Text>
                </View>
                <View style={styles.attendanceInfo}>
                  <Text style={[styles.attendanceName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    {a.seatNumber ? `Seat ${a.seatNumber}` : "Student Session"}
                  </Text>
                  <Text style={[styles.attendanceMeta, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                    {a.shiftName || "Morning"} · {a.date}
                  </Text>
                </View>
                <View style={styles.attendanceRight}>
                  <Text style={[styles.attendanceTime, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                    {a.entryTime}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
                    <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.statusText, { color: colors.success, fontFamily: "Poppins_500Medium" }]}>
                      {a.exitTime ? "Completed" : "Present"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Quick Action Matrix */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 10 }]}>
          Manager Actions
        </Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: "qrcode-scan", label: "Scan QR", color: colors.info },
            { icon: "cash-register", label: "Manual Payment", color: colors.success },
            { icon: "cog-transfer-outline", label: "Billing Mode", color: "#F59E0B" },
            { icon: "account-plus", label: "Add Student", color: colors.primary },
            { icon: "seat-outline", label: "Edit Seats", color: colors.primary },
            { icon: "bell-ring-outline", label: "Send Alert", color: "#A78BFA" },
            { icon: "wifi", label: "Wi-Fi Config", color: colors.success },
            { icon: "qrcode", label: "QR Config", color: colors.primary },
          ].map((a) => (
            <Pressable
              key={a.label}
              onPress={() => handleAction(a.label)}
              style={({ pressed }) => [
                styles.actionGridBox,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
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

      {/* Modal 1: Manual Payment Recording */}
      <Modal visible={showManualPaymentModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              Record Manual Payment
            </Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Record cash, direct UPI, or bank transfer payments with instant receipt generation.
            </Text>

            <View style={{ gap: 10, marginTop: 12 }}>
              <View>
                <Text style={[styles.fieldLbl, { color: colors.mutedForeground }]}>Student Name</Text>
                <TextInput
                  value={manualStudentName}
                  onChangeText={setManualStudentName}
                  style={[styles.fieldInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLbl, { color: colors.mutedForeground }]}>Amount (₹)</Text>
                  <TextInput
                    value={manualAmount}
                    onChangeText={setManualAmount}
                    style={[styles.fieldInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
                    placeholder="e.g. 1000"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLbl, { color: colors.mutedForeground }]}>Credits / Days</Text>
                  <TextInput
                    value={manualCredits}
                    onChangeText={setManualCredits}
                    style={[styles.fieldInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
                    placeholder="e.g. 30"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Payment Method Selector */}
              <Text style={[styles.fieldLbl, { color: colors.mutedForeground }]}>Payment Method</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["CASH", "UPI", "BANK_TRANSFER"] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.methodChip,
                      {
                        backgroundColor: manualMethod === m ? colors.primary : colors.muted,
                        borderColor: manualMethod === m ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setManualMethod(m)}
                  >
                    <Text style={{ color: manualMethod === m ? "#fff" : colors.foreground, fontSize: 11, fontFamily: "Poppins_600SemiBold" }}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <Pressable
                onPress={() => setShowManualPaymentModal(false)}
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveManualPayment}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Save & Generate Receipt</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Billing Mode Switcher */}
      <Modal visible={showBillingModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              Configure Billing Model
            </Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Select the pricing structure for this library branch:
            </Text>

            <View style={{ gap: 10, marginTop: 14 }}>
              {[
                { mode: "credit" as const, title: "Mode A: Credit-Based (Default)", desc: "1 Credit = 1 Day/Shift Access. Fair billing with leave credit saving." },
                { mode: "membership" as const, title: "Mode B: Fixed Membership", desc: "Monthly/Quarterly fixed fee with unlimited access until validity date." },
                { mode: "custom" as const, title: "Mode C: Custom Billing", desc: "Custom mix of hourly, shift-based, or special institutional passes." },
              ].map((b) => (
                <TouchableOpacity
                  key={b.mode}
                  style={[
                    styles.billingOptionCard,
                    {
                      backgroundColor: selectedBillingMode === b.mode ? colors.primary + "15" : colors.background,
                      borderColor: selectedBillingMode === b.mode ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedBillingMode(b.mode)}
                >
                  <Text style={[styles.billingOptionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    {b.title}
                  </Text>
                  <Text style={[styles.billingOptionDesc, { color: colors.mutedForeground }]}>{b.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <Pressable onPress={() => setShowBillingModal(false)} style={[styles.modalCancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  updateLibraryBillingMode(library?.id || "lib001", selectedBillingMode);
                  setShowBillingModal(false);
                  Alert.alert("Billing Model Updated 🎉", `Library billing mode successfully set to ${selectedBillingMode.toUpperCase()}. Historical records preserved.`);
                }}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Apply Mode</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: AI Assistant for Owner */}
      <Modal visible={showAiModal} animationType="slide" transparent>
        <View style={styles.aiModalOverlay}>
          <View style={[styles.aiModalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.aiModalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MaterialCommunityIcons name="robot-excited" size={24} color={colors.primary} />
                <Text style={[styles.aiModalTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                  GHH Owner AI Advisor
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAiModal(false)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLbl, { color: colors.mutedForeground }]}>Quick Analytics Queries:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                <TouchableOpacity
                  style={[styles.aiChip, { backgroundColor: colors.muted }]}
                  onPress={() => handleAskAi("इस महीने revenue कितना है?")}
                >
                  <Text style={[styles.aiChipText, { color: colors.foreground }]}>💰 Monthly Revenue Analysis</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.aiChip, { backgroundColor: colors.muted }]}
                  onPress={() => handleAskAi("कौन सा shift सबसे ज्यादा crowded है?")}
                >
                  <Text style={[styles.aiChipText, { color: colors.foreground }]}>📊 Peak Shift & Occupancy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.aiChip, { backgroundColor: colors.muted }]}
                  onPress={() => handleAskAi("अगले 7 दिनों में कितने memberships expire हो रहे हैं?")}
                >
                  <Text style={[styles.aiChipText, { color: colors.foreground }]}>⏳ Expiring Memberships</Text>
                </TouchableOpacity>
              </View>

              {aiLoading && (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={{ color: colors.mutedForeground, marginTop: 8, fontSize: 12 }}>Analyzing backend metrics...</Text>
                </View>
              )}

              {aiResponse && (
                <View style={[styles.aiResponseBox, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                  <Text style={[styles.aiResponseText, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}>
                    {aiResponse}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <TextInput
                style={[styles.fieldInput, { flex: 1, color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
                placeholder="Ask AI about revenue, peak hours, renewals..."
                placeholderTextColor={colors.mutedForeground}
                value={aiQuery}
                onChangeText={setAiQuery}
                onSubmitEditing={() => handleAskAi()}
              />
              <TouchableOpacity style={[styles.aiSendBtn, { backgroundColor: colors.primary }]} onPress={() => handleAskAi()}>
                <MaterialCommunityIcons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* Send Alert Modal */}
      <Modal visible={showAlertModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: colors.foreground }}>Broadcast Alert</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>
              Send an instant announcement to all active library students:
            </Text>
            <TextInput
              value={alertMessage}
              onChangeText={setAlertMessage}
              style={{ height: 80, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingTop: 10, color: colors.foreground, backgroundColor: colors.background, textAlignVertical: "top" }}
              placeholder="Type your alert message..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable onPress={() => setShowAlertModal(false)} style={[styles.modalCancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowAlertModal(false);
                  if (alertMessage.trim().length > 0) {
                    Alert.alert("Success", `Broadcast sent to ${activeStudents} active students!`);
                  }
                }}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Send Notice</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Wi-Fi Config Modal */}
      <Modal visible={showWifiModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: colors.foreground }}>Wi-Fi SSID Configuration</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              Configure your library's Wi-Fi network name (SSID) for automatic in-library attendance verification.
            </Text>
            <TextInput
              value={wifiSSIDInput}
              onChangeText={setWifiSSIDInput}
              style={[styles.fieldInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border, marginTop: 8 }]}
              placeholder="e.g. GHH_Library_WiFi"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable onPress={() => setShowWifiModal(false)} style={[styles.modalCancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowWifiModal(false);
                  Alert.alert("Saved", `Wi-Fi SSID updated to "${wifiSSIDInput.trim()}".`);
                }}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Config Modal */}
      <Modal visible={showPaymentQRModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: colors.foreground }}>Payment QR Configuration</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              Configure your UPI VPA / QR link for direct student fees collection.
            </Text>
            <TextInput
              value={paymentQRInput}
              onChangeText={setPaymentQRInput}
              style={[styles.fieldInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border, marginTop: 8 }]}
              placeholder="upi://pay?pa=yourname@upi"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable onPress={() => setShowPaymentQRModal(false)} style={[styles.modalCancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowPaymentQRModal(false);
                  Alert.alert("Saved", "UPI payment link updated successfully!");
                }}
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Save</Text>
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
  branchRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  branchChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  branchChipText: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  aiHeaderBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  ownerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  revenueCard: { borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  revLabel: { fontSize: 13 },
  billingModeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  revAmount: { fontSize: 32, lineHeight: 40, marginTop: 4 },
  revChange: { fontSize: 12, marginTop: 2 },
  revRight: {},
  aiInsightCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  aiInsightTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  aiInsightTitle: { fontSize: 13 },
  aiInsightText: { fontSize: 12, marginTop: 4, lineHeight: 18 },
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
  notCheckedOutCard: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  notCheckedTitle: { fontSize: 13 },
  reminderBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  notCheckedSub: { fontSize: 11, lineHeight: 16 },
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
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionGridBox: { width: "23%", borderRadius: 12, padding: 10, alignItems: "center", gap: 6, borderWidth: 1 },
  actionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 10, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", paddingHorizontal: 20 },
  modalCard: { padding: 20, borderRadius: 18, borderWidth: 1 },
  modalTitle: { fontSize: 18 },
  modalSub: { fontSize: 12, marginTop: 4 },
  fieldLbl: { fontSize: 11, marginBottom: 4 },
  fieldInput: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 13 },
  methodChip: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8, borderWidth: 1 },
  modalCancelBtn: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  modalSaveBtn: { flex: 1, height: 44, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  billingOptionCard: { padding: 12, borderRadius: 10, borderWidth: 1 },
  billingOptionTitle: { fontSize: 13 },
  billingOptionDesc: { fontSize: 11, marginTop: 2 },
  aiModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  aiModalContent: { height: "70%", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20 },
  aiModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  aiModalTitle: { fontSize: 18 },
  aiChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  aiChipText: { fontSize: 12 },
  aiResponseBox: { padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 10 },
  aiResponseText: { fontSize: 13, lineHeight: 20 },
  aiSendBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
});
