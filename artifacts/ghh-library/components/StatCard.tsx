import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  iconName: string;
  iconColor?: string;
  trend?: string;
  trendUp?: boolean;
  compact?: boolean;
}

export function StatCard({ label, value, iconName, iconColor, trend, trendUp, compact }: StatCardProps) {
  const colors = useColors();
  const ic = iconColor ?? colors.primary;

  return (
    <View style={[styles.card, compact && styles.compact, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: ic + "20" }]}>
        <MaterialCommunityIcons name={iconName as any} size={compact ? 18 : 22} color={ic} />
      </View>
      <Text style={[styles.value, compact && styles.valueCompact, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]} numberOfLines={1}>
        {label}
      </Text>
      {trend ? (
        <Text style={[styles.trend, { color: trendUp ? colors.success : colors.destructive, fontFamily: "Poppins_500Medium" }]}>
          {trendUp ? "+" : ""}{trend}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 6,
    minWidth: 100,
  },
  compact: {
    padding: 10,
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
  },
  valueCompact: {
    fontSize: 18,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
  trend: {
    fontSize: 11,
    fontWeight: "600",
  },
});
