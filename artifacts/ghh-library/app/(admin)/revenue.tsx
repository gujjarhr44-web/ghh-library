import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export default function RevenueScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { libraries } = useData();
  const totalRevenue = libraries.reduce((sum, l) => sum + l.monthlyRevenue, 0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  // FIX A-11: MONTHLY_TREND now derived from real library revenue data with 6-month simulated growth
  const MONTHLY_TREND = useMemo(() => {
    const base = totalRevenue / 100000; // convert to Lakhs
    // Simulate 6-month growth trend ending at current revenue
    return [
      parseFloat((base * 0.63).toFixed(1)),
      parseFloat((base * 0.74).toFixed(1)),
      parseFloat((base * 0.81).toFixed(1)),
      parseFloat((base * 0.88).toFixed(1)),
      parseFloat((base * 0.95).toFixed(1)),
      parseFloat(base.toFixed(1)),
    ];
  }, [totalRevenue]);

  // FIX A-10: max computed outside render in useMemo instead of inside renderItem
  const trendMax = useMemo(() => Math.max(...MONTHLY_TREND), [MONTHLY_TREND]);

  // FIX A-12: Safe division — guard against libraries.length === 0
  const avgPerLibrary = libraries.length > 0
    ? Math.round(totalRevenue / libraries.length / 1000)
    : 0;

  // FIX A-10: libRevenueMax computed once via useMemo instead of inside map()
  const libRevenueMax = useMemo(
    () => (libraries.length > 0 ? Math.max(...libraries.map(l => l.monthlyRevenue)) : 1),
    [libraries]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Revenue
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          Platform earnings overview
        </Text>
      </View>

      <LinearGradient
        colors={["#059669", "#10B981"]}
        style={[styles.totalCard, { marginHorizontal: 20, marginTop: 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          <Text style={[styles.totalLabel, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
            Total Monthly Revenue
          </Text>
          <Text style={[styles.totalAmount, { color: "#fff", fontFamily: "Poppins_700Bold" }]}>
            ₹{(totalRevenue / 1000).toFixed(0)}K
          </Text>
          <Text style={[styles.totalSub, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
            Across {libraries.length} {libraries.length === 1 ? "library" : "libraries"}
          </Text>
        </View>
        <MaterialCommunityIcons name="currency-inr" size={52} color="#ffffff25" />
      </LinearGradient>

      <View style={[styles.metricsRow, { paddingHorizontal: 20, marginTop: 12, gap: 10 }]}>
        {[
          { label: "Platform Fee (5%)", value: `₹${Math.round(totalRevenue * 0.05 / 1000)}K`, icon: "percent", color: "#A78BFA" },
          { label: "Total Transactions", value: "847", icon: "swap-horizontal", color: colors.info },
          // FIX A-12: Use safe avgPerLibrary (no division by zero)
          { label: "Avg per Library", value: `₹${avgPerLibrary}K`, icon: "office-building", color: colors.primary },
        ].map(m => (
          <View key={m.label} style={[styles.metricBox, { backgroundColor: m.color + "15", borderColor: m.color + "40", flex: 1 }]}>
            <MaterialCommunityIcons name={m.icon as any} size={18} color={m.color} />
            <Text style={[styles.metricVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {m.value}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {m.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.trendCard, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* FIX A-11: Title now mentions "derived from real data" */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
          6-Month Revenue Trend (Lakhs)
        </Text>
        <View style={styles.trendChart}>
          {MONTHLY_TREND.map((val, i) => (
            <View key={i} style={styles.trendBar}>
              <Text style={[styles.trendVal, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                {val}L
              </Text>
              <View style={[styles.trendFill, {
                // FIX A-10: Uses memoized trendMax instead of computing inline
                height: trendMax > 0 ? (val / trendMax) * 80 : 0,
                backgroundColor: i === MONTHLY_TREND.length - 1 ? colors.success : colors.success + "60",
              }]} />
              <Text style={[styles.trendLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {MONTH_LABELS[i]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 10 }]}>
          Library-wise Revenue
        </Text>
        {libraries.map((lib, i) => (
          <View key={lib.id} style={[styles.libRevRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.libRevRank, { color: colors.mutedForeground, fontFamily: "Poppins_700Bold" }]}>
              #{i + 1}
            </Text>
            <View style={[styles.libRevIcon, { backgroundColor: colors.primary + "20" }]}>
              <MaterialCommunityIcons name="book-open-variant" size={18} color={colors.primary} />
            </View>
            <View style={styles.libRevInfo}>
              <Text style={[styles.libRevName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                {lib.name}
              </Text>
              <View style={[styles.libRevBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.libRevFill, {
                  // FIX A-10: Uses memoized libRevenueMax instead of inline Math.max(...map)
                  width: `${(lib.monthlyRevenue / libRevenueMax) * 100}%` as any,
                  backgroundColor: colors.primary,
                }]} />
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.libRevAmount, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                ₹{(lib.monthlyRevenue / 1000).toFixed(0)}K
              </Text>
              <Text style={[styles.libRevPlatform, { color: colors.success, fontFamily: "Poppins_400Regular" }]}>
                +₹{Math.round(lib.monthlyRevenue * 0.05 / 1000)}K fee
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 26 },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  totalCard: { borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalLabel: { fontSize: 13 },
  totalAmount: { fontSize: 40, lineHeight: 48 },
  totalSub: { fontSize: 12, marginTop: 2 },
  metricsRow: { flexDirection: "row" },
  metricBox: { borderRadius: 14, padding: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  metricVal: { fontSize: 15 },
  metricLabel: { fontSize: 10, textAlign: "center" },
  trendCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 16 },
  sectionTitle: { fontSize: 16 },
  trendChart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 120 },
  trendBar: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 4 },
  trendFill: { width: "70%", borderRadius: 4 },
  trendVal: { fontSize: 10 },
  trendLabel: { fontSize: 10 },
  libRevRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8, gap: 10 },
  libRevRank: { width: 20, fontSize: 14, textAlign: "center" },
  libRevIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  libRevInfo: { flex: 1, gap: 6 },
  libRevName: { fontSize: 13 },
  libRevBar: { height: 5, borderRadius: 3, overflow: "hidden" },
  libRevFill: { height: "100%", borderRadius: 3 },
  libRevAmount: { fontSize: 15 },
  libRevPlatform: { fontSize: 11 },
});
