import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useData, type Library } from "@/context/DataContext";

interface LibraryCardProps {
  library: Library;
  distanceKm?: number;
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

export function LibraryCard({ library, distanceKm }: LibraryCardProps) {
  const colors = useColors();
  const { openDirections } = useData();

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
            <Text style={[styles.verifiedText, { color: colors.info }]}>GHH Verified</Text>
          </View>
        )}
        <View style={[styles.billingBadge, { backgroundColor: library.billingMode === "membership" ? colors.secondary : colors.primary }]}>
          <Text style={styles.billingBadgeText}>
            {library.billingMode === "membership" ? "Fixed Membership" : "Credit-Based"}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]} numberOfLines={1}>
            {library.name}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Text style={[styles.area, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {library.area}, {library.city}
          </Text>
          {distanceKm !== undefined && (
            <View style={[styles.distBadge, { backgroundColor: colors.primary + "15" }]}>
              <MaterialCommunityIcons name="map-marker-distance" size={12} color={colors.primary} />
              <Text style={[styles.distText, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
                {distanceKm} km
              </Text>
            </View>
          )}
        </View>

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
          </View>

          <TouchableOpacity
            style={[styles.directionBtn, { borderColor: colors.border }]}
            onPress={(e) => {
              e.stopPropagation();
              openDirections(library);
            }}
          >
            <MaterialCommunityIcons name="directions" size={14} color={colors.primary} />
            <Text style={[styles.directionText, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
              Directions
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  imageWrapper: {
    height: 140,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9,
    fontFamily: "Poppins_600SemiBold",
  },
  billingBadge: {
    position: "absolute",
    bottom: 8,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  billingBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  body: {
    padding: 14,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  area: {
    fontSize: 12,
  },
  distBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  distText: {
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
  },
  dot: {
    fontSize: 12,
    marginHorizontal: 2,
  },
  seatsText: {
    fontSize: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  occupancy: {
    fontSize: 10,
    marginTop: 3,
    textAlign: "right",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  facilities: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },
  facilityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  facilityText: {
    fontSize: 10,
  },
  directionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  directionText: {
    fontSize: 11,
  },
});
