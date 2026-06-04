import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SeatGrid } from "@/components/SeatGrid";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const SHIFTS = ["All Shifts", "Morning", "Afternoon", "Evening", "Full Day"];

export default function SeatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { seats } = useData();
  const [selectedShift, setSelectedShift] = useState("All Shifts");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const available = seats.filter(s => s.status === "available").length;
  const reserved = seats.filter(s => s.status === "reserved").length;
  const occupied = seats.filter(s => s.status === "occupied").length;
  const maintenance = seats.filter(s => s.status === "maintenance").length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Seat Management
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          60 seats total
        </Text>
      </View>

      <View style={[styles.statsRow, { paddingHorizontal: 20, marginTop: 16, gap: 10 }]}>
        {[
          { label: "Available", value: available, color: "#10B981" },
          { label: "Reserved", value: reserved, color: "#F59E0B" },
          { label: "Occupied", value: occupied, color: "#EF4444" },
          { label: "Maint.", value: maintenance, color: "#64748B" },
        ].map(s => (
          <View key={s.label} style={[styles.statBox, { backgroundColor: s.color + "15", borderColor: s.color + "40", flex: 1 }]}>
            <Text style={[styles.statVal, { color: s.color, fontFamily: "Poppins_700Bold" }]}>{s.value}</Text>
            <Text style={[styles.statLbl, { color: s.color, fontFamily: "Poppins_400Regular" }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {SHIFTS.map(s => (
          <Pressable
            key={s}
            style={[
              styles.shiftChip,
              { backgroundColor: selectedShift === s ? colors.primary : colors.card, borderColor: selectedShift === s ? colors.primary : colors.border },
            ]}
            onPress={() => setSelectedShift(s)}
          >
            <Text style={[styles.shiftText, {
              color: selectedShift === s ? "#fff" : colors.foreground,
              fontFamily: "Poppins_500Medium",
            }]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.seatMapCard, { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.seatMapHeader}>
          <Text style={[styles.seatMapTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Live Seat Map
          </Text>
          <View style={[styles.liveBadge, { backgroundColor: colors.success + "20" }]}>
            <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.liveText, { color: colors.success, fontFamily: "Poppins_500Medium" }]}>Live</Text>
          </View>
        </View>
        <SeatGrid seats={seats.slice(0, 60)} />
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 10 }]}>
          Seat Actions
        </Text>
        <View style={styles.actionsRow}>
          {[
            { icon: "plus-circle", label: "Add Seat", color: colors.success },
            { icon: "pencil-circle", label: "Edit Layout", color: colors.info },
            { icon: "seat-flat-angled", label: "Daily Pass", color: colors.primary },
            { icon: "tools", label: "Maintenance", color: "#A78BFA" },
          ].map(a => (
            <Pressable key={a.label} style={[styles.actionBtn, { backgroundColor: a.color + "20", borderColor: a.color + "40" }]}>
              <MaterialCommunityIcons name={a.icon as any} size={22} color={a.color} />
              <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 26 },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: "row" },
  statBox: { borderRadius: 12, padding: 10, alignItems: "center", gap: 3, borderWidth: 1 },
  statVal: { fontSize: 20 },
  statLbl: { fontSize: 11 },
  shiftChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  shiftText: { fontSize: 13 },
  seatMapCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  seatMapHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  seatMapTitle: { fontSize: 16 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 12 },
  sectionTitle: { fontSize: 18 },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, flex: 1, minWidth: "45%" },
  actionLabel: { fontSize: 13 },
});
