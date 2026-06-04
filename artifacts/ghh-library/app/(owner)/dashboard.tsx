import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
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

const TODAY_ATTENDANCE = [
  { name: "Arjun Sharma", seat: "A-12", shift: "Morning", time: "06:15 AM", status: "in" },
  { name: "Meera Nair", seat: "B-04", shift: "Morning", time: "06:22 AM", status: "in" },
  { name: "Rohan Verma", seat: "A-08", shift: "Full Day", time: "06:05 AM", status: "in" },
  { name: "Pooja Singh", seat: "B-11", shift: "Morning", time: "06:44 AM", status: "in" },
  { name: "Kabir Khan", seat: "C-07", shift: "Afternoon", time: "12:10 PM", status: "in" },
];

export default function OwnerDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { students, libraries } = useData();
  const library = libraries[0];
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const activeStudents = students.filter(s => s.status === "active").length;
  const expiringSoon = students.filter(s => s.creditsRemaining <= 5 && s.status === "active").length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <View>
          <Text style={[styles.welcome, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Library Dashboard
          </Text>
          <Text style={[styles.libName, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            {library?.name}
          </Text>
        </View>
        <View style={[styles.ownerAvatar, { backgroundColor: colors.primary + "25" }]}>
          <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
        </View>
      </View>

      <LinearGradient
        colors={[colors.primary, colors.primary + "BB"]}
        style={[styles.revenueCard, { marginHorizontal: 20, marginTop: 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          <Text style={[styles.revLabel, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
            Monthly Revenue
          </Text>
          <Text style={[styles.revAmount, { color: "#fff", fontFamily: "Poppins_700Bold" }]}>
            ₹{(library?.monthlyRevenue ?? 0).toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.revChange, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
            +12% vs last month
          </Text>
        </View>
        <View style={styles.revRight}>
          <MaterialCommunityIcons name="trending-up" size={40} color="#fff4" />
        </View>
      </LinearGradient>

      <View style={[styles.statsGrid, { paddingHorizontal: 20, marginTop: 12 }]}>
        <View style={styles.statsRow}>
          <StatCard label="Active Students" value={activeStudents} iconName="account-check" iconColor={colors.success} />
          <StatCard label="Today Attendance" value={TODAY_ATTENDANCE.length} iconName="account-clock" iconColor={colors.info} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Available Seats" value={library?.availableSeats ?? 0} iconName="seat" iconColor={colors.primary} />
          <StatCard label="Expiring Soon" value={expiringSoon} iconName="alert-circle" iconColor={colors.destructive} />
        </View>
      </View>

      <View style={[styles.occupancyCard, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.occupancyHeader}>
          <Text style={[styles.occupancyTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Seat Occupancy
          </Text>
          <Text style={[styles.occupancyPct, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
            {library?.occupancyRate}%
          </Text>
        </View>
        <View style={[styles.occupancyBar, { backgroundColor: colors.muted }]}>
          <View style={[styles.occupancyFill, { width: `${library?.occupancyRate ?? 0}%` as any, backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.occupancyStats}>
          <View style={styles.occupancyStat}>
            <View style={[styles.occupancyDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.occupancyStatText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {library?.totalSeats - library?.availableSeats} Occupied
            </Text>
          </View>
          <View style={styles.occupancyStat}>
            <View style={[styles.occupancyDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.occupancyStatText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {library?.availableSeats} Available
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            Today's Attendance
          </Text>
          <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
            {TODAY_ATTENDANCE.length} students
          </Text>
        </View>
        <View style={{ gap: 8, marginTop: 10 }}>
          {TODAY_ATTENDANCE.map((a, i) => (
            <View key={i} style={[styles.attendanceRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.attendanceAvatar, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.attendanceInitial, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                  {a.name[0]}
                </Text>
              </View>
              <View style={styles.attendanceInfo}>
                <Text style={[styles.attendanceName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {a.name}
                </Text>
                <Text style={[styles.attendanceMeta, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Seat {a.seat} · {a.shift}
                </Text>
              </View>
              <View style={styles.attendanceRight}>
                <Text style={[styles.attendanceTime, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                  {a.time}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
                  <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.statusText, { color: colors.success, fontFamily: "Poppins_500Medium" }]}>
                    Present
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginBottom: 10 }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          {[
            { icon: "qrcode-scan", label: "Scan QR", color: colors.info },
            { icon: "account-plus", label: "Add Student", color: colors.success },
            { icon: "seat-outline", label: "Edit Seats", color: colors.primary },
            { icon: "bell-ring-outline", label: "Send Alert", color: "#A78BFA" },
          ].map(a => (
            <View key={a.label} style={[styles.actionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + "20" }]}>
                <MaterialCommunityIcons name={a.icon as any} size={22} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                {a.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  welcome: { fontSize: 13 },
  libName: { fontSize: 20, marginTop: 2 },
  ownerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  revenueCard: { borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  revLabel: { fontSize: 13 },
  revAmount: { fontSize: 36, lineHeight: 44 },
  revChange: { fontSize: 12, marginTop: 2 },
  revRight: {},
  statsGrid: { gap: 10 },
  statsRow: { flexDirection: "row", gap: 10 },
  occupancyCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  occupancyHeader: { flexDirection: "row", justifyContent: "space-between" },
  occupancyTitle: { fontSize: 15 },
  occupancyPct: { fontSize: 15 },
  occupancyBar: { height: 10, borderRadius: 5, overflow: "hidden" },
  occupancyFill: { height: "100%", borderRadius: 5 },
  occupancyStats: { flexDirection: "row", gap: 16 },
  occupancyStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  occupancyDot: { width: 8, height: 8, borderRadius: 4 },
  occupancyStatText: { fontSize: 13 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18 },
  seeAll: { fontSize: 13 },
  attendanceRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1, gap: 12 },
  attendanceAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  attendanceInitial: { fontSize: 18 },
  attendanceInfo: { flex: 1 },
  attendanceName: { fontSize: 14 },
  attendanceMeta: { fontSize: 12, marginTop: 2 },
  attendanceRight: { alignItems: "flex-end", gap: 4 },
  attendanceTime: { fontSize: 13 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBox: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 8, borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, textAlign: "center" },
});
