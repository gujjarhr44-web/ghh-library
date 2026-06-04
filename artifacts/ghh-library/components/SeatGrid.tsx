import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Seat } from "@/context/DataContext";

interface SeatGridProps {
  seats: Seat[];
  selectable?: boolean;
  onSelect?: (seat: Seat) => void;
  selectedId?: string;
}

const SEAT_LEGEND = [
  { color: "#10B981", label: "Available" },
  { color: "#F59E0B", label: "Reserved" },
  { color: "#EF4444", label: "Occupied" },
  { color: "#64748B", label: "Maintenance" },
];

export function SeatGrid({ seats, selectable, onSelect, selectedId }: SeatGridProps) {
  const colors = useColors();
  const rows = Array.from(new Set(seats.map(s => s.row))).sort();

  const getSeatColor = (seat: Seat) => {
    if (selectedId === seat.id) return colors.info;
    if (seat.status === "available") return "#10B981";
    if (seat.status === "reserved") return "#F59E0B";
    if (seat.status === "occupied") return "#EF4444";
    return "#64748B";
  };

  return (
    <View>
      <View style={styles.legend}>
        {SEAT_LEGEND.map(l => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {l.label}
            </Text>
          </View>
        ))}
      </View>
      <View style={[styles.stage, { backgroundColor: colors.muted }]}>
        <Text style={[styles.stageText, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
          ENTRANCE / RECEPTION
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {rows.map(row => (
            <View key={row} style={styles.gridRow}>
              <Text style={[styles.rowLabel, { color: colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
                {row}
              </Text>
              {seats.filter(s => s.row === row).sort((a, b) => a.col - b.col).map(seat => (
                <TouchableOpacity
                  key={seat.id}
                  style={[
                    styles.seat,
                    {
                      backgroundColor: getSeatColor(seat),
                      opacity: selectable && seat.status !== "available" ? 0.5 : 1,
                      borderWidth: selectedId === seat.id ? 2 : 0,
                      borderColor: colors.foreground,
                    },
                  ]}
                  onPress={() => selectable && seat.status === "available" && onSelect?.(seat)}
                  disabled={!selectable || seat.status !== "available"}
                >
                  <Text style={styles.seatNum}>{seat.col}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
  },
  stage: {
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  stageText: {
    fontSize: 11,
    letterSpacing: 1,
  },
  grid: {
    gap: 8,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowLabel: {
    width: 18,
    fontSize: 12,
    textAlign: "center",
  },
  seat: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  seatNum: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
