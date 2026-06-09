import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function OwnerTabs() {
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
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />,
      }} />
      <Tabs.Screen name="seats" options={{
        title: "Seats",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="grid" size={24} color={color} />,
      }} />
      <Tabs.Screen name="students" options={{
        title: "Students",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={24} color={color} />,
      }} />
      <Tabs.Screen name="analytics" options={{
        title: "Analytics",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-line" size={24} color={color} />,
      }} />
    </Tabs>
  );
}

export default function OwnerLayout() {
  const { user } = useAuth();
  if (!user || user.role !== "owner") return <Redirect href="/" />;
  return <OwnerTabs />;
}
