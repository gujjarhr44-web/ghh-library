import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StudentRecord, useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const ROLE_COLORS: Record<string, string> = {
  student: "#4F8EF7",
  owner: "#F59E0B",
  admin: "#A78BFA",
};

// FIX A-07: ALL_USERS now built from DataContext's real student data + supplemented with owner/admin entries
const EXTRA_USERS = [
  { id: "u_owner1", name: "Priya Patel",     email: "owner@ghh.com",   role: "owner",   status: "active",    joined: "Nov 2023" },
  { id: "u_owner2", name: "Vikram Singh",    email: "vikram@lib.com",  role: "owner",   status: "active",    joined: "Aug 2023" },
  { id: "u_owner3", name: "Ananya Krishnan", email: "ananya@lib.com",  role: "owner",   status: "active",    joined: "Sep 2023" },
  { id: "u_admin1", name: "Rahul Mehta",     email: "admin@ghh.com",   role: "admin",   status: "active",    joined: "Jan 2023" },
];

function studentToUser(s: StudentRecord) {
  const year = s.joinDate.split("-")[0];
  const monthIdx = parseInt(s.joinDate.split("-")[1], 10) - 1;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    role: "student" as const,
    status: s.status === "active" ? "active" : "suspended",
    joined: `${months[monthIdx]} ${year}`,
  };
}

export default function UsersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  // FIX A-07: Pull students from DataContext instead of hardcoded array
  const { students } = useData();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  // FIX A-09: Track suspended users locally
  const [suspendedIds, setSuspendedIds] = useState<Set<string>>(
    new Set(students.filter(s => s.status !== "active").map(s => s.id))
  );
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  // Build full user list from real DataContext students + extra owner/admin records
  const allUsers = [
    ...students.map(studentToUser),
    ...EXTRA_USERS,
  ];

  const isSuspended = (id: string) => suspendedIds.has(id);

  // FIX A-09: Toggle suspend/unsuspend action
  const handleToggleSuspend = (user: typeof allUsers[0]) => {
    const suspended = isSuspended(user.id);
    Alert.alert(
      suspended ? "Unsuspend User" : "Suspend User",
      suspended
        ? `Restore access for ${user.name}?`
        : `Are you sure you want to suspend ${user.name}? They will lose access.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: suspended ? "Unsuspend" : "Suspend",
          style: suspended ? "default" : "destructive",
          onPress: () => {
            setSuspendedIds(prev => {
              const next = new Set(prev);
              if (suspended) next.delete(user.id);
              else next.add(user.id);
              return next;
            });
          },
        },
      ]
    );
  };

  const filtered = allUsers.filter(u => {
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
          {allUsers.length} total users
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
        nestedScrollEnabled
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: bottomPad, gap: 10 }}
        renderItem={({ item: u }) => {
          const rc = ROLE_COLORS[u.role] ?? colors.primary;
          const suspended = isSuspended(u.id);
          const effectiveStatus = suspended ? "suspended" : u.status;
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
                {/* FIX A-09: Status badge is now a tappable button for suspend/unsuspend */}
                {u.role !== "admin" && (
                  <Pressable
                    onPress={() => handleToggleSuspend(u)}
                    style={[styles.statusBadge, {
                      backgroundColor: effectiveStatus === "active" ? colors.success + "20" : colors.destructive + "20",
                    }]}
                  >
                    <Text style={[styles.statusText, {
                      color: effectiveStatus === "active" ? colors.success : colors.destructive,
                      fontFamily: "Poppins_500Medium",
                    }]}>
                      {effectiveStatus === "active" ? "active" : "suspended"}
                    </Text>
                  </Pressable>
                )}
                {u.role === "admin" && (
                  <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
                    <Text style={[styles.statusText, { color: colors.success, fontFamily: "Poppins_500Medium" }]}>
                      active
                    </Text>
                  </View>
                )}
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
