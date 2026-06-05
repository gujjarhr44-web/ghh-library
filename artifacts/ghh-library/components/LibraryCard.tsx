import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: library.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={[styles.imageBadge, { backgroundColor: library.isOpen ? colors.success : colors.destructive }]}>
          <Text style={styles.imageBadgeText}>{library.isOpen ? "Open" : "Closed"}</Text>
        </View>
        {library.isVerified && (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.card }]}>
            <MaterialCommunityIcons name="check-decagram" size={14} color={colors.info} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={1}>
            {library.name}
          </Text>
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
          <Text style={[styles.seatsText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            <Text style={[{ color: colors.success, fontFamily: "Poppins_600SemiBold" }]}>{library.availableSeats}</Text> seats free
          </Text>
        </View>

        <View style={[styles.progressBar, { backgroundColor: colors.muted, marginTop: 8 }]}>
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

        <View style={styles.bottomRow}>
          <View style={styles.facilities}>
            {library.facilities.slice(0, 3).map(f => (
              <View key={f} style={[styles.facilityChip, { backgroundColor: colors.muted }]}>
                <MaterialCommunityIcons name={FACILITY_ICONS[f] as any ?? "check"} size={11} color={colors.mutedForeground} />
                <Text style={[styles.facilityText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  {f}
                </Text>
              </View>
            ))}
            {library.facilities.length > 3 && (
              <View style={[styles.facilityChip, { backgroundColor: colors.muted }]}>
                <Text style={[styles.facilityText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  +{library.facilities.length - 3}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.planPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
            ₹{Math.min(...library.plans.map(p => p.price))}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  imageBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 14,
    gap: 4,
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
    marginTop: -2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  dot: {
    fontSize: 12,
  },
  seatsText: {
    fontSize: 12,
  },
  progressBar: {
    height: 5,
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
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  facilities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    flex: 1,
  },
  facilityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  facilityText: {
    fontSize: 11,
  },
  planPrice: {
    fontSize: 17,
  },
});
