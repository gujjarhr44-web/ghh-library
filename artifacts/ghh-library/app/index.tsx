import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const ROLES: { role: UserRole; label: string; desc: string; icon: string; color: string }[] = [
  { role: "student", label: "Student", desc: "Discover & book library seats", icon: "school", color: "#4F8EF7" },
  { role: "owner", label: "Library Owner", desc: "Manage your library & students", icon: "office-building", color: "#F59E0B" },
  { role: "admin", label: "Super Admin", desc: "Platform-wide management", icon: "shield-crown", color: "#A78BFA" },
];

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();
  const { settings } = useData();
  const [selected, setSelected] = useState<UserRole>("student");

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "student") router.replace("/(student)/home");
      else if (user.role === "owner") router.replace("/(owner)/dashboard");
      else router.replace("/(admin)/overview");
    }
  }, [user, isLoading]);

  if (isLoading) return null;

  const handleContinue = () => {
    router.push({ pathname: "/(auth)/login", params: { role: selected } });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + "30", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <View style={[styles.content, { paddingTop: topPad + 32 }]}>
        <View style={styles.brandRow}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#fff" />
          </View>
          <View>
            <Text style={[styles.brand, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {settings.appTitle || "GHH Library"}
            </Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {settings.welcomeSubheading || "Smart Library Management"}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            {settings.welcomeMessage || `Study Smarter,\nPay Only for\nWhat You Attend`}
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Revolutionary Pay-Per-Attendance credit system. No wasted days, full value guaranteed.
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
          Continue as
        </Text>
        <View style={styles.roles}>
          {ROLES.map(r => (
            <Pressable
              key={r.role}
              style={({ pressed }) => [
                styles.roleCard,
                {
                  backgroundColor: selected === r.role ? r.color + "20" : colors.card,
                  borderColor: selected === r.role ? r.color : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={() => setSelected(r.role)}
            >
              <View style={[styles.roleIcon, { backgroundColor: r.color + "20" }]}>
                <MaterialCommunityIcons name={r.icon as any} size={22} color={r.color} />
              </View>
              <View style={styles.roleText}>
                <Text style={[styles.roleLabel, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {r.label}
                </Text>
                <Text style={[styles.roleDesc, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  {r.desc}
                </Text>
              </View>
              {selected === r.role && (
                <MaterialCommunityIcons name="check-circle" size={20} color={r.color} />
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
          ]}
          onPress={handleContinue}
        >
          <Text style={[styles.continueBtnText, { fontFamily: "Poppins_600SemiBold" }]}>
            Continue
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, gap: 20 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  brand: { fontSize: 22 },
  tagline: { fontSize: 12, marginTop: -2 },
  hero: { gap: 8 },
  heroTitle: { fontSize: 32, lineHeight: 42 },
  heroSub: { fontSize: 14, lineHeight: 22 },
  sectionLabel: { fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase" },
  roles: { gap: 10 },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  roleIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  roleText: { flex: 1 },
  roleLabel: { fontSize: 15 },
  roleDesc: { fontSize: 12, marginTop: 1 },
  continueBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  continueBtnText: { fontSize: 16, color: "#fff" },
  footer: { alignItems: "center", paddingHorizontal: 24 },
  footerText: { fontSize: 11, textAlign: "center" },
});
