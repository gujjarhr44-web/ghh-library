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

function NativeAdminTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="overview">
        <Icon sf={{ default: "square.grid.2x2", selected: "square.grid.2x2.fill" }} />
        <Label>Overview</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="libraries">
        <Icon sf={{ default: "building.2", selected: "building.2.fill" }} />
        <Label>Libraries</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="users">
        <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
        <Label>Users</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="revenue">
        <Icon sf={{ default: "indianrupeesign.circle", selected: "indianrupeesign.circle.fill" }} />
        <Label>Revenue</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicAdminTabs() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#A78BFA",
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
      <Tabs.Screen name="overview" options={{
        title: "Overview",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="square.grid.2x2" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="view-dashboard-variant" size={24} color={color} />,
      }} />
      <Tabs.Screen name="libraries" options={{
        title: "Libraries",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="building.2" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="office-building-marker" size={24} color={color} />,
      }} />
      <Tabs.Screen name="users" options={{
        title: "Users",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="person.3" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="account-multiple" size={24} color={color} />,
      }} />
      <Tabs.Screen name="revenue" options={{
        title: "Revenue",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="indianrupeesign.circle" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="currency-inr" size={24} color={color} />,
      }} />
    </Tabs>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Redirect href="/" />;
  if (isLiquidGlassAvailable()) return <NativeAdminTabs />;
  return <ClassicAdminTabs />;
}
