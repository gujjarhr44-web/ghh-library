import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Redirect, Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function NativeOwnerTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="dashboard">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="seats">
        <Icon sf={{ default: "rectangle.grid.2x2", selected: "rectangle.grid.2x2.fill" }} />
        <Label>Seats</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="students">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>Students</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="analytics">
        <Icon sf={{ default: "chart.line.uptrend.xyaxis", selected: "chart.line.uptrend.xyaxis" }} />
        <Label>Analytics</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicOwnerTabs() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
        tabBarLabelStyle: { fontFamily: "Poppins_500Medium", fontSize: 10 },
      }}
    >
      <Tabs.Screen name="dashboard" options={{
        title: "Dashboard",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="chart.bar" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />,
      }} />
      <Tabs.Screen name="seats" options={{
        title: "Seats",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="rectangle.grid.2x2" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="grid" size={24} color={color} />,
      }} />
      <Tabs.Screen name="students" options={{
        title: "Students",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="person.2" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="account-group" size={24} color={color} />,
      }} />
      <Tabs.Screen name="analytics" options={{
        title: "Analytics",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="chart.line.uptrend.xyaxis" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="chart-line" size={24} color={color} />,
      }} />
    </Tabs>
  );
}

export default function OwnerLayout() {
  const { user } = useAuth();
  if (!user || user.role !== "owner") return <Redirect href="/" />;
  if (isLiquidGlassAvailable()) return <NativeOwnerTabs />;
  return <ClassicOwnerTabs />;
}
