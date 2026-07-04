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

type LoginMode = "phone" | "email";

const ROLE_CONFIG: Record<UserRole, { color: string; label: string }> = {
  student: { color: "#4F8EF7", label: "Student" },
  owner: { color: "#F59E0B", label: "Library Owner" },
  admin: { color: "#A78BFA", label: "Super Admin" },
};

// FIX BUG-09: Validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return "Please enter a valid 10-digit mobile number.";
  return null;
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email address.";
  return null;
}

function validatePassword(pw: string): string | null {
  if (!pw) return "Password is required.";
  if (pw.length < 6) return "Password must be at least 6 characters.";
  return null;
}

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, loginWithPhone } = useAuth();
  const { role = "student" } = useLocalSearchParams<{ role: UserRole }>();

  const [mode, setMode] = useState<LoginMode>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const roleConfig = ROLE_CONFIG[role as UserRole] ?? ROLE_CONFIG.student;

  // ── OTP Login ──────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const cleaned = phone.trim().replace(/\s/g, "");
    const err = validatePhone(cleaned);
    if (err) {
      Alert.alert("Invalid Number", err);
      return;
    }
    const phoneWithCode = cleaned.startsWith("+91") ? cleaned : `+91${cleaned}`;
    setLoading(true);
    const result = await loginWithPhone(phoneWithCode, role as UserRole);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.message || "Failed to send OTP. Please try again.");
      return;
    }

    router.push({
      pathname: "/(auth)/otp-verify",
      params: {
        phone: phoneWithCode,
        role,
        ...(result.devOtp ? { devOtp: result.devOtp } : {}),
      },
    });
  };

  // ── Email Login ────────────────────────────────────────────────────────────
  const handleEmailLogin = async () => {
    // FIX BUG-09: Validate inputs before attempting login
    const emailErr = validateEmail(email);
    if (emailErr) { Alert.alert("Invalid Email", emailErr); return; }
    const pwErr = validatePassword(password);
    if (pwErr) { Alert.alert("Invalid Password", pwErr); return; }

    setLoading(true);
    const ok = await login(email.trim().toLowerCase(), password, role as UserRole);
    setLoading(false);
    if (!ok) {
      Alert.alert("Login Failed", "Invalid email, password, or wrong role selected.\n\nHint: Try student@ghh.com / 123456");
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
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: roleConfig.color + "20" }]}>
            <MaterialCommunityIcons name="lock-open-variant" size={28} color={roleConfig.color} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Sign in as{" "}
            <Text style={{ color: roleConfig.color, fontFamily: "Poppins_600SemiBold" }}>
              {roleConfig.label}
            </Text>
          </Text>
        </View>

        {/* Mode Toggle */}
        <View style={[styles.modeToggle, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {(["phone", "email"] as LoginMode[]).map(m => (
            <Pressable
              key={m}
              style={[
                styles.modeBtn,
                mode === m && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
              ]}
              onPress={() => setMode(m)}
            >
              <MaterialCommunityIcons
                name={m === "phone" ? "cellphone" : "email-outline"}
                size={16}
                color={mode === m ? colors.foreground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.modeBtnText,
                  { color: mode === m ? colors.foreground : colors.mutedForeground },
                  { fontFamily: mode === m ? "Poppins_600SemiBold" : "Poppins_400Regular" },
                ]}
              >
                {m === "phone" ? "Mobile OTP" : "Email"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === "phone" ? (
            /* ── Phone OTP Mode ── */
            <View>
              <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                Mobile Number
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.countryCode, { borderRightColor: colors.border }]}>
                  <Text style={[styles.countryCodeText, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    🇮🇳 +91
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={colors.mutedForeground}
                  maxLength={10}
                />
              </View>
              <Text style={[styles.helpText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                We'll send a 6-digit OTP to verify your number
              </Text>
            </View>
          ) : (
            /* ── Email Mode ── */
            <>
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
                    placeholder="Password (min. 6 characters)"
                    placeholderTextColor={colors.mutedForeground}
                  />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                    <MaterialCommunityIcons name={showPw ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity>
                <Text style={[styles.forgot, { color: roleConfig.color, fontFamily: "Poppins_500Medium" }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* CTA Button */}
        <Pressable
          style={({ pressed }) => [
            styles.loginBtn,
            { backgroundColor: roleConfig.color, opacity: pressed || loading ? 0.85 : 1 },
          ]}
          onPress={mode === "phone" ? handleSendOTP : handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons
                name={mode === "phone" ? "message-arrow-right" : "login"}
                size={20}
                color="#fff"
              />
              <Text style={[styles.loginBtnText, { fontFamily: "Poppins_600SemiBold" }]}>
                {mode === "phone" ? "Send OTP" : "Sign In"}
              </Text>
            </>
          )}
        </Pressable>

        {/* Register Link */}
        <View style={styles.registerRow}>
          <Text style={[styles.registerLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: "/(auth)/register", params: { role } })}>
            <Text style={[styles.registerLink, { color: roleConfig.color, fontFamily: "Poppins_600SemiBold" }]}>
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
  header: { gap: 8 },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, marginTop: 4 },
  subtitle: { fontSize: 14 },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  modeBtnText: { fontSize: 14 },
  form: { gap: 16 },
  fieldLabel: { fontSize: 14, marginBottom: 8 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
  },
  countryCode: {
    paddingRight: 12,
    borderRightWidth: 1,
    height: 30,
    justifyContent: "center",
  },
  countryCodeText: { fontSize: 15 },
  input: { flex: 1, fontSize: 15, height: "100%" },
  helpText: { fontSize: 12, marginTop: 6, lineHeight: 18 },
  forgot: { fontSize: 13, alignSelf: "flex-end" },
  loginBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  loginBtnText: { fontSize: 16, color: "#fff" },
  registerRow: { flexDirection: "row", justifyContent: "center", gap: 6, alignItems: "center" },
  registerLabel: { fontSize: 14 },
  registerLink: { fontSize: 14 },
});
