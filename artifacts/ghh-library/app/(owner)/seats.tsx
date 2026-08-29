import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SeatGrid } from "@/components/SeatGrid";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const SHIFTS = ["All Shifts", "Morning", "Afternoon", "Evening", "Full Day"];

const WAITLIST_MOCK = [
  { id: "wl_1", studentName: "Rohan Verma", shift: "Morning", date: "2024-06-05", position: 1, status: "waiting" },
  { id: "wl_2", studentName: "Pooja Singh", shift: "Morning", date: "2024-06-05", position: 2, status: "waiting" },
  { id: "wl_3", studentName: "Kabir Khan", shift: "Evening", date: "2024-06-05", position: 1, status: "notified" },
];

export default function SeatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { seats } = useData();
  const [selectedShift, setSelectedShift] = useState("All Shifts");
  const [activeTab, setActiveTab] = useState<"grid" | "waitlist" | "noshow">("grid");
  const [noShowPolicyActive, setNoShowPolicyActive] = useState(true);

  // Modal States
  const [showAddSeatModal, setShowAddSeatModal] = useState(false);
  const [newSeatNumber, setNewSeatNumber] = useState("");
  const [showDailyPassModal, setShowDailyPassModal] = useState(false);
  const [dailyPassStudent, setDailyPassStudent] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const available = seats.filter((s) => s.status === "available").length;
  const reserved = seats.filter((s) => s.status === "reserved").length;
  const occupied = seats.filter((s) => s.status === "occupied").length;
  const maintenance = seats.filter((s) => s.status === "maintenance").length;

  const handleAddSeat = () => {
    if (!newSeatNumber.trim()) {
      Alert.alert("Validation Error", "Please enter a seat number.");
      return;
    }
    setShowAddSeatModal(false);
    Alert.alert("Success 🎉", `Seat ${newSeatNumber.trim().toUpperCase()} added successfully to the layout!`);
    setNewSeatNumber("");
  };

  const handleGenerateDailyPass = () => {
    if (!dailyPassStudent.trim()) {
      Alert.alert("Validation Error", "Please enter student name.");
      return;
    }
    setShowDailyPassModal(false);
    Alert.alert("Pass Generated 🎫", `Daily walk-in pass generated for ${dailyPassStudent.trim()} (Seat: D-01).`);
    setDailyPassStudent("");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Seat & Space Manager
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          {seats.length} total seats • Multi-shift availability
        </Text>
      </View>

      {/* Seat Metrics Row */}
      <View style={[styles.statsRow, { paddingHorizontal: 20, marginTop: 14, gap: 8 }]}>
        {[
          { label: "Available", value: available, color: "#10B981" },
          { label: "Reserved", value: reserved, color: "#F59E0B" },
          { label: "Occupied", value: occupied, color: "#EF4444" },
          { label: "Maint.", value: maintenance, color: "#64748B" },
        ].map((s) => (
          <View
            key={s.label}
            style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statValue, { color: s.color, fontFamily: "Poppins_700Bold" }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Segment Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.muted, marginHorizontal: 20, marginTop: 14 }]}>
        <Pressable
          style={[styles.tabBtn, activeTab === "grid" && { backgroundColor: colors.card }]}
          onPress={() => setActiveTab("grid")}
        >
          <Text style={[styles.tabText, { color: activeTab === "grid" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
            2D Seat Matrix
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === "waitlist" && { backgroundColor: colors.card }]}
          onPress={() => setActiveTab("waitlist")}
        >
          <Text style={[styles.tabText, { color: activeTab === "waitlist" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
            Waitlist Queue ({WAITLIST_MOCK.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === "noshow" && { backgroundColor: colors.card }]}
          onPress={() => setActiveTab("noshow")}
        >
          <Text style={[styles.tabText, { color: activeTab === "noshow" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
            No-Show Policy
          </Text>
        </Pressable>
      </View>

      {/* TAB 1: 2D SEAT MATRIX */}
      {activeTab === "grid" && (
        <View>
          {/* Shift Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.shiftScroll}
            contentContainerStyle={styles.shiftContent}
          >
            {SHIFTS.map((shift) => (
              <Pressable
                key={shift}
                style={[
                  styles.shiftChip,
                  {
                    backgroundColor: selectedShift === shift ? colors.primary : colors.card,
                    borderColor: selectedShift === shift ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedShift(shift)}
              >
                <Text
                  style={[
                    styles.shiftText,
                    {
                      color: selectedShift === shift ? "#fff" : colors.mutedForeground,
                      fontFamily: selectedShift === shift ? "Poppins_600SemiBold" : "Poppins_400Regular",
                    },
                  ]}
                >
                  {shift}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Seat Grid */}
          <View style={{ marginTop: 8 }}>
            <SeatGrid seats={seats} selectedSeatId={null} onSelectSeat={() => {}} />
          </View>

          {/* Seat Actions */}
          <View style={[styles.actionsSection, { paddingHorizontal: 20, marginTop: 14 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 10 }]}>
              Layout & Pass Controls
            </Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: "plus-box", label: "Add Seat", color: colors.primary, action: () => setShowAddSeatModal(true) },
                { icon: "ticket-percent", label: "Daily Pass", color: colors.success, action: () => setShowDailyPassModal(true) },
                { icon: "grid", label: "Edit Layout", color: colors.info, action: () => Alert.alert("Edit Layout", "Grid layout editor mode activated!") },
                { icon: "wrench", label: "Maintenance", color: colors.warning, action: () => Alert.alert("Maintenance", "Marked selected seats under maintenance.") },
              ].map((a) => (
                <Pressable
                  key={a.label}
                  onPress={a.action}
                  style={({ pressed }) => [
                    styles.actionBox,
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
        </View>
      )}

      {/* TAB 2: WAITLIST QUEUE */}
      {activeTab === "waitlist" && (
        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 8 }]}>
            Current Waitlist Queue
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, marginBottom: 12 }]}>
            When a seat is released or cancelled, candidate #1 receives a 15-minute claim window.
          </Text>

          {WAITLIST_MOCK.map((w) => (
            <View key={w.id} style={[styles.waitlistCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.waitlistBadge, { backgroundColor: colors.primary }]}>
                <Text style={{ color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 13 }}>#{w.position}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.wlName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {w.studentName}
                </Text>
                <Text style={[styles.wlMeta, { color: colors.mutedForeground }]}>
                  {w.shift} Shift • {w.date}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.notifyBtn, { backgroundColor: w.status === "notified" ? colors.success + "20" : colors.primary }]}
                onPress={() => Alert.alert("Notification Sent", `Seat reservation claim window opened for ${w.studentName}.`)}
              >
                <Text style={{ color: w.status === "notified" ? colors.success : "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 11 }}>
                  {w.status === "notified" ? "Claim Window Open" : "Notify Seat"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* TAB 3: NO-SHOW POLICY */}
      {activeTab === "noshow" && (
        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <View style={[styles.noShowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.noShowTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  Enforce No-Show Policy
                </Text>
                <Text style={[styles.noShowSub, { color: colors.mutedForeground }]}>
                  Automatically release booked seats if student does not check in within 30 minutes.
                </Text>
              </View>
              <Switch value={noShowPolicyActive} onValueChange={setNoShowPolicyActive} trackColor={{ false: colors.muted, true: colors.primary }} />
            </View>

            <View style={[styles.policyDivider, { backgroundColor: colors.border }]} />

            <Text style={[styles.policyRuleTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              Policy Thresholds:
            </Text>
            <Text style={[styles.policyRuleText, { color: colors.mutedForeground }]}>
              • Arrival Grace Period: 30 minutes after shift start{'\n'}
              • Max Allowed No-Shows: 3 times in 30 days{'\n'}
              • Consequence: 7-day temporary advance booking restriction
            </Text>
          </View>
        </View>
      )}

      {/* Add Seat Modal */}
      <Modal visible={showAddSeatModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalHeading, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Add Seat to Layout</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>Enter new seat number label (e.g. E-12):</Text>
            <TextInput
              value={newSeatNumber}
              onChangeText={setNewSeatNumber}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border, marginTop: 10 }]}
              placeholder="e.g. E-12"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable onPress={() => setShowAddSeatModal(false)} style={[styles.btnCancel, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddSeat} style={[styles.btnConfirm, { backgroundColor: colors.primary }]}>
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Add Seat</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Daily Pass Modal */}
      <Modal visible={showDailyPassModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalHeading, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>Generate Daily Walk-in Pass</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>Enter walk-in student's full name:</Text>
            <TextInput
              value={dailyPassStudent}
              onChangeText={setDailyPassStudent}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border, marginTop: 10 }]}
              placeholder="e.g. Suresh Patel"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable onPress={() => setShowDailyPassModal(false)} style={[styles.btnCancel, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleGenerateDailyPass} style={[styles.btnConfirm, { backgroundColor: colors.primary }]}>
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Generate Pass</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 22 },
  pageSubtitle: { fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  statValue: { fontSize: 18 },
  statLabel: { fontSize: 10, marginTop: 1 },
  tabBar: { flexDirection: "row", borderRadius: 10, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabText: { fontSize: 11 },
  shiftScroll: { marginTop: 12 },
  shiftContent: { paddingHorizontal: 20, gap: 8 },
  shiftChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  shiftText: { fontSize: 12 },
  actionsSection: {},
  sectionTitle: { fontSize: 15 },
  actionsGrid: { flexDirection: "row", gap: 10 },
  actionBox: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 6 },
  actionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  actionLabel: { fontSize: 11 },
  waitlistCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  waitlistBadge: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  wlName: { fontSize: 14 },
  wlMeta: { fontSize: 11, marginTop: 2 },
  notifyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  noShowCard: { padding: 16, borderRadius: 14, borderWidth: 1 },
  noShowTitle: { fontSize: 14 },
  noShowSub: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  policyDivider: { height: 1, marginVertical: 14 },
  policyRuleTitle: { fontSize: 13, marginBottom: 6 },
  policyRuleText: { fontSize: 12, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", paddingHorizontal: 20 },
  modalBox: { padding: 20, borderRadius: 18, borderWidth: 1 },
  modalHeading: { fontSize: 17 },
  input: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 13 },
  btnCancel: { flex: 1, height: 42, borderRadius: 8, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  btnConfirm: { flex: 1, height: 42, borderRadius: 8, justifyContent: "center", alignItems: "center" },
});
