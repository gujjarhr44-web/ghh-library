import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  ActivityIndicator,
  TextInput,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

// FIX BUG-22: Removed local PLANS array — now sourced from DataContext (single source of truth)

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { wallet, attendanceRecords, leaves, buyPlan, libraries, settings, requestPaymentVerification } = useData();
  // FIX BUG-22: Use plans from library in DataContext instead of local duplicate array
  const PLANS = libraries[0]?.plans ?? [];
  const [tab, setTab] = useState<"history" | "plans">("history");

  // Payment QR Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const totalCreds = wallet.available + wallet.consumed;
  const pct = totalCreds > 0 ? Math.round((wallet.consumed / totalCreds) * 100) : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Credit Wallet
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          Pay only for what you attend
        </Text>
      </View>

      <View style={[styles.walletCardWrap, { paddingHorizontal: 20, marginTop: 16 }]}>
        <LinearGradient
          colors={[colors.primary, colors.primary + "CC"]}
          style={styles.walletCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.walletTop}>
            <View>
              <Text style={[styles.walletLabel, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>
                Available Credits
              </Text>
              <Text style={[styles.walletBalance, { color: "#fff", fontFamily: "Poppins_700Bold" }]}>
                {wallet.available}
              </Text>
            </View>
            <View style={styles.walletIcon}>
              <MaterialCommunityIcons name="wallet-outline" size={32} color="#fff6" />
            </View>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletBottom}>
            <View>
              <Text style={[styles.walletMini, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>Plan</Text>
              <Text style={[styles.walletMiniVal, { color: "#fff", fontFamily: "Poppins_600SemiBold" }]}>
                {wallet.planName}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.walletMini, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>Expires</Text>
              <Text style={[styles.walletMiniVal, { color: "#fff", fontFamily: "Poppins_600SemiBold" }]}>
                {wallet.planExpiry}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={[styles.statsRow, { paddingHorizontal: 20, marginTop: 16, gap: 12 }]}>
        {[
          { label: "Consumed", value: wallet.consumed, icon: "check-circle", color: colors.success },
          { label: "Available", value: wallet.available, icon: "clock-outline", color: colors.info },
          { label: "Expired", value: wallet.expired, icon: "close-circle", color: colors.destructive },
        ].map(s => (
          <View key={s.label} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
            <MaterialCommunityIcons name={s.icon as any} size={20} color={s.color} />
            <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {s.value}
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.usageWrap, { paddingHorizontal: 20, marginTop: 16 }]}>
        <View style={styles.usageHeader}>
          <Text style={[styles.usageTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Usage
          </Text>
          <Text style={[styles.usagePct, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
            {pct}%
          </Text>
        </View>
        <View style={[styles.usageBar, { backgroundColor: colors.muted }]}>
          <View style={[styles.usageFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.usageLabels}>
          <Text style={[styles.usageLabelText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {wallet.consumed} consumed
          </Text>
          <Text style={[styles.usageLabelText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {wallet.available} remaining
          </Text>
        </View>
      </View>

      <View style={[styles.tabs, { paddingHorizontal: 20, marginTop: 20 }]}>
        {(["history", "plans"] as const).map(t => (
          <Pressable
            key={t}
            style={[
              styles.tabBtn,
              { backgroundColor: tab === t ? colors.primary : colors.card, borderColor: tab === t ? colors.primary : colors.border },
            ]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabBtnText, {
              color: tab === t ? "#fff" : colors.foreground,
              fontFamily: "Poppins_600SemiBold",
            }]}>
              {t === "history" ? "Attendance History" : "Buy Credits"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "history" ? (
        <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
          <Pressable
            style={[styles.leaveBtn, { borderColor: colors.primary, backgroundColor: colors.primary + "15" }]}
            onPress={() => router.push("/(student)/leave" as any)}
          >
            <MaterialCommunityIcons name="calendar-remove" size={16} color={colors.primary} />
            <Text style={[styles.leaveBtnText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
              Mark Leave
            </Text>
          </Pressable>
          {attendanceRecords.map(rec => (
            <View key={rec.id} style={[styles.recCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.recDayBox, {
                backgroundColor: rec.isLeave ? colors.muted : colors.primary + "20",
              }]}>
                <Text style={[styles.recDay, { color: rec.isLeave ? colors.mutedForeground : colors.primary, fontFamily: "Poppins_700Bold" }]}>
                  {rec.dayOfWeek}
                </Text>
                <Text style={[styles.recDate, { color: rec.isLeave ? colors.mutedForeground : colors.primary, fontFamily: "Poppins_400Regular" }]}>
                  {rec.date.split("-").slice(1).join("/")}
                </Text>
              </View>
              <View style={styles.recInfo}>
                {rec.isLeave ? (
                  <Text style={[styles.recLeaveText, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
                    Leave - Credit Saved
                  </Text>
                ) : (
                  <>
                    <Text style={[styles.recTime, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                      {rec.entryTime} — {rec.exitTime}
                    </Text>
                    <Text style={[styles.recDuration, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                      {rec.duration}
                    </Text>
                  </>
                )}
              </View>
              <View style={[styles.creditTag, {
                backgroundColor: rec.creditDeducted ? colors.destructive + "20" : colors.success + "20",
              }]}>
                <MaterialCommunityIcons
                  name={rec.creditDeducted ? "minus-circle" : "check-circle"}
                  size={14}
                  color={rec.creditDeducted ? colors.destructive : colors.success}
                />
                <Text style={[styles.creditTagText, {
                  color: rec.creditDeducted ? colors.destructive : colors.success,
                  fontFamily: "Poppins_500Medium",
                }]}>
                  {rec.creditDeducted ? "-1" : "Saved"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 12 }}>
          <Text style={[styles.planNote, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Credits never expire before validity period. Unused credits stay in your wallet.
          </Text>
          {PLANS.map(plan => (
            <View key={plan.id} style={[
              styles.planCard,
              {
                backgroundColor: plan.popular ? colors.primary + "15" : colors.card,
                borderColor: plan.popular ? colors.primary : colors.border,
              },
            ]}>
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.popularText, { fontFamily: "Poppins_600SemiBold" }]}>Most Popular</Text>
                </View>
              )}
              <View style={styles.planInfo}>
                <View>
                  <Text style={[styles.planCredits, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                    {plan.credits} Credits
                  </Text>
                  <Text style={[styles.planValidity, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                    Valid for {plan.validity} days
                  </Text>
                </View>
                <View style={styles.planPriceWrap}>
                  <Text style={[styles.planPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                    ₹{plan.price}
                  </Text>
                  <Text style={[styles.planPerCredit, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                    ₹{Math.round(plan.price / plan.credits)}/credit
                  </Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.buyBtn,
                  { backgroundColor: plan.popular ? colors.primary : colors.secondary, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => {
                  setSelectedPlan(plan);
                  setShowPaymentModal(true);
                }}
              >
                <Text style={[styles.buyBtnText, {
                  color: plan.popular ? "#fff" : colors.foreground,
                  fontFamily: "Poppins_600SemiBold",
                }]}>
                  Buy Now
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color={plan.popular ? "#fff" : colors.foreground} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Payment QR Modal */}
      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: colors.card, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: colors.border, gap: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: colors.foreground }}>
              Scan QR to Pay
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Poppins_400Regular", textAlign: "center" }}>
              Scan this QR using any UPI app (GPay, PhonePe, Paytm) to purchase <Text style={{ fontFamily: "Poppins_700Bold", color: colors.primary }}>{selectedPlan?.credits} Credits</Text> for <Text style={{ fontFamily: "Poppins_700Bold", color: colors.success }}>₹{selectedPlan?.price}</Text>.
            </Text>

            <View style={{ padding: 16, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
              <QRCode
                value={settings.paymentQR || `upi://pay?pa=ghh@upi&pn=GHHLibrary&am=${selectedPlan?.price || 0}&tn=CreditsPurchase`}
                size={180}
              />
            </View>

            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>
              UPI ID: {settings.paymentQR?.split("pa=")[1]?.split("&")[0] || "ghh@upi"}
            </Text>

            {/* Transaction ID input box */}
            <View style={{ width: "100%", gap: 6, marginVertical: 8 }}>
              <Text style={{ fontSize: 12, color: colors.foreground, fontFamily: "Poppins_600SemiBold" }}>
                Enter UPI Transaction ID / UTR Number:
              </Text>
              <TextInput
                value={transactionId}
                onChangeText={setTransactionId}
                placeholder="e.g. 418290382918"
                placeholderTextColor={colors.mutedForeground}
                style={{
                  height: 46,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  fontSize: 14,
                  fontFamily: "Poppins_400Regular"
                }}
              />
            </View>

            <View style={{ width: "100%", gap: 8 }}>
              <Pressable
                onPress={() => {
                  if (!transactionId.trim()) {
                    Alert.alert("Validation Error", "Please enter your UPI transaction reference ID.");
                    return;
                  }
                  setCheckingPayment(true);
                  setTimeout(() => {
                    setCheckingPayment(false);
                    setShowPaymentModal(false);
                    
                    // Request verification instead of adding credits instantly
                    requestPaymentVerification(
                      selectedPlan.credits,
                      `${selectedPlan.credits} Credits Pack`,
                      selectedPlan.validity,
                      selectedPlan.price,
                      transactionId.trim()
                    );

                    Alert.alert(
                      "Verification Requested!",
                      "Your transaction ID has been sent to the Library Owner. Once verified, credits will be added to your wallet."
                    );
                    setTransactionId("");
                    setSelectedPlan(null);
                  }, 1500);
                }}
                disabled={checkingPayment}
                style={({ pressed }) => [
                  { height: 48, borderRadius: 12, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 8, opacity: pressed || checkingPayment ? 0.8 : 1 }
                ]}
              >
                {checkingPayment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="send" size={16} color="#fff" />
                    <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 14 }}>
                      Submit for Verification
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowPaymentModal(false);
                  setSelectedPlan(null);
                  setTransactionId("");
                }}
                disabled={checkingPayment}
                style={({ pressed }) => [
                  { height: 44, borderRadius: 12, backgroundColor: colors.muted, justifyContent: "center", alignItems: "center", opacity: pressed || checkingPayment ? 0.8 : 1 }
                ]}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold", fontSize: 14 }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 26 },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  walletCard: { borderRadius: 20, padding: 20, gap: 16 },
  walletCardWrap: {},
  walletTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  walletLabel: { fontSize: 13 },
  walletBalance: { fontSize: 52, lineHeight: 58 },
  walletIcon: {},
  walletDivider: { height: 1, backgroundColor: "#ffffff30" },
  walletBottom: { flexDirection: "row", justifyContent: "space-between" },
  walletMini: { fontSize: 12 },
  walletMiniVal: { fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: "row" },
  statBox: { borderRadius: 14, padding: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  statVal: { fontSize: 20 },
  statLbl: { fontSize: 11 },
  usageWrap: {},
  usageHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  usageTitle: { fontSize: 15 },
  usagePct: { fontSize: 15 },
  usageBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  usageFill: { height: "100%", borderRadius: 4 },
  usageLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  usageLabelText: { fontSize: 12 },
  tabs: { flexDirection: "row", gap: 10 },
  tabBtn: { flex: 1, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  tabBtnText: { fontSize: 13 },
  leaveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, borderRadius: 12, borderWidth: 1.5 },
  leaveBtnText: { fontSize: 14 },
  recCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 12, borderWidth: 1, gap: 12 },
  recDayBox: { width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  recDay: { fontSize: 13 },
  recDate: { fontSize: 11, marginTop: 1 },
  recInfo: { flex: 1 },
  recLeaveText: { fontSize: 14 },
  recTime: { fontSize: 14 },
  recDuration: { fontSize: 12, marginTop: 2 },
  creditTag: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  creditTagText: { fontSize: 12 },
  planNote: { fontSize: 12, lineHeight: 18 },
  planCard: { borderRadius: 16, padding: 16, borderWidth: 1.5, gap: 12, overflow: "hidden" },
  popularBadge: { position: "absolute", top: 0, right: 0, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 12 },
  popularText: { fontSize: 11, color: "#fff" },
  planInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  planCredits: { fontSize: 20 },
  planValidity: { fontSize: 12, marginTop: 2 },
  planPriceWrap: { alignItems: "flex-end" },
  planPrice: { fontSize: 24 },
  planPerCredit: { fontSize: 11 },
  buyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 44, borderRadius: 12, gap: 6 },
  buyBtnText: { fontSize: 15 },
});
