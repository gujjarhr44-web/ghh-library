import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const ROLE_HINTS: Record<UserRole, { email: string; hint: string }> = {
  student: { email: "student@ghh.com", hint: "Try: student@ghh.com / any password" },
  owner: { email: "owner@ghh.com", hint: "Try: owner@ghh.com / any password" },
  admin: { email: "admin@ghh.com", hint: "Try: admin@ghh.com / any password" },
};

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { role = "student" } = useLocalSearchParams<{ role: UserRole }>();

  const [email, setEmail] = useState(ROLE_HINTS[role]?.email ?? "");
  const [password, setPassword] = useState("123456");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    const ok = await login(email.trim().toLowerCase(), password, role as UserRole);
    setLoading(false);
    if (!ok) {
      Alert.alert("Login Failed", "Invalid credentials or wrong role selected.");
      return;
    }
    if (role === "student") router.replace("/(student)/home");
    else if (role === "owner") router.replace("/(owner)/dashboard");
    else router.replace("/(admin)/overview");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
            <MaterialCommunityIcons name="lock-open-variant" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Sign in as <Text style={{ color: colors.primary, fontFamily: "Poppins_600SemiBold" }}>{role}</Text>
          </Text>
        </View>

        <View style={[styles.hintBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="information-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.hintText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {ROLE_HINTS[role as UserRole]?.hint}
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
              Email
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="email-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="Email address"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
              Password
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="lock-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                placeholder="Password"
                placeholderTextColor={colors.mutedForeground}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <MaterialCommunityIcons name={showPw ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity>
            <Text style={[styles.forgot, { color: colors.primary, fontFamily: "Poppins_500Medium" }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.loginBtn,
            { backgroundColor: colors.primary, opacity: pressed || loading ? 0.85 : 1 },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.loginBtnText, { fontFamily: "Poppins_600SemiBold" }]}>
              Sign In
            </Text>
          )}
        </Pressable>

        <View style={styles.registerRow}>
          <Text style={[styles.registerLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: "/(auth)/register", params: { role } })}>
            <Text style={[styles.registerLink, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 20 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  header: { gap: 8, marginTop: 8 },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, marginTop: 4 },
  subtitle: { fontSize: 14 },
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  hintText: { fontSize: 12, flex: 1, lineHeight: 18 },
  form: { gap: 16 },
  fieldLabel: { fontSize: 14, marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15, height: "100%" },
  forgot: { fontSize: 13, alignSelf: "flex-end" },
  loginBtn: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 4 },
  loginBtnText: { fontSize: 16, color: "#fff" },
  registerRow: { flexDirection: "row", justifyContent: "center", gap: 6, alignItems: "center" },
  registerLabel: { fontSize: 14 },
  registerLink: { fontSize: 14 },
});
