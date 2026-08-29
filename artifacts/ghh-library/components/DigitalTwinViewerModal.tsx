import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../context/ThemeContext";

interface DigitalTwinViewerModalProps {
  visible: boolean;
  onClose: () => void;
  libraryName?: string;
  onSelectSeat?: (seatNumber: string, floorCode: string) => void;
}

const FLOORS = [
  { code: "B1", name: "Basement", capacity: 30, available: 14, zone: "Quiet Study" },
  { code: "G", name: "Ground Floor", capacity: 50, available: 8, zone: "Reception & Hall" },
  { code: "F1", name: "First Floor", capacity: 40, available: 21, zone: "AC Window Zone" },
  { code: "F2", name: "Second Floor", capacity: 30, available: 3, zone: "Cabins & Cubicles" },
  { code: "R", name: "Rooftop", capacity: 20, available: 16, zone: "Open Reading" },
];

export default function DigitalTwinViewerModal({
  visible,
  onClose,
  libraryName = "GHH Central Library",
  onSelectSeat,
}: DigitalTwinViewerModalProps) {
  const colors = useColors();
  const [selectedFloor, setSelectedFloor] = useState("F1");
  const [viewMode, setViewMode] = useState<"2D" | "3D">("2D");
  const [activeFeatureFilter, setActiveFeatureFilter] = useState<string>("All");

  const currentFloor = FLOORS.find((f) => f.code === selectedFloor) || FLOORS[1];

  const handleSeatClick = (seatNumber: string, status: string) => {
    if (status === "occupied") {
      Alert.alert("Seat Occupied", `Seat ${seatNumber} is currently occupied by another student.`);
      return;
    }
    if (status === "reserved") {
      Alert.alert("Seat Reserved", `Seat ${seatNumber} is reserved for the upcoming shift.`);
      return;
    }

    Alert.alert(
      "Confirm Seat Selection 🪑",
      `Seat: ${seatNumber}\nFloor: ${currentFloor.name} (${currentFloor.code})\nZone: ${currentFloor.zone}\nFacilities: AC • WiFi • Charging\n\nDo you want to reserve this seat?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Select & Reserve",
          style: "default",
          onPress: () => {
            if (onSelectSeat) onSelectSeat(seatNumber, currentFloor.code);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                Digital Twin Space Map
              </Text>
              <Text style={[styles.subTitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {libraryName}
              </Text>
            </View>
            {/* 2D / 3D Mode Toggle */}
            <View style={[styles.modeToggle, { backgroundColor: colors.muted }]}>
              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  viewMode === "2D" && { backgroundColor: colors.primary },
                ]}
                onPress={() => setViewMode("2D")}
              >
                <Text style={{ color: viewMode === "2D" ? "#fff" : colors.foreground, fontSize: 11, fontFamily: "Poppins_600SemiBold" }}>
                  2D Map
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  viewMode === "3D" && { backgroundColor: colors.primary },
                ]}
                onPress={() => setViewMode("3D")}
              >
                <Text style={{ color: viewMode === "3D" ? "#fff" : colors.foreground, fontSize: 11, fontFamily: "Poppins_600SemiBold" }}>
                  3D Stack
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Floor Selector Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.floorScroll}>
            {FLOORS.map((fl) => (
              <TouchableOpacity
                key={fl.code}
                style={[
                  styles.floorChip,
                  {
                    backgroundColor: selectedFloor === fl.code ? colors.primary : colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedFloor(fl.code)}
              >
                <Text
                  style={[
                    styles.floorCode,
                    { color: selectedFloor === fl.code ? "#fff" : colors.foreground, fontFamily: "Poppins_700Bold" },
                  ]}
                >
                  {fl.code}
                </Text>
                <Text
                  style={[
                    styles.floorAvail,
                    { color: selectedFloor === fl.code ? "rgba(255,255,255,0.85)" : colors.mutedForeground },
                  ]}
                >
                  {fl.available}/{fl.capacity} free
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Feature Filter Chips */}
          <View style={styles.featureRow}>
            {["All", "🪟 Window", "🤫 Quiet", "🔌 Charging", "❄️ AC"].map((feat) => (
              <TouchableOpacity
                key={feat}
                style={[
                  styles.featChip,
                  {
                    backgroundColor: activeFeatureFilter === feat ? colors.foreground : colors.muted,
                  },
                ]}
                onPress={() => setActiveFeatureFilter(feat)}
              >
                <Text
                  style={{
                    color: activeFeatureFilter === feat ? colors.background : colors.foreground,
                    fontSize: 10,
                    fontFamily: "Poppins_500Medium",
                  }}
                >
                  {feat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Map Body */}
          {viewMode === "2D" ? (
            <ScrollView style={styles.mapContainer}>
              <View style={[styles.zoneHeader, { borderColor: colors.border }]}>
                <Text style={[styles.zoneTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {currentFloor.name} — {currentFloor.zone}
                </Text>
                <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
                  🟢 Available  🔵 Occupied  🟡 Reserved
                </Text>
              </View>

              {/* 2D Desks Grid */}
              <View style={styles.seatGrid}>
                {Array.from({ length: 24 }).map((_, idx) => {
                  const seatNum = `${currentFloor.code}-A${String(idx + 1).padStart(2, "0")}`;
                  const isOccupied = idx % 4 === 0;
                  const isReserved = idx % 9 === 0 && !isOccupied;
                  const status = isOccupied ? "occupied" : isReserved ? "reserved" : "available";

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.seatBox,
                        {
                          backgroundColor:
                            status === "occupied"
                              ? "#3B82F620"
                              : status === "reserved"
                              ? "#F59E0B20"
                              : colors.card,
                          borderColor:
                            status === "occupied"
                              ? "#3B82F6"
                              : status === "reserved"
                              ? "#F59E0B"
                              : "#10B981",
                        },
                      ]}
                      onPress={() => handleSeatClick(seatNum, status)}
                    >
                      <Text style={[styles.seatText, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                        {seatNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            /* 3D Stack View */
            <ScrollView style={styles.mapContainer}>
              {FLOORS.slice().reverse().map((fl) => (
                <TouchableOpacity
                  key={fl.code}
                  style={[
                    styles.stackFloor,
                    {
                      backgroundColor: selectedFloor === fl.code ? colors.primary + "15" : colors.muted,
                      borderColor: selectedFloor === fl.code ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedFloor(fl.code);
                    setViewMode("2D");
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={[styles.stackCode, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                      {fl.code}
                    </Text>
                    <View>
                      <Text style={[styles.stackTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                        {fl.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{fl.zone}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#10B981" }}>
                    {fl.available} Free
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Poppins_500Medium", fontSize: 12 }}>
              Close Space Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    height: "82%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
  },
  subTitle: {
    fontSize: 11,
  },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  modeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  floorScroll: {
    maxHeight: 52,
    marginBottom: 10,
  },
  floorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    alignItems: "center",
  },
  floorCode: {
    fontSize: 13,
  },
  floorAvail: {
    fontSize: 9,
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  featChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mapContainer: {
    flex: 1,
  },
  zoneHeader: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 12,
  },
  zoneTitle: {
    fontSize: 12,
  },
  seatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  seatBox: {
    width: "22%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  seatText: {
    fontSize: 11,
  },
  stackFloor: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stackCode: {
    fontSize: 16,
  },
  stackTitle: {
    fontSize: 13,
  },
  closeBtn: {
    marginTop: 10,
    alignItems: "center",
    padding: 8,
  },
});
