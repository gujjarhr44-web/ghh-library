import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SeatGrid } from "@/components/SeatGrid";
import { useData, type Seat, type Plan } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const FACILITY_ICONS: Record<string, string> = {
  AC: "air-conditioner",
  WiFi: "wifi",
  Parking: "car",
  CCTV: "cctv",
  "RO Water": "water",
  "Power Backup": "lightning-bolt",
  Cafeteria: "food",
  Locker: "lock",
};

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toISOString().split("T")[0],
    day: d.getDate(),
  };
});

export default function LibraryDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getLibrary, seats, settings, reserveSeat, joinWaitlist, openDirections, buyPlan } = useData();
  const library = getLibrary(id ?? "");

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedShift, setSelectedShift] = useState<string>("s1");
  const [selectedDate, setSelectedDate] = useState<string>(DATES[0].date);
  const [tab, setTab] = useState<"seats" | "plans" | "branches">("seats");
  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  if (!library) {
    return (
      <View style={[styles.noLib, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="alert-circle" size={40} color={colors.destructive} />
        <Text style={[{ color: colors.foreground, fontFamily: "Poppins_500Medium", fontSize: 16 }]}>Library not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[{ color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const currentShiftObj = library.shifts.find((s) => s.id === selectedShift) || library.shifts[0];

  const handleBookSeat = async () => {
    if (!settings.isBookSeatClickable) {
      Alert.alert("Feature Disabled", "Seat reservation is disabled by the admin.");
      return;
    }
    if (!selectedSeat) {
      Alert.alert("Select a Seat", "Please tap on an available seat in the grid below.");
      return;
    }

    const res = await reserveSeat(
      selectedSeat.id,
      selectedSeat.number,
      selectedShift,
      currentShiftObj?.name || "Morning",
      selectedDate,
      currentShiftObj?.startTime || "06:00 AM"
    );

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setBookingMessage(res.message);
      setBookingSuccessModal(true);
    } else {
      Alert.alert("Seat Unavailable", res.message);
    }
  };

  const handleJoinWaitlist = async () => {
    const res = await joinWaitlist(selectedShift, currentShiftObj?.name || "Morning", selectedDate);
    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Waitlist Joined! 🎉",
        `You are #${res.position} in the queue for ${selectedDate} (${currentShiftObj?.name}). You will receive an instant notification when a seat opens up.`
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={1}>
          {library.name}
        </Text>
        <TouchableOpacity onPress={() => openDirections(library)} style={styles.headerBtn}>
          <MaterialCommunityIcons name="directions" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroImageWrapper}>
          <Image source={{ uri: library.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={[styles.billingTag, { backgroundColor: library.billingMode === "membership" ? colors.secondary : colors.primary }]}>
            <Text style={styles.billingTagText}>
              {library.billingMode === "membership" ? "Fixed Membership Model" : "1 Credit = 1 Day/Shift Access"}
            </Text>
          </View>
        </View>

        {/* Library Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={[styles.libraryName, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {library.name}
            </Text>
            {library.isVerified && (
              <View style={[styles.verifiedPill, { backgroundColor: colors.info + "15" }]}>
                <MaterialCommunityIcons name="check-decagram" size={14} color={colors.info} />
                <Text style={[styles.verifiedPillText, { color: colors.info }]}>Verified</Text>
              </View>
            )}
          </View>

          {/* Box-Based Unique Library ID (PIN + Code) */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.primary + "15", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: colors.primary + "30" }}>
              <Text style={{ fontSize: 11, fontFamily: "Poppins_700Bold", color: colors.primary }}>
                {(library as any).pincode || "127306"}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: "Poppins_700Bold", color: colors.mutedForeground }}>-</Text>
              <Text style={{ fontSize: 11, fontFamily: "Poppins_700Bold", color: colors.foreground }}>
                {(library as any).libraryCode || library.id.slice(0, 6).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: colors.border }}
              onPress={() => Alert.alert("Copied! 📋", `Library ID: ${(library as any).pincode || "127306"}-${(library as any).libraryCode || library.id.slice(0, 6).toUpperCase()} copied.`)}
            >
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }}>Copy ID</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.addressText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            📍 {library.address}, {library.city}
          </Text>

          {/* Quick Metrics */}
          <View style={[styles.metricsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                ⭐ {library.rating}
              </Text>
              <Text style={[styles.metricLbl, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Rating</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.success, fontFamily: "Poppins_700Bold" }]}>
                {library.availableSeats}
              </Text>
              <Text style={[styles.metricLbl, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Available</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                {library.totalSeats}
              </Text>
              <Text style={[styles.metricLbl, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Total Seats</Text>
            </View>
          </View>

          {/* Navigation Link Button */}
          <TouchableOpacity
            style={[styles.directionsButton, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}
            onPress={() => openDirections(library)}
          >
            <MaterialCommunityIcons name="google-maps" size={18} color={colors.primary} />
            <Text style={[styles.directionsButtonText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
              Get Directions on Google Maps
            </Text>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
            <Pressable
              style={[styles.tabBtn, tab === "seats" && { backgroundColor: colors.card }]}
              onPress={() => setTab("seats")}
            >
              <Text style={[styles.tabText, { color: tab === "seats" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
                Reserve Seat
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === "plans" && { backgroundColor: colors.card }]}
              onPress={() => setTab("plans")}
            >
              <Text style={[styles.tabText, { color: tab === "plans" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
                Plans & Fees
              </Text>
            </Pressable>
            {library.branches && library.branches.length > 0 && (
              <Pressable
                style={[styles.tabBtn, tab === "branches" && { backgroundColor: colors.card }]}
                onPress={() => setTab("branches")}
              >
                <Text style={[styles.tabText, { color: tab === "branches" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
                  Branches ({library.branches.length})
                </Text>
              </Pressable>
            )}
          </View>

          {/* TAB 1: SEAT RESERVATION */}
          {tab === "seats" && (
            <View style={{ marginTop: 16 }}>
              {/* Date Selector */}
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                1. Select Booking Date
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                {DATES.map((d) => (
                  <Pressable
                    key={d.date}
                    style={[
                      styles.dateChip,
                      {
                        backgroundColor: selectedDate === d.date ? colors.primary : colors.card,
                        borderColor: selectedDate === d.date ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedDate(d.date)}
                  >
                    <Text style={[styles.dateChipLabel, { color: selectedDate === d.date ? "#fff" : colors.mutedForeground }]}>
                      {d.label}
                    </Text>
                    <Text style={[styles.dateChipDay, { color: selectedDate === d.date ? "#fff" : colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                      {d.day}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Shift Selector */}
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginTop: 16 }]}>
                2. Select Study Shift
              </Text>
              <View style={styles.shiftsGrid}>
                {library.shifts.map((shift) => (
                  <Pressable
                    key={shift.id}
                    style={[
                      styles.shiftCard,
                      {
                        backgroundColor: selectedShift === shift.id ? colors.primary + "15" : colors.card,
                        borderColor: selectedShift === shift.id ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedShift(shift.id)}
                  >
                    <Text style={[styles.shiftName, { color: selectedShift === shift.id ? colors.primary : colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                      {shift.name}
                    </Text>
                    <Text style={[styles.shiftTime, { color: colors.mutedForeground }]}>
                      {shift.startTime} - {shift.endTime}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Interactive 2D Seat Grid */}
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginTop: 16 }]}>
                3. Choose Your Seat
              </Text>
              <SeatGrid
                seats={seats}
                selectedSeatId={selectedSeat?.id ?? null}
                onSelectSeat={setSelectedSeat}
              />

              {/* Booking & Waitlist Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.bookBtn, { backgroundColor: colors.primary }]}
                  onPress={handleBookSeat}
                >
                  <MaterialCommunityIcons name="calendar-check" size={20} color="#fff" />
                  <Text style={[styles.bookBtnText, { color: "#fff", fontFamily: "Poppins_600SemiBold" }]}>
                    Reserve Seat {selectedSeat ? `(${selectedSeat.number})` : ""}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.waitlistBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                  onPress={handleJoinWaitlist}
                >
                  <MaterialCommunityIcons name="account-clock" size={18} color={colors.primary} />
                  <Text style={[styles.waitlistBtnText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                    Join Waitlist
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 2: PLANS & BILLING */}
          {tab === "plans" && (
            <View style={{ marginTop: 16 }}>
              {library.plans.map((plan: Plan) => (
                <View
                  key={plan.id}
                  style={[styles.planCard, { backgroundColor: colors.card, borderColor: plan.popular ? colors.primary : colors.border }]}
                >
                  {plan.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.popularBadgeText}>POPULAR</Text>
                    </View>
                  )}
                  <View style={styles.planTop}>
                    <View>
                      <Text style={[styles.planTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                        {plan.name || `${plan.credits} Credits Pack`}
                      </Text>
                      <Text style={[styles.planValidity, { color: colors.mutedForeground }]}>
                        {plan.billingMode === "membership" ? `Unlimited access for ${plan.validity} days` : `${plan.credits} Credits • Valid for ${plan.validity} days`}
                      </Text>
                    </View>
                    <Text style={[styles.planPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                      ₹{plan.price}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.planSelectBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      buyPlan(plan.credits, plan.name || `${plan.credits} Credits`, plan.validity, plan.billingMode || "credit");
                      Alert.alert("Plan Activated! 🎉", `${plan.name || plan.credits + " Credits"} has been added to your wallet.`);
                    }}
                  >
                    <Text style={[styles.planSelectBtnText, { color: "#fff", fontFamily: "Poppins_600SemiBold" }]}>
                      Select & Pay
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: MULTI-BRANCH LOCATIONS */}
          {tab === "branches" && library.branches && (
            <View style={{ marginTop: 16 }}>
              {library.branches.map((b) => (
                <View key={b.id} style={[styles.branchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name="office-building-marker" size={24} color={colors.primary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.branchName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                      {b.name}
                    </Text>
                    <Text style={[styles.branchAddress, { color: colors.mutedForeground }]}>
                      {b.address}, {b.city}
                    </Text>
                    <Text style={[styles.branchSeats, { color: colors.success }]}>
                      {b.totalSeats} Total Seats
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Booking Success Modal */}
      <Modal visible={bookingSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="check-circle" size={54} color={colors.success} />
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              Booking Confirmed!
            </Text>
            <Text style={[styles.modalMessage, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {bookingMessage}
            </Text>
            <Text style={[styles.noShowNotice, { color: colors.warning }]}>
              ⏰ No-Show Policy: Please arrive within 30 minutes of shift start to keep your seat reserved.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={() => setBookingSuccessModal(false)}
            >
              <Text style={[styles.modalBtnText, { color: "#fff", fontFamily: "Poppins_600SemiBold" }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  noLib: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 16, flex: 1, marginHorizontal: 12 },
  heroImageWrapper: { width: "100%", height: 200, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  billingTag: {
    position: "absolute",
    bottom: 12,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  billingTagText: { color: "#fff", fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  infoSection: { padding: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  libraryName: { fontSize: 20, flex: 1 },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedPillText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  addressText: { fontSize: 12, marginTop: 4 },
  metricsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  metricItem: { alignItems: "center" },
  metricVal: { fontSize: 16 },
  metricLbl: { fontSize: 11 },
  metricDivider: { width: 1, height: 24, backgroundColor: "#fff2" },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  directionsButtonText: { fontSize: 13 },
  tabRow: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    marginTop: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabText: { fontSize: 12 },
  sectionTitle: { fontSize: 13, marginBottom: 8 },
  dateScroll: { flexDirection: "row", marginBottom: 8 },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
    alignItems: "center",
  },
  dateChipLabel: { fontSize: 10 },
  dateChipDay: { fontSize: 14 },
  shiftsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shiftCard: {
    width: "48%",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  shiftName: { fontSize: 12 },
  shiftTime: { fontSize: 10, marginTop: 2 },
  actionRow: { marginTop: 16, gap: 10 },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookBtnText: { fontSize: 14 },
  waitlistBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  waitlistBtnText: { fontSize: 13 },
  planCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    right: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Poppins_700Bold" },
  planTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planTitle: { fontSize: 14 },
  planValidity: { fontSize: 11, marginTop: 2 },
  planPrice: { fontSize: 18 },
  planSelectBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  planSelectBtnText: { fontSize: 13 },
  branchCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  branchName: { fontSize: 14 },
  branchAddress: { fontSize: 11, marginTop: 2 },
  branchSeats: { fontSize: 11, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 340,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, marginTop: 12 },
  modalMessage: { fontSize: 13, textAlign: "center", marginTop: 8 },
  noShowNotice: { fontSize: 11, textAlign: "center", marginTop: 12, lineHeight: 16 },
  modalBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 18,
  },
  modalBtnText: { fontSize: 14 },
});
