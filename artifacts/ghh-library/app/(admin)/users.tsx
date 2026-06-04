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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const ALL_USERS = [
  { id: "1", name: "Arjun Sharma", email: "student@ghh.com", role: "student", status: "active", joined: "Jan 2025" },
  { id: "2", name: "Priya Patel", email: "owner@ghh.com", role: "owner", status: "active", joined: "Nov 2023" },
  { id: "3", name: "Rahul Mehta", email: "admin@ghh.com", role: "admin", status: "active", joined: "Jan 2023" },
  { id: "4", name: "Meera Nair", email: "meera@email.com", role: "student", status: "active", joined: "Feb 2025" },
  { id: "5", name: "Vikram Singh", email: "vikram@lib.com", role: "owner", status: "active", joined: "Aug 2023" },
  { id: "6", name: "Kabir Khan", email: "kabir@email.com", role: "student", status: "active", joined: "Mar 2025" },
  { id: "7", name: "Sneha Reddy", email: "sneha@email.com", role: "student", status: "suspended", joined: "Jan 2025" },
  { id: "8", name: "Ananya Krishnan", email: "ananya@lib.com", role: "owner", status: "active", joined: "Sep 2023" },
];

const ROLE_COLORS: Record<string, string> = {
  student: "#4F8EF7",
  owner: "#F59E0B",
  admin: "#A78BFA",
};

export default function UsersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const filtered = ALL_USERS.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Users
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          {ALL_USERS.length} total users
        </Text>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search users..."
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
        <View style={styles.filterRow}>
          {["all", "student", "owner", "admin"].map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, {
                backgroundColor: roleFilter === f ? (ROLE_COLORS[f] ?? colors.primary) + "20" : colors.card,
                borderColor: roleFilter === f ? (ROLE_COLORS[f] ?? colors.primary) : colors.border,
              }]}
              onPress={() => setRoleFilter(f)}
            >
              <Text style={[styles.filterText, {
                color: roleFilter === f ? (ROLE_COLORS[f] ?? colors.primary) : colors.foreground,
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
        renderItem={({ item: u }) => {
          const rc = ROLE_COLORS[u.role] ?? colors.primary;
          return (
            <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: rc + "20" }]}>
                <Text style={[styles.avatarInitial, { color: rc, fontFamily: "Poppins_700Bold" }]}>
                  {u.name[0]}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {u.name}
                </Text>
                <Text style={[styles.userEmail, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  {u.email}
                </Text>
                <Text style={[styles.userJoined, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Joined {u.joined}
                </Text>
              </View>
              <View style={styles.userRight}>
                <View style={[styles.roleBadge, { backgroundColor: rc + "20" }]}>
                  <Text style={[styles.roleText, { color: rc, fontFamily: "Poppins_600SemiBold" }]}>
                    {u.role}
                  </Text>
                </View>
                <View style={[styles.statusBadge, {
                  backgroundColor: u.status === "active" ? colors.success + "20" : colors.destructive + "20",
                }]}>
                  <Text style={[styles.statusText, {
                    color: u.status === "active" ? colors.success : colors.destructive,
                    fontFamily: "Poppins_500Medium",
                  }]}>
                    {u.status}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
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
  filterRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12 },
  userCard: { flexDirection: "row", alignItems: "flex-start", borderRadius: 14, padding: 14, borderWidth: 1, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 20 },
  userInfo: { flex: 1, gap: 3 },
  userName: { fontSize: 15 },
  userEmail: { fontSize: 12 },
  userJoined: { fontSize: 11 },
  userRight: { alignItems: "flex-end", gap: 6 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12 },
});
