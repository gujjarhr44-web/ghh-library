import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";

function StudentTabs() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const { settings } = useData();
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
      <Tabs.Screen name="home" options={{
        title: "Discover",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home-variant" size={24} color={color} />,
      }} />
      <Tabs.Screen name="wallet" options={{
        title: "Wallet",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="wallet" size={24} color={color} />,
      }} />
      <Tabs.Screen name="qr" options={{
        title: "Scan",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="qrcode-scan" size={24} color={color} />,
      }} />
      <Tabs.Screen name="rewards" options={{
        title: "Rewards",
        href: settings.showAchievements ? undefined : null,
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="star-circle" size={24} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle" size={24} color={color} />,
      }} />
      <Tabs.Screen name="leave" options={{ href: null }} />
      <Tabs.Screen name="library/[id]" options={{ href: null }} />
    </Tabs>
  );
}

export default function StudentLayout() {
  const { user } = useAuth();
  if (!user || user.role !== "student") return <Redirect href="/" />;
  return <StudentTabs />;
}
