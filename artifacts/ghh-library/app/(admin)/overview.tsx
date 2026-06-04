import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function AdminOverview() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { libraries, students } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const totalStudents = students.length * libraries.length;
  const totalRevenue = libraries.reduce((sum, l) => sum + l.monthlyRevenue, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Super Admin
          </Text>
          <Text style={[styles.nameText, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            Platform Overview
          </Text>
        </View>
        <Pressable
          style={[styles.logoutBtn, { backgroundColor: colors.muted }]}
          onPress={async () => { await logout(); router.replace("/"); }}
        >
          <MaterialCommunityIcons name="logout" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <LinearGradient
        colors={["#A78BFA", "#7C3AED"]}
        style={[styles.platformCard, { marginHorizontal: 20, marginTop: 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          <Text style={[styles.platformLabel, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
            Platform Revenue (Monthly)
          </Text>
          <Text style={[styles.platformRevenue, { color: "#fff", fontFamily: "Poppins_700Bold" }]}>
            ₹{(totalRevenue / 1000).toFixed(0)}K
          </Text>
          <Text style={[styles.platformChange, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
            +18% month-over-month
          </Text>
        </View>
        <MaterialCommunityIcons name="shield-crown" size={48} color="#ffffff30" />
      </LinearGradient>

      <View style={[styles.statsGrid, { paddingHorizontal: 20, marginTop: 12, gap: 10 }]}>
        <View style={styles.statsRow}>
          <StatCard label="Total Libraries" value={libraries.length} iconName="office-building" iconColor="#A78BFA" trend="2 this month" trendUp />
          <StatCard label="Total Students" value={totalStudents} iconName="account-group" iconColor={colors.success} trend="15% growth" trendUp />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Active Today" value={Math.round(totalStudents * 0.72)} iconName="account-check" iconColor={colors.info} />
          <StatCard label="Verified Libraries" value={libraries.filter(l => l.isVerified).length} iconName="check-decagram" iconColor={colors.primary} />
        </View>
      </View>

      <View style={[styles.alertCard, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40" }]}>
        <MaterialCommunityIcons name="alert-circle" size={20} color={colors.destructive} />
        <View style={styles.alertInfo}>
          <Text style={[styles.alertTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            1 Library Pending Verification
          </Text>
          <Text style={[styles.alertDesc, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Bright Minds Study Zone · Chennai
          </Text>
        </View>
        <Pressable style={[styles.alertBtn, { backgroundColor: colors.destructive }]}>
          <Text style={[styles.alertBtnText, { fontFamily: "Poppins_600SemiBold" }]}>Review</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 10 }]}>
          Library Performance
        </Text>
        {libraries.map(lib => (
          <View key={lib.id} style={[styles.libRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.libIcon, { backgroundColor: colors.primary + "20" }]}>
              <MaterialCommunityIcons name="book-open-variant" size={20} color={colors.primary} />
            </View>
            <View style={styles.libInfo}>
              <Text style={[styles.libName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                {lib.name}
              </Text>
              <Text style={[styles.libCity, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {lib.city}
              </Text>
              <View style={[styles.libBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.libBarFill, { width: `${lib.occupancyRate}%` as any, backgroundColor: lib.occupancyRate > 80 ? colors.destructive : lib.occupancyRate > 60 ? colors.primary : colors.success }]} />
              </View>
            </View>
            <View style={styles.libRight}>
              <Text style={[styles.libRevenue, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                ₹{(lib.monthlyRevenue / 1000).toFixed(0)}K
              </Text>
              <Text style={[styles.libOcc, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {lib.occupancyRate}%
              </Text>
              {!lib.isVerified && (
                <View style={[styles.pendingBadge, { backgroundColor: colors.destructive + "20" }]}>
                  <Text style={[styles.pendingText, { color: colors.destructive, fontFamily: "Poppins_500Medium" }]}>
                    Pending
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  welcomeText: { fontSize: 13 },
  nameText: { fontSize: 22, marginTop: 2 },
  logoutBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  platformCard: { borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  platformLabel: { fontSize: 13 },
  platformRevenue: { fontSize: 40, lineHeight: 48 },
  platformChange: { fontSize: 12, marginTop: 2 },
  statsGrid: {},
  statsRow: { flexDirection: "row", gap: 10 },
  alertCard: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 14 },
  alertDesc: { fontSize: 12, marginTop: 2 },
  alertBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  alertBtnText: { fontSize: 12, color: "#fff" },
  sectionTitle: { fontSize: 18 },
  libRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, borderWidth: 1, gap: 12, marginBottom: 10 },
  libIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  libInfo: { flex: 1, gap: 4 },
  libName: { fontSize: 14 },
  libCity: { fontSize: 12 },
  libBar: { height: 5, borderRadius: 3, overflow: "hidden", marginTop: 2 },
  libBarFill: { height: "100%", borderRadius: 3 },
  libRight: { alignItems: "flex-end", gap: 4 },
  libRevenue: { fontSize: 16 },
  libOcc: { fontSize: 12 },
  pendingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pendingText: { fontSize: 11 },
});
