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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { role = "student" } = useLocalSearchParams<{ role: UserRole }>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    const ok = await register({ name, email, phone, password, role: role as UserRole });
    setLoading(false);
    if (ok) {
      if (role === "student") router.replace("/(student)/home");
      else if (role === "owner") router.replace("/(owner)/dashboard");
      else router.replace("/(admin)/overview");
    }
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
            <MaterialCommunityIcons name="account-plus" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Register as <Text style={{ color: colors.primary, fontFamily: "Poppins_600SemiBold" }}>{role}</Text>
          </Text>
        </View>

        <View style={styles.form}>
          {[
            { label: "Full Name", value: name, onChange: setName, icon: "account-outline", placeholder: "Your full name", type: "default" as const },
            { label: "Email", value: email, onChange: setEmail, icon: "email-outline", placeholder: "Email address", type: "email-address" as const },
            { label: "Phone", value: phone, onChange: setPhone, icon: "phone-outline", placeholder: "+91 XXXXX XXXXX", type: "phone-pad" as const },
          ].map(field => (
            <View key={field.label}>
              <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
                {field.label}
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialCommunityIcons name={field.icon as any} size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType={field.type}
                  autoCapitalize={field.type === "default" ? "words" : "none"}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>
          ))}

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
                placeholder="Create a password"
                placeholderTextColor={colors.mutedForeground}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <MaterialCommunityIcons name={showPw ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.registerBtn,
            { backgroundColor: colors.primary, opacity: pressed || loading ? 0.85 : 1 },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={[styles.registerBtnText, { fontFamily: "Poppins_600SemiBold" }]}>Create Account</Text>
          )}
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={[styles.loginLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.loginLink, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
              Sign In
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
  registerBtn: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 4 },
  registerBtnText: { fontSize: 16, color: "#fff" },
  loginRow: { flexDirection: "row", justifyContent: "center", gap: 6, alignItems: "center" },
  loginLabel: { fontSize: 14 },
  loginLink: { fontSize: 14 },
});
