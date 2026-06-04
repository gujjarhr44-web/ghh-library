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

function NativeStudentTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wallet">
        <Icon sf={{ default: "wallet", selected: "wallet.fill" }} />
        <Label>Wallet</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="qr">
        <Icon sf={{ default: "qrcode", selected: "qrcode" }} />
        <Label>QR</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rewards">
        <Icon sf={{ default: "star.circle", selected: "star.circle.fill" }} />
        <Label>Rewards</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicStudentTabs() {
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
      <Tabs.Screen name="home" options={{
        title: "Discover",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="house" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="home-variant" size={24} color={color} />,
      }} />
      <Tabs.Screen name="wallet" options={{
        title: "Wallet",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="wallet" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="wallet" size={24} color={color} />,
      }} />
      <Tabs.Screen name="qr" options={{
        title: "Scan",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="qrcode" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="qrcode-scan" size={24} color={color} />,
      }} />
      <Tabs.Screen name="rewards" options={{
        title: "Rewards",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="star.circle" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="star-circle" size={24} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        tabBarIcon: ({ color }) => isIOS
          ? <SymbolView name="person.circle" tintColor={color} size={24} />
          : <MaterialCommunityIcons name="account-circle" size={24} color={color} />,
      }} />
      <Tabs.Screen name="leave" options={{ href: null }} />
      <Tabs.Screen name="library/[id]" options={{ href: null }} />
    </Tabs>
  );
}

export default function StudentLayout() {
  const { user } = useAuth();
  if (!user || user.role !== "student") return <Redirect href="/" />;
  if (isLiquidGlassAvailable()) return <NativeStudentTabs />;
  return <ClassicStudentTabs />;
}
