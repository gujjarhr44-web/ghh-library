import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function AdminTabs() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // FIX A-13: Use colors.primary instead of hardcoded "#A78BFA" for correct theme support
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
      <Tabs.Screen name="overview" options={{
        title: "Overview",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard-variant" size={24} color={color} />,
      }} />
      <Tabs.Screen name="libraries" options={{
        title: "Libraries",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="office-building-marker" size={24} color={color} />,
      }} />
      <Tabs.Screen name="users" options={{
        title: "Users",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-multiple" size={24} color={color} />,
      }} />
      <Tabs.Screen name="revenue" options={{
        title: "Revenue",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="currency-inr" size={24} color={color} />,
      }} />
    </Tabs>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Redirect href="/" />;
  return <AdminTabs />;
}
