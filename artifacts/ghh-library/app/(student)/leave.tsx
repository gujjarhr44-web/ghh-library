import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return {
    label: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toISOString().split("T")[0],
    day: d.getDate(),
  };
});

export default function LeaveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { leaves, addLeave, cancelLeave } = useData();
  const [selected, setSelected] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  const handleMarkLeave = () => {
    if (!selected) { Alert.alert("Select a date", "Please select a date for the leave."); return; }
    Alert.alert(
      "Confirm Leave",
      `Mark leave for ${selected}? Your credit will be saved for this day.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            addLeave(selected);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSelected(null);
            Alert.alert("Leave Marked", "Credit saved! Your leave has been marked.");
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
    >
      <View style={[styles.headerRow, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Mark Leave
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.infoBox, { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.muted, borderColor: colors.border }]}>
        <MaterialCommunityIcons name="information-outline" size={16} color={colors.info} />
        <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          Mark leave before the cutoff time. Credits are only saved when leave is marked in advance. Your leave must be marked before 11:00 PM the previous night.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
          Select Date
        </Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          Next 7 days available for leave
        </Text>
        <View style={styles.dateGrid}>
          {DATES.map(d => {
            const isSelected = selected === d.date;
            const alreadyMarked = leaves.some(l => l.date === d.date);
            return (
              <Pressable
                key={d.date}
                style={[
                  styles.dateCard,
                  {
                    backgroundColor: isSelected ? colors.primary : alreadyMarked ? colors.muted : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    opacity: alreadyMarked ? 0.6 : 1,
                  },
                ]}
                onPress={() => !alreadyMarked && setSelected(d.date)}
                disabled={alreadyMarked}
              >
                <Text style={[styles.dateDay, { color: isSelected ? "#fff" : colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  {d.label}
                </Text>
                <Text style={[styles.dateNum, { color: isSelected ? "#fff" : colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                  {d.day}
                </Text>
                {alreadyMarked && (
                  <MaterialCommunityIcons name="check" size={12} color={colors.success} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.markBtn,
          { marginHorizontal: 20, marginTop: 20, backgroundColor: selected ? colors.primary : colors.muted, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={handleMarkLeave}
        disabled={!selected}
      >
        <MaterialCommunityIcons name="calendar-check" size={20} color={selected ? "#fff" : colors.mutedForeground} />
        <Text style={[styles.markBtnText, { color: selected ? "#fff" : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
          Mark Leave & Save Credit
        </Text>
      </Pressable>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
          Leave History
        </Text>
        <View style={{ gap: 10, marginTop: 10 }}>
          {leaves.map(l => (
            <View key={l.id} style={[styles.leaveCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.leaveDateBox, { backgroundColor: colors.success + "20" }]}>
                <MaterialCommunityIcons name="calendar" size={18} color={colors.success} />
              </View>
              <View style={styles.leaveInfo}>
                <Text style={[styles.leaveDate, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {l.date}
                </Text>
                <Text style={[styles.leaveStatus, { color: colors.success, fontFamily: "Poppins_400Regular" }]}>
                  {l.status} · Credit saved
                </Text>
              </View>
              {l.status === "approved" && (
                <Pressable
                  style={[styles.cancelBtn, { backgroundColor: colors.destructive + "20" }]}
                  onPress={() => cancelLeave(l.id)}
                >
                  <MaterialCommunityIcons name="close" size={14} color={colors.destructive} />
                </Pressable>
              )}
            </View>
          ))}
          {leaves.length === 0 && (
            <View style={styles.emptyLeave}>
              <MaterialCommunityIcons name="calendar-blank" size={40} color={colors.border} />
              <Text style={[styles.emptyLeaveText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                No leave history
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageTitle: { fontSize: 22 },
  infoBox: { borderRadius: 12, padding: 14, borderWidth: 1, flexDirection: "row", gap: 10 },
  infoText: { fontSize: 13, flex: 1, lineHeight: 20 },
  sectionTitle: { fontSize: 17, marginBottom: 4 },
  sectionSub: { fontSize: 13, marginBottom: 12 },
  dateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dateCard: { width: 74, alignItems: "center", borderRadius: 14, padding: 12, borderWidth: 1, gap: 4 },
  dateDay: { fontSize: 12 },
  dateNum: { fontSize: 20 },
  markBtn: { height: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  markBtnText: { fontSize: 15 },
  leaveCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1, gap: 12 },
  leaveDateBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  leaveInfo: { flex: 1 },
  leaveDate: { fontSize: 14 },
  leaveStatus: { fontSize: 12, marginTop: 2 },
  cancelBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  emptyLeave: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyLeaveText: { fontSize: 14 },
});
