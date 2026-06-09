import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function StudentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { students } = useData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.seat.includes(search);
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Students
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          {students.filter(s => s.status === "active").length} active students
        </Text>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or seat..."
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
        <View style={styles.filterRow}>
          {(["all", "active", "expired"] as const).map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, {
                backgroundColor: filter === f ? colors.primary : colors.card,
                borderColor: filter === f ? colors.primary : colors.border,
              }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, {
                color: filter === f ? "#fff" : colors.foreground,
                fontFamily: "Poppins_500Medium",
              }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: bottomPad, gap: 10 }}
        scrollEnabled={filtered.length > 0}
        renderItem={({ item: s }) => (
          <Pressable 
            onPress={() => {
              Alert.alert(
                s.name,
                `Seat: ${s.seat}\nShift: ${s.shift}\nCredits remaining: ${s.creditsRemaining}\nStatus: ${s.status}`,
                [
                  {
                    text: "Edit Seat/Shift",
                    onPress: () => {
                      Alert.prompt(
                        "Edit Seat Assignment",
                        `Change seat for ${s.name}:`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Save",
                            onPress: (newSeat) => {
                              if (newSeat && newSeat.trim().length > 0) {
                                Alert.alert("Updated", `Seat changed to ${newSeat} successfully!`);
                              }
                            }
                          }
                        ],
                        "plain-text",
                        s.seat
                      );
                    }
                  },
                  {
                    text: "Expire Plan",
                    style: "destructive",
                    onPress: () => {
                      Alert.alert(
                        "Expire Plan?",
                        `Are you sure you want to expire ${s.name}'s plan?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Yes, Expire",
                            onPress: () => {
                              Alert.alert("Success", "Plan expired successfully. Student status set to Expired.");
                            }
                          }
                        ]
                      );
                    }
                  },
                  { text: "Close", style: "cancel" }
                ]
              );
            }}
            style={({ pressed }) => [styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary + "25" }]}>
              <Text style={[styles.avatarInitial, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                {s.name[0]}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                {s.name}
              </Text>
              <Text style={[styles.studentMeta, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                Seat {s.seat} · {s.shift}
              </Text>
              <View style={styles.creditsRow}>
                <View style={[styles.creditBadge, {
                  backgroundColor: s.creditsRemaining <= 5 ? colors.destructive + "20" : colors.success + "20",
                }]}>
                  <Text style={[styles.creditBadgeText, {
                    color: s.creditsRemaining <= 5 ? colors.destructive : colors.success,
                    fontFamily: "Poppins_600SemiBold",
                  }]}>
                    {s.creditsRemaining} credits
                  </Text>
                </View>
                <Text style={[styles.expiry, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  exp. {s.planExpiry}
                </Text>
              </View>
            </View>
            <View style={styles.studentRight}>
              <View style={[styles.statusBadge, {
                backgroundColor: s.status === "active" ? colors.success + "20" : colors.destructive + "20",
              }]}>
                <Text style={[styles.statusText, {
                  color: s.status === "active" ? colors.success : colors.destructive,
                  fontFamily: "Poppins_500Medium",
                }]}>
                  {s.status}
                </Text>
              </View>
              <Text style={[styles.attendance, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                {s.attendance}%
              </Text>
              <Text style={[styles.attendanceLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                attendance
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-search" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
              No students found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: 2 },
  pageTitle: { fontSize: 26 },
  pageSubtitle: { fontSize: 13 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, height: "100%" },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13 },
  studentCard: { flexDirection: "row", alignItems: "flex-start", borderRadius: 14, padding: 14, borderWidth: 1, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 20 },
  studentInfo: { flex: 1, gap: 4 },
  studentName: { fontSize: 15 },
  studentMeta: { fontSize: 12 },
  creditsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  creditBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  creditBadgeText: { fontSize: 11 },
  expiry: { fontSize: 11 },
  studentRight: { alignItems: "flex-end", gap: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12 },
  attendance: { fontSize: 18 },
  attendanceLabel: { fontSize: 10 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 15 },
});
