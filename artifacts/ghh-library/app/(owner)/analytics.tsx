import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 80;

const WEEKLY = [28, 34, 30, 38, 42, 35, 40];
const MONTHLY = [140, 160, 155, 170, 185, 178, 192, 205, 198, 188, 210, 220];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const colors = useColors();
  const max = Math.max(...data);
  return (
    <View style={styles.chartWrap}>
      <View style={styles.bars}>
        {data.map((val, i) => (
          <View key={i} style={styles.barItem}>
            <View style={[styles.barFill, {
              height: (val / max) * 100,
              backgroundColor: i === data.length - 1 ? color : color + "80",
              borderRadius: 4,
            }]} />
            <Text style={[styles.barLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {labels[i]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const avg = period === "week"
    ? Math.round(WEEKLY.reduce((a, b) => a + b, 0) / WEEKLY.length)
    : Math.round(MONTHLY.reduce((a, b) => a + b, 0) / MONTHLY.length);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Analytics
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          Attendance & revenue insights
        </Text>
      </View>

      <View style={[styles.summaryRow, { paddingHorizontal: 20, marginTop: 16, gap: 10 }]}>
        {[
          { label: "This Month", value: "₹1.45L", icon: "cash-multiple", color: colors.primary, change: "+12%" },
          { label: "Avg Daily", value: `${avg}`, icon: "account-clock", color: colors.info, change: "+8%" },
          { label: "Occupancy", value: "77%", icon: "seat", color: colors.success, change: "+5%" },
        ].map(s => (
          <View key={s.label} style={[styles.summaryBox, { backgroundColor: s.color + "15", borderColor: s.color + "40", flex: 1 }]}>
            <MaterialCommunityIcons name={s.icon as any} size={18} color={s.color} />
            <Text style={[styles.summaryVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {s.value}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {s.label}
            </Text>
            <Text style={[styles.summaryChange, { color: colors.success, fontFamily: "Poppins_600SemiBold" }]}>
              {s.change}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.chartCard, { marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Attendance Trend
          </Text>
          <View style={[styles.periodToggle, { backgroundColor: colors.muted }]}>
            {(["week", "month"] as const).map(p => (
              <Pressable
                key={p}
                style={[styles.periodBtn, { backgroundColor: period === p ? colors.primary : "transparent" }]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodText, {
                  color: period === p ? "#fff" : colors.mutedForeground,
                  fontFamily: "Poppins_500Medium",
                }]}>
                  {p === "week" ? "Week" : "Month"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <BarChart
          data={period === "week" ? WEEKLY : MONTHLY}
          labels={period === "week" ? DAYS : MONTHS}
          color={colors.primary}
        />
        <View style={styles.chartStats}>
          <View style={styles.chartStat}>
            <Text style={[styles.chartStatVal, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
              {period === "week" ? Math.max(...WEEKLY) : Math.max(...MONTHLY)}
            </Text>
            <Text style={[styles.chartStatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              Peak
            </Text>
          </View>
          <View style={styles.chartStat}>
            <Text style={[styles.chartStatVal, { color: colors.success, fontFamily: "Poppins_700Bold" }]}>
              {avg}
            </Text>
            <Text style={[styles.chartStatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              Average
            </Text>
          </View>
          <View style={styles.chartStat}>
            <Text style={[styles.chartStatVal, { color: colors.info, fontFamily: "Poppins_700Bold" }]}>
              {period === "week" ? Math.min(...WEEKLY) : Math.min(...MONTHLY)}
            </Text>
            <Text style={[styles.chartStatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              Lowest
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.shiftCard, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 12 }]}>
          Shift-wise Occupancy
        </Text>
        {[
          { shift: "Morning (6AM-12PM)", pct: 92, students: 38 },
          { shift: "Afternoon (12PM-6PM)", pct: 65, students: 26 },
          { shift: "Evening (6PM-11PM)", pct: 48, students: 19 },
          { shift: "Full Day", pct: 78, students: 12 },
        ].map(s => (
          <View key={s.shift} style={styles.shiftRow}>
            <View style={styles.shiftInfo}>
              <Text style={[styles.shiftName, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                {s.shift}
              </Text>
              <Text style={[styles.shiftStudents, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {s.students} students
              </Text>
            </View>
            <View style={styles.shiftProgress}>
              <View style={[styles.shiftBar, { backgroundColor: colors.muted }]}>
                <View style={[styles.shiftFill, { width: `${s.pct}%` as any, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.shiftPct, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
                {s.pct}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.revenueCard, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginBottom: 12 }]}>
          Revenue Breakdown
        </Text>
        {[
          { plan: "30 Credits Plan", revenue: 45000, count: 45, color: colors.primary },
          { plan: "60 Credits Plan", revenue: 38000, count: 21, color: colors.info },
          { plan: "15 Credits Plan", revenue: 18000, count: 30, color: colors.success },
          { plan: "Daily Pass", revenue: 8000, count: 40, color: "#A78BFA" },
        ].map(r => (
          <View key={r.plan} style={styles.revenueRow}>
            <View style={[styles.revDot, { backgroundColor: r.color }]} />
            <Text style={[styles.revPlan, { color: colors.foreground, fontFamily: "Poppins_500Medium", flex: 1 }]}>
              {r.plan}
            </Text>
            <Text style={[styles.revCount, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {r.count}x
            </Text>
            <Text style={[styles.revAmount, { color: r.color, fontFamily: "Poppins_700Bold" }]}>
              ₹{(r.revenue / 1000).toFixed(0)}K
            </Text>
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
  summaryRow: { flexDirection: "row" },
  summaryBox: { borderRadius: 14, padding: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  summaryVal: { fontSize: 16 },
  summaryLabel: { fontSize: 10 },
  summaryChange: { fontSize: 11 },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 16 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chartTitle: { fontSize: 16 },
  periodToggle: { flexDirection: "row", borderRadius: 10, padding: 3, gap: 2 },
  periodBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  periodText: { fontSize: 12 },
  chartWrap: { height: 120 },
  bars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 100, gap: 3 },
  barItem: { flex: 1, alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" },
  barFill: { width: "100%", minHeight: 4 },
  barLabel: { fontSize: 9 },
  chartStats: { flexDirection: "row", justifyContent: "space-around" },
  chartStat: { alignItems: "center", gap: 3 },
  chartStatVal: { fontSize: 18 },
  chartStatLabel: { fontSize: 12 },
  shiftCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16 },
  shiftRow: { gap: 8 },
  shiftInfo: { flexDirection: "row", justifyContent: "space-between" },
  shiftName: { fontSize: 13 },
  shiftStudents: { fontSize: 12 },
  shiftProgress: { flexDirection: "row", alignItems: "center", gap: 8 },
  shiftBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  shiftFill: { height: "100%", borderRadius: 3 },
  shiftPct: { width: 36, textAlign: "right", fontSize: 12 },
  revenueCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  revenueRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  revDot: { width: 10, height: 10, borderRadius: 5 },
  revPlan: { fontSize: 13 },
  revCount: { fontSize: 12, marginRight: 4 },
  revAmount: { fontSize: 15 },
});
