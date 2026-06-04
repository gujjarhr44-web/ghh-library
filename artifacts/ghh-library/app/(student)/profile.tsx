import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  { icon: "book-open-variant", label: "My Library", desc: "GHH Central Library" },
  { icon: "seat", label: "My Seat", desc: "A-12 · Morning Shift" },
  { icon: "calendar-month", label: "Leave History", desc: "View past leaves" },
  { icon: "bell-outline", label: "Notifications", desc: "Fee reminders, alerts" },
  { icon: "help-circle-outline", label: "Help & Support", desc: "FAQs, contact us" },
  { icon: "information-outline", label: "About GHH Library", desc: "Version 1.0.0" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { wallet, streak, achievements } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const unlocked = achievements.filter(a => a.unlocked).length;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await logout(); router.replace("/"); } },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Profile
        </Text>
      </View>

      <View style={[styles.profileCard, { marginHorizontal: 20, marginTop: 8, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "25" }]}>
          <MaterialCommunityIcons name="account" size={36} color={colors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            {user?.name}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {user?.email}
          </Text>
          <Text style={[styles.profilePhone, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {user?.phone}
          </Text>
        </View>
        <Pressable style={[styles.editBtn, { backgroundColor: colors.muted }]}>
          <MaterialCommunityIcons name="pencil" size={16} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={[styles.statsRow, { marginHorizontal: 20, marginTop: 12, gap: 10 }]}>
        {[
          { label: "Streak", value: `${streak}d`, icon: "fire", color: colors.primary },
          { label: "Attended", value: wallet.consumed, icon: "check-circle", color: colors.success },
          { label: "Credits", value: wallet.available, icon: "wallet", color: colors.info },
          { label: "Badges", value: unlocked, icon: "medal", color: "#A78BFA" },
        ].map(s => (
          <View key={s.label} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
            <MaterialCommunityIcons name={s.icon as any} size={18} color={s.color} />
            <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.referralRow, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <View>
          <Text style={[styles.referralTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Your Referral Code
          </Text>
          <Text style={[styles.referralDesc, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Invite friends, earn 5 credits each
          </Text>
        </View>
        <View style={[styles.referralCode, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.referralCodeText, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
            {user?.referralCode}
          </Text>
        </View>
      </View>

      <View style={{ marginHorizontal: 20, marginTop: 20, gap: 2 }}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium", marginBottom: 8 }]}>
          ACCOUNT
        </Text>
        {MENU_ITEMS.map((item, i) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              styles.menuItem,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderTopLeftRadius: i === 0 ? 14 : 4,
                borderTopRightRadius: i === 0 ? 14 : 4,
                borderBottomLeftRadius: i === MENU_ITEMS.length - 1 ? 14 : 4,
                borderBottomRightRadius: i === MENU_ITEMS.length - 1 ? 14 : 4,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.muted }]}>
              <MaterialCommunityIcons name={item.icon as any} size={18} color={colors.foreground} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                {item.label}
              </Text>
              <Text style={[styles.menuDesc, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {item.desc}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.logoutBtn,
          { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.destructive + "20", borderColor: colors.destructive + "40", opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Poppins_600SemiBold" }]}>
          Sign Out
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {},
  pageTitle: { fontSize: 26 },
  profileCard: { borderRadius: 16, padding: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 18 },
  profileEmail: { fontSize: 13 },
  profilePhone: { fontSize: 13 },
  editBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row" },
  statBox: { borderRadius: 14, padding: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  statVal: { fontSize: 18 },
  statLbl: { fontSize: 11 },
  referralRow: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  referralTitle: { fontSize: 14 },
  referralDesc: { fontSize: 12, marginTop: 2 },
  referralCode: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  referralCodeText: { fontSize: 15, letterSpacing: 1 },
  sectionTitle: { fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, borderWidth: 1, marginBottom: 1, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15 },
  menuDesc: { fontSize: 12, marginTop: 1 },
  logoutBtn: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1 },
  logoutText: { fontSize: 16 },
});
