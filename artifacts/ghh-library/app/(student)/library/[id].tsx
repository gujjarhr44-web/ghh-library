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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SeatGrid } from "@/components/SeatGrid";
import { useData, type Seat } from "@/context/DataContext";
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

export default function LibraryDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getLibrary, seats, settings } = useData();
  const library = getLibrary(id ?? "");

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [tab, setTab] = useState<"seats" | "plans">("seats");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  if (!library) return (
    <View style={[styles.noLib, { backgroundColor: colors.background }]}>
      <MaterialCommunityIcons name="alert-circle" size={40} color={colors.destructive} />
      <Text style={[{ color: colors.foreground, fontFamily: "Poppins_500Medium", fontSize: 16 }]}>Library not found</Text>
      <Pressable onPress={() => router.back()}>
        <Text style={[{ color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>Go Back</Text>
      </Pressable>
    </View>
  );

  const handleBookSeat = () => {
    if (!settings.isBookSeatClickable) {
      Alert.alert("Feature Disabled", "Seat reservation is disabled by the admin.");
      return;
    }
    if (!selectedSeat) { Alert.alert("Select a Seat", "Tap on an available seat to select it."); return; }
    if (!selectedShift) { Alert.alert("Select Shift", "Please select a time shift."); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Seat Reserved!",
      `Seat ${selectedSeat.number} for ${selectedShift} shift has been reserved successfully.`,
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerBar, { paddingTop: topPad + 8, paddingHorizontal: 20, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
          Library Details
        </Text>
        <Pressable>
          <MaterialCommunityIcons name="heart-outline" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
        <View style={styles.heroImageWrapper}>
          <Image
            source={{ uri: library.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={[styles.openBadge, { backgroundColor: library.isOpen ? colors.success : colors.destructive }]}>
            <Text style={styles.openBadgeText}>{library.isOpen ? `Open · until ${library.closeTime}` : "Closed"}</Text>
          </View>
        </View>

        <View style={[styles.heroSection, { paddingHorizontal: 20, paddingTop: 16 }]}>
          <View style={styles.heroInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.libName, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                {library.name}
              </Text>
              {library.isVerified && (
                <MaterialCommunityIcons name="check-decagram" size={18} color={colors.info} />
              )}
            </View>
            <Text style={[styles.libAddress, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {library.address}
            </Text>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
              <Text style={[styles.ratingText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
                {library.rating}
              </Text>
              <Text style={[styles.dot, { color: colors.border }]}>•</Text>
              <MaterialCommunityIcons name="account" size={13} color={colors.mutedForeground} />
              <Text style={[styles.openText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {library.ownerName}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.seatsRow, { marginHorizontal: 20, marginTop: 16, gap: 10 }]}>
          {[
            { label: "Total Seats", value: library.totalSeats, color: colors.info },
            { label: "Available", value: library.availableSeats, color: colors.success },
            { label: "Occupied", value: library.totalSeats - library.availableSeats, color: colors.destructive },
          ].map(s => (
            <View key={s.label} style={[styles.seatStatBox, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
              <Text style={[styles.seatStatVal, { color: s.color, fontFamily: "Poppins_700Bold" }]}>
                {s.value}
              </Text>
              <Text style={[styles.seatStatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {settings.showFacilities && (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 10 }]}>
              Facilities
            </Text>
            <View style={styles.facilityGrid}>
              {library.facilities.map(f => (
                <View key={f} style={[styles.facilityItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name={FACILITY_ICONS[f] as any ?? "check"} size={18} color={colors.primary} />
                  <Text style={[styles.facilityLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                    {f}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.tabToggle, { marginHorizontal: 20, marginTop: 20, backgroundColor: colors.muted }]}>
          {(["seats", "plans"] as const).map(t => (
            <Pressable
              key={t}
              style={[styles.tabBtn, { backgroundColor: tab === t ? colors.primary : "transparent" }]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabBtnText, {
                color: tab === t ? "#fff" : colors.mutedForeground,
                fontFamily: "Poppins_600SemiBold",
              }]}>
                {t === "seats" ? "Seat Map" : "Plans"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "seats" ? (
          <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 16 }}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 10 }]}>
                Select Shift
              </Text>
              <View style={styles.shiftRow}>
                {library.shifts.map(s => (
                  <Pressable
                    key={s.id}
                    style={[
                      styles.shiftChip,
                      {
                        backgroundColor: selectedShift === s.name ? colors.primary : colors.card,
                        borderColor: selectedShift === s.name ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedShift(s.name)}
                  >
                    <Text style={[styles.shiftName, {
                      color: selectedShift === s.name ? "#fff" : colors.foreground,
                      fontFamily: "Poppins_600SemiBold",
                    }]}>
                      {s.name}
                    </Text>
                    <Text style={[styles.shiftTime, {
                      color: selectedShift === s.name ? "#fff9" : colors.mutedForeground,
                      fontFamily: "Poppins_400Regular",
                    }]}>
                      {s.startTime}–{s.endTime}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 10 }]}>
                Select Seat
              </Text>
              <SeatGrid
                seats={seats.slice(0, 30)}
                selectable
                onSelect={setSelectedSeat}
                selectedId={selectedSeat?.id}
              />
            </View>

            {selectedSeat && (
              <View style={[styles.selectedInfo, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
                <MaterialCommunityIcons name="seat" size={20} color={colors.primary} />
                <Text style={[styles.selectedText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                  Seat <Text style={{ color: colors.primary, fontFamily: "Poppins_700Bold" }}>{selectedSeat.number}</Text> selected
                  {selectedShift ? ` · ${selectedShift}` : ""}
                </Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.bookBtn,
                { 
                  backgroundColor: !settings.isBookSeatClickable ? colors.border : colors.primary, 
                  opacity: pressed && settings.isBookSeatClickable ? 0.85 : 1 
                },
              ]}
              onPress={handleBookSeat}
              disabled={!settings.isBookSeatClickable}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color={settings.isBookSeatClickable ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.bookBtnText, { color: settings.isBookSeatClickable ? "#fff" : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
                {!settings.isBookSeatClickable ? "Seat Booking Disabled" : "Reserve Seat"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
            {library.plans.map(plan => (
              <Pressable
                key={plan.id}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: plan.popular ? colors.primary + "15" : colors.card,
                    borderColor: selectedPlan === plan.id ? colors.primary : plan.popular ? colors.primary + "60" : colors.border,
                    borderWidth: selectedPlan === plan.id ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <View style={[styles.popularTag, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.popularTagText, { fontFamily: "Poppins_600SemiBold" }]}>POPULAR</Text>
                  </View>
                )}
                <View style={styles.planRow}>
                  <View>
                    <Text style={[styles.planCredits, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                      {plan.credits} Credits
                    </Text>
                    <Text style={[styles.planValidity, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                      Valid {plan.validity} days
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.planPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                      ₹{plan.price}
                    </Text>
                    <Text style={[styles.perCredit, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                      ₹{Math.round(plan.price / plan.credits)}/credit
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [
                styles.bookBtn,
                { 
                  backgroundColor: !settings.isPurchasePlanClickable ? colors.border : colors.primary, 
                  opacity: pressed && settings.isPurchasePlanClickable ? 0.85 : 1, 
                  marginTop: 4 
                },
              ]}
              onPress={() => {
                if (!settings.isPurchasePlanClickable) {
                  Alert.alert("Feature Disabled", "Purchasing plans is disabled by the admin.");
                  return;
                }
                Alert.alert("Payment", "Payment gateway integration coming soon!");
              }}
              disabled={!settings.isPurchasePlanClickable}
            >
              <MaterialCommunityIcons name="credit-card" size={20} color={settings.isPurchasePlanClickable ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.bookBtnText, { color: settings.isPurchasePlanClickable ? "#fff" : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
                {!settings.isPurchasePlanClickable ? "Plan Purchase Disabled" : "Buy Credits"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  noLib: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  headerBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17 },
  heroImageWrapper: { position: "relative", height: 200, width: "100%" },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.15)" },
  openBadge: { position: "absolute", bottom: 12, left: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  openBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  heroSection: { gap: 4 },
  heroInfo: { gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  libName: { fontSize: 17, flex: 1 },
  libAddress: { fontSize: 13 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingText: { fontSize: 13 },
  dot: { fontSize: 12 },
  openDot: { width: 6, height: 6, borderRadius: 3 },
  openText: { fontSize: 12 },
  seatsRow: { flexDirection: "row" },
  seatStatBox: { borderRadius: 12, padding: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  seatStatVal: { fontSize: 22 },
  seatStatLabel: { fontSize: 11 },
  sectionTitle: { fontSize: 16 },
  facilityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  facilityItem: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  facilityLabel: { fontSize: 13 },
  tabToggle: { flexDirection: "row", borderRadius: 14, padding: 4, gap: 4 },
  tabBtn: { flex: 1, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  tabBtnText: { fontSize: 14 },
  shiftRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shiftChip: { borderRadius: 12, padding: 10, borderWidth: 1, minWidth: 100 },
  shiftName: { fontSize: 14 },
  shiftTime: { fontSize: 11, marginTop: 2 },
  selectedInfo: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  selectedText: { fontSize: 14, flex: 1 },
  bookBtn: { height: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  bookBtnText: { fontSize: 16, color: "#fff" },
  planCard: { borderRadius: 16, padding: 16, overflow: "hidden" },
  popularTag: { position: "absolute", top: 0, right: 0, paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 10 },
  popularTagText: { fontSize: 10, color: "#fff" },
  planRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planCredits: { fontSize: 18 },
  planValidity: { fontSize: 12, marginTop: 2 },
  planPrice: { fontSize: 22 },
  perCredit: { fontSize: 11 },
});
