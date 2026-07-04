import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function OTPVerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { verifyOTP, loginWithPhone } = useAuth();
  const { phone = "", role = "student", devOtp: devOtpParam = "" } = useLocalSearchParams<{ phone: string; role: UserRole; devOtp?: string }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [devOtpInfo, setDevOtpInfo] = useState<string | null>(devOtpParam || null);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Shake animation on wrong OTP
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    // Auto-submit when all filled
    if (cleaned && index === OTP_LENGTH - 1 && newOtp.every(d => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue ?? otp.join("");
    if (code.length < OTP_LENGTH) {
      Alert.alert("Enter OTP", "Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    const ok = await verifyOTP(phone, code, role as UserRole);
    setLoading(false);

    if (!ok) {
      triggerShake();
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setActiveIndex(0);
      Alert.alert("Invalid OTP", "The OTP you entered is incorrect. Please try again.");
      return;
    }

    // Success → Navigate
    if (role === "student") router.replace("/(student)/home");
    else if (role === "owner") router.replace("/(owner)/dashboard");
    else router.replace("/(admin)/overview");
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(RESEND_COOLDOWN);
    setOtp(Array(OTP_LENGTH).fill(""));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();

    const result = await loginWithPhone(phone, role as UserRole);
    if (result.success) {
      if (result.devOtp) setDevOtpInfo(result.devOtp);
      Alert.alert("OTP Sent", "A new OTP has been sent to your mobile number.");
    } else {
      Alert.alert("Error", result.message || "Could not resend OTP. Please try again.");
      setCanResend(true);
    }
  };

  const maskedPhone = phone.length > 6
    ? phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4)
    : phone;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "20" }]}>
            <MaterialCommunityIcons name="message-lock" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
            Verify OTP
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            We sent a 6-digit code to
          </Text>
          <Text style={[styles.phoneText, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            {maskedPhone}
          </Text>
        </View>

        {/* DEV OTP Banner — only in React Native development builds (__DEV__ is false in production) */}
        {/* FIX BUG-04: __DEV__ guard prevents OTP exposure in production APK */}
        {__DEV__ && devOtpInfo && (
          <View style={[styles.devBanner, { backgroundColor: "#F59E0B20", borderColor: "#F59E0B" }]}>
            <MaterialCommunityIcons name="developer-board" size={16} color="#F59E0B" />
            <Text style={[styles.devBannerText, { fontFamily: "Poppins_600SemiBold" }]}>
              Dev OTP: <Text style={styles.devOtpCode}>{devOtpInfo}</Text>
            </Text>
          </View>
        )}

        {/* OTP Boxes */}
        <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => {
                inputRefs.current[index]?.focus();
                setActiveIndex(index);
              }}
            >
              <View
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: colors.card,
                    borderColor: activeIndex === index ? colors.primary : digit ? colors.primary + "60" : colors.border,
                    borderWidth: activeIndex === index ? 2 : 1.5,
                    shadowColor: activeIndex === index ? colors.primary : "transparent",
                    shadowOpacity: activeIndex === index ? 0.3 : 0,
                    shadowRadius: 8,
                    elevation: activeIndex === index ? 4 : 0,
                  },
                ]}
              >
                <TextInput
                  ref={ref => { inputRefs.current[index] = ref; }}
                  style={[styles.otpInput, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}
                  value={digit}
                  onChangeText={val => handleOtpChange(val, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  onFocus={() => setActiveIndex(index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  caretHidden
                />
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Verify Button */}
        <Pressable
          style={({ pressed }) => [
            styles.verifyBtn,
            { backgroundColor: colors.primary, opacity: pressed || loading ? 0.85 : 1 },
          ]}
          onPress={() => handleVerify()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={[styles.verifyBtnText, { fontFamily: "Poppins_600SemiBold" }]}>
                Verify OTP
              </Text>
              <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
            </>
          )}
        </Pressable>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={[styles.resendLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Didn't receive the OTP?
          </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[styles.resendLink, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.timerText, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
              Resend in {resendTimer}s
            </Text>
          )}
        </View>

        {/* Change Number */}
        <TouchableOpacity style={styles.changeNum} onPress={() => router.back()}>
          <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.changeNumText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Change mobile number
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 24 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  header: { alignItems: "center", gap: 8 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 28, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center" },
  phoneText: { fontSize: 16, textAlign: "center", letterSpacing: 0.5 },
  devBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  devBannerText: { color: "#F59E0B", fontSize: 14 },
  devOtpCode: { fontSize: 18, letterSpacing: 2 },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 4,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  otpInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 24,
  },
  verifyBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  verifyBtnText: { fontSize: 16, color: "#fff" },
  resendRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  resendLabel: { fontSize: 14 },
  resendLink: { fontSize: 14 },
  timerText: { fontSize: 14 },
  changeNum: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  changeNumText: { fontSize: 13 },
});
