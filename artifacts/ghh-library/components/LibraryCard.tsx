import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Library } from "@/context/DataContext";

interface LibraryCardProps {
  library: Library;
}

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

export function LibraryCard({ library }: LibraryCardProps) {
  const colors = useColors();
  const occupancyColor =
    library.occupancyRate > 80 ? colors.destructive :
    library.occupancyRate > 60 ? colors.primary :
    colors.success;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
      onPress={() => router.push(`/(student)/library/${library.id}` as any)}
    >
      <View style={styles.header}>
        <View style={[styles.logoBox, { backgroundColor: colors.primary + "20" }]}>
          <MaterialCommunityIcons name="book-open-variant" size={26} color={colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={1}>
              {library.name}
            </Text>
            {library.isVerified && (
              <MaterialCommunityIcons name="check-decagram" size={16} color={colors.info} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={[styles.area, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {library.area}, {library.city}
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color={colors.primary} />
            <Text style={[styles.ratingText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
              {library.rating}
            </Text>
            <Text style={[styles.dot, { color: colors.mutedForeground }]}>•</Text>
            <View style={[styles.statusDot, { backgroundColor: library.isOpen ? colors.success : colors.destructive }]} />
            <Text style={[styles.statusText, { color: library.isOpen ? colors.success : colors.destructive, fontFamily: "Poppins_400Regular" }]}>
              {library.isOpen ? "Open" : "Closed"}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.seatRow}>
        <View style={styles.seatInfo}>
          <Text style={[styles.seatCount, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            {library.availableSeats}
          </Text>
          <Text style={[styles.seatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            seats free
          </Text>
        </View>
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${library.occupancyRate}%` as any, backgroundColor: occupancyColor },
              ]}
            />
          </View>
          <Text style={[styles.occupancy, { color: occupancyColor, fontFamily: "Poppins_500Medium" }]}>
            {library.occupancyRate}% full
          </Text>
        </View>
      </View>

      <View style={styles.facilities}>
        {library.facilities.slice(0, 4).map(f => (
          <View key={f} style={[styles.facilityChip, { backgroundColor: colors.muted }]}>
            <MaterialCommunityIcons name={FACILITY_ICONS[f] as any ?? "check"} size={11} color={colors.mutedForeground} />
            <Text style={[styles.facilityText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {f}
            </Text>
          </View>
        ))}
        {library.facilities.length > 4 && (
          <View style={[styles.facilityChip, { backgroundColor: colors.muted }]}>
            <Text style={[styles.facilityText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              +{library.facilities.length - 4}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.planRow}>
        <Text style={[styles.planLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          From
        </Text>
        <Text style={[styles.planPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
          ₹{Math.min(...library.plans.map(p => p.price))}
        </Text>
        <Text style={[styles.planCredits, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          / 15 credits
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    flex: 1,
  },
  area: {
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
  },
  dot: {
    fontSize: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
  },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  seatInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  seatCount: {
    fontSize: 20,
  },
  seatLabel: {
    fontSize: 12,
  },
  progressWrap: {
    flex: 1,
    gap: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  occupancy: {
    fontSize: 11,
    textAlign: "right",
  },
  facilities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  facilityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  facilityText: {
    fontSize: 11,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  planLabel: {
    fontSize: 12,
  },
  planPrice: {
    fontSize: 18,
  },
  planCredits: {
    fontSize: 12,
  },
});
