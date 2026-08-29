import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  TextInput,
  TouchableOpacity,
  Share,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData, type PaymentReceipt } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { wallet, attendanceRecords, libraries, settings, purchasePlan, receipts } = useData();
  const { user } = useAuth();

  const PLANS = libraries[0]?.plans ?? [];
  const [tab, setTab] = useState<"history" | "plans" | "receipts">("history");

  // Payment QR Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [transactionId, setTransactionId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Digital Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const totalCreds = wallet.available + wallet.consumed;
  const pct = totalCreds > 0 ? Math.round((wallet.consumed / totalCreds) * 100) : 0;

  const handleShareReceipt = async (receipt: PaymentReceipt) => {
    try {
      await Share.share({
        message: `📄 GHH Library Payment Receipt\nReceipt No: ${receipt.receiptNumber}\nLibrary: ${receipt.libraryName}\nStudent: ${receipt.studentName}\nPlan: ${receipt.planName}\nAmount: ₹${receipt.amount} (${receipt.method})\nStatus: ${receipt.status.toUpperCase()}\nTransaction ID: ${receipt.transactionId}\nDate: ${receipt.date}`,
      });
    } catch {}
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Credit & Fees Wallet
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          Transparent access ledger & instant receipts
        </Text>
      </View>

      {/* Main Wallet Card */}
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
                {wallet.billingMode === "membership" ? "Membership Status" : "Available Credits"}
              </Text>
              <Text style={[styles.walletBalance, { color: "#fff", fontFamily: "Poppins_700Bold" }]}>
                {wallet.billingMode === "membership" ? "ACTIVE" : wallet.available}
              </Text>
            </View>
            <View style={styles.walletIcon}>
              <MaterialCommunityIcons name="wallet-membership" size={32} color="#fff6" />
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
              <Text style={[styles.walletMini, { color: "#fff9", fontFamily: "Poppins_400Regular" }]}>Expires On</Text>
              <Text style={[styles.walletMiniVal, { color: "#fff", fontFamily: "Poppins_600SemiBold" }]}>
                {wallet.planExpiry}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Consumption Progress (if credit mode) */}
      {wallet.billingMode !== "membership" && (
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20, marginTop: 14 }]}>
          <View style={styles.progressTop}>
            <Text style={[styles.progressTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              Credit Consumption
            </Text>
            <Text style={[styles.progressPct, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
              {pct}% consumed
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
          </View>
          <View style={styles.progressLegend}>
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
              🟢 {wallet.available} Available
            </Text>
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
              🔵 {wallet.consumed} Consumed
            </Text>
          </View>
        </View>
      )}

      {/* Segment Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.muted, marginHorizontal: 20, marginTop: 16 }]}>
        <Pressable
          style={[styles.tabItem, tab === "history" && { backgroundColor: colors.card }]}
          onPress={() => setTab("history")}
        >
          <Text style={[styles.tabText, { color: tab === "history" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
            Usage History
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabItem, tab === "plans" && { backgroundColor: colors.card }]}
          onPress={() => setTab("plans")}
        >
          <Text style={[styles.tabText, { color: tab === "plans" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
            Buy Plans
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabItem, tab === "receipts" && { backgroundColor: colors.card }]}
          onPress={() => setTab("receipts")}
        >
          <Text style={[styles.tabText, { color: tab === "receipts" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
            Receipts ({receipts.length})
          </Text>
        </Pressable>
      </View>

      {/* TAB 1: USAGE HISTORY */}
      {tab === "history" && (
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          {attendanceRecords.map((item) => (
            <View key={item.id} style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.historyIcon, { backgroundColor: item.isLeave ? colors.warning + "20" : colors.primary + "20" }]}>
                <MaterialCommunityIcons
                  name={item.isLeave ? "umbrella-beach" : "qrcode-scan"}
                  size={18}
                  color={item.isLeave ? colors.warning : colors.primary}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.historyDate, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                  {item.date} ({item.dayOfWeek})
                </Text>
                <Text style={[styles.historyTime, { color: colors.mutedForeground }]}>
                  {item.isLeave ? "Approved Leave • Credit Protected" : `${item.entryTime} - ${item.exitTime || "Active"} (${item.duration || "In progress"})`}
                </Text>
              </View>
              <Text style={[styles.historyDeduct, { color: item.isLeave ? colors.success : colors.destructive, fontFamily: "Poppins_600SemiBold" }]}>
                {item.isLeave ? "0 Credit" : "-1 Credit"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* TAB 2: BUY PLANS */}
      {tab === "plans" && (
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          {PLANS.map((plan: any) => (
            <View key={plan.id} style={[styles.planCard, { backgroundColor: colors.card, borderColor: plan.popular ? colors.primary : colors.border }]}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    {plan.name || `${plan.credits} Credits Pack`}
                  </Text>
                  <Text style={[styles.planSub, { color: colors.mutedForeground }]}>
                    Valid for {plan.validity} days • 1 Credit = 1 Day/Shift Access
                  </Text>
                </View>
                <Text style={[styles.planPrice, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                  ₹{plan.price}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.rechargeBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setSelectedPlan(plan);
                  setShowPaymentModal(true);
                }}
              >
                <MaterialCommunityIcons name="qrcode-scan" size={16} color="#fff" />
                <Text style={[styles.rechargeBtnText, { color: "#fff", fontFamily: "Poppins_600SemiBold" }]}>
                  Pay via UPI QR
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* TAB 3: DIGITAL RECEIPTS */}
      {tab === "receipts" && (
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          {receipts.map((receipt) => (
            <TouchableOpacity
              key={receipt.id}
              style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setActiveReceipt(receipt)}
            >
              <View style={styles.receiptTop}>
                <View>
                  <Text style={[styles.receiptNumber, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    {receipt.receiptNumber}
                  </Text>
                  <Text style={[styles.receiptPlan, { color: colors.mutedForeground }]}>
                    {receipt.planName} • {receipt.date}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.receiptAmount, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                    ₹{receipt.amount}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: receipt.status === "paid" ? colors.success + "20" : colors.warning + "20" }]}>
                    <Text style={[styles.statusBadgeText, { color: receipt.status === "paid" ? colors.success : colors.warning }]}>
                      {receipt.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Payment QR Modal with Dynamic Coupon Discount */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              Pay ₹{Math.max(0, (selectedPlan?.price || 0) - discountAmount)}
              {discountAmount > 0 && (
                <Text style={{ fontSize: 13, color: colors.success, fontFamily: "Poppins_500Medium" }}>
                  {" "}(₹{discountAmount} Off Applied 🎉)
                </Text>
              )}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
              Scan the UPI QR code using PhonePe, GPay or Paytm
            </Text>

            {/* Promo Code Input */}
            <View style={{ flexDirection: "row", gap: 8, marginVertical: 10, width: "100%" }}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    color: colors.foreground,
                    backgroundColor: colors.muted,
                    borderColor: couponApplied ? colors.success : colors.border,
                    fontFamily: "Poppins_600SemiBold",
                    textTransform: "uppercase",
                  },
                ]}
                placeholder="PROMO CODE (e.g. WELCOME50)"
                placeholderTextColor={colors.mutedForeground}
                value={couponCode}
                editable={!couponApplied}
                onChangeText={setCouponCode}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: couponApplied ? colors.success : colors.primary,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                  borderRadius: 10,
                }}
                onPress={async () => {
                  if (couponApplied) {
                    setCouponApplied(false);
                    setCouponCode("");
                    setDiscountAmount(0);
                    return;
                  }
                  if (!couponCode.trim()) return;
                  setValidatingCoupon(true);
                  try {
                    const res = await fetch(`${API_BASE}/api/payments/validate-coupon`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        code: couponCode.trim(),
                        userId: user?.id,
                        amount: selectedPlan?.price || 0,
                        planId: selectedPlan?.id,
                      }),
                    });
                    const data = await res.json();
                    if (data.valid) {
                      setDiscountAmount(data.discountAmount);
                      setCouponApplied(true);
                      Alert.alert("Coupon Applied! 🏷️", `You saved ₹${data.discountAmount} on this recharge.`);
                    } else {
                      Alert.alert("Invalid Coupon", data.message || "This promo code could not be applied.");
                    }
                  } catch {
                    Alert.alert("Error", "Could not validate coupon.");
                  } finally {
                    setValidatingCoupon(false);
                  }
                }}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 12 }}>
                  {validatingCoupon ? "..." : couponApplied ? "Remove" : "Apply"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.qrBox}>
              <QRCode
                value={settings.paymentQR || "upi://pay?pa=ghh@upi&pn=GHHLibrary&mc=0000&mode=02&purpose=00"}
                size={140}
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
              Enter UPI Ref / Transaction ID:
            </Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
              placeholder="e.g. 412345678901"
              placeholderTextColor={colors.mutedForeground}
              value={transactionId}
              onChangeText={setTransactionId}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setShowPaymentModal(false);
                  setCouponCode("");
                  setDiscountAmount(0);
                  setCouponApplied(false);
                }}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_500Medium" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={async () => {
                  if (!transactionId.trim()) {
                    Alert.alert("Required", "Please enter the UPI Transaction ID.");
                    return;
                  }
                  if (selectedPlan) {
                    await purchasePlan(selectedPlan, "UPI", transactionId);
                  }
                  setShowPaymentModal(false);
                  setTransactionId("");
                  setCouponCode("");
                  setDiscountAmount(0);
                  setCouponApplied(false);
                  Alert.alert(
                    "Submitted! ⏳",
                    "Your payment verification has been submitted to the library manager. Credits will be activated upon instant approval."
                  );
                }}
              >
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Digital Receipt View Modal */}
      <Modal visible={!!activeReceipt} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.receiptModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.receiptHeader}>
              <MaterialCommunityIcons name="receipt" size={32} color={colors.primary} />
              <Text style={[styles.receiptHeadTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                PAYMENT RECEIPT
              </Text>
              <Text style={[styles.receiptSubHead, { color: colors.mutedForeground }]}>
                {activeReceipt?.libraryName}
              </Text>
            </View>

            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

            <View style={styles.receiptRow}>
              <Text style={[styles.rcptLbl, { color: colors.mutedForeground }]}>Receipt No:</Text>
              <Text style={[styles.rcptVal, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                {activeReceipt?.receiptNumber}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.rcptLbl, { color: colors.mutedForeground }]}>Student Name:</Text>
              <Text style={[styles.rcptVal, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                {activeReceipt?.studentName}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.rcptLbl, { color: colors.mutedForeground }]}>Plan Purchased:</Text>
              <Text style={[styles.rcptVal, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                {activeReceipt?.planName}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.rcptLbl, { color: colors.mutedForeground }]}>Payment Method:</Text>
              <Text style={[styles.rcptVal, { color: colors.foreground }]}>{activeReceipt?.method}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.rcptLbl, { color: colors.mutedForeground }]}>Transaction ID:</Text>
              <Text style={[styles.rcptVal, { color: colors.foreground }]}>{activeReceipt?.transactionId}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.rcptLbl, { color: colors.mutedForeground }]}>Date:</Text>
              <Text style={[styles.rcptVal, { color: colors.foreground }]}>{activeReceipt?.date}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.rcptLbl, { color: colors.mutedForeground }]}>Amount Paid:</Text>
              <Text style={[styles.rcptVal, { color: colors.primary, fontFamily: "Poppins_700Bold", fontSize: 16 }]}>
                ₹{activeReceipt?.amount}
              </Text>
            </View>

            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

            <View style={styles.receiptActions}>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: colors.primary }]}
                onPress={() => activeReceipt && handleShareReceipt(activeReceipt)}
              >
                <MaterialCommunityIcons name="share-variant" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>Share Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.closeBtn, { borderColor: colors.border }]}
                onPress={() => setActiveReceipt(null)}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Poppins_500Medium" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 22 },
  pageSubtitle: { fontSize: 12, marginTop: 2 },
  walletCardWrap: { width: "100%" },
  walletCard: { padding: 20, borderRadius: 20 },
  walletTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  walletLabel: { fontSize: 13 },
  walletBalance: { fontSize: 32, marginTop: 4 },
  walletIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#ffffff1a", justifyContent: "center", alignItems: "center" },
  walletDivider: { height: 1, backgroundColor: "#ffffff2a", marginVertical: 14 },
  walletBottom: { flexDirection: "row", justifyContent: "space-between" },
  walletMini: { fontSize: 11 },
  walletMiniVal: { fontSize: 13, marginTop: 2 },
  progressCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  progressTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: 13 },
  progressPct: { fontSize: 12 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden", marginVertical: 10 },
  progressFill: { height: "100%", borderRadius: 3 },
  progressLegend: { flexDirection: "row", justifyContent: "space-between" },
  legendText: { fontSize: 11 },
  tabBar: { flexDirection: "row", borderRadius: 10, padding: 4 },
  tabItem: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabText: { fontSize: 12 },
  historyRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  historyIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  historyDate: { fontSize: 13 },
  historyTime: { fontSize: 11, marginTop: 2 },
  historyDeduct: { fontSize: 13 },
  planCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  planHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planTitle: { fontSize: 15 },
  planSub: { fontSize: 11, marginTop: 2 },
  planPrice: { fontSize: 18 },
  rechargeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, borderRadius: 10, marginTop: 12 },
  rechargeBtnText: { fontSize: 13 },
  receiptCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  receiptTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  receiptNumber: { fontSize: 13 },
  receiptPlan: { fontSize: 11, marginTop: 2 },
  receiptAmount: { fontSize: 16 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statusBadgeText: { fontSize: 9, fontFamily: "Poppins_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { width: "100%", maxWidth: 340, padding: 20, borderRadius: 20, borderWidth: 1, alignItems: "center" },
  modalTitle: { fontSize: 18 },
  modalSubtitle: { fontSize: 11, textAlign: "center", marginTop: 4, marginBottom: 14 },
  qrBox: { padding: 14, backgroundColor: "#fff", borderRadius: 12, marginBottom: 14 },
  inputLabel: { alignSelf: "flex-start", fontSize: 12, marginBottom: 6 },
  input: { width: "100%", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, fontSize: 13, marginBottom: 16 },
  modalActions: { flexDirection: "row", gap: 10, width: "100%" },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  submitBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  receiptModal: { width: "100%", maxWidth: 360, padding: 20, borderRadius: 20, borderWidth: 1 },
  receiptHeader: { alignItems: "center" },
  receiptHeadTitle: { fontSize: 16, marginTop: 6 },
  receiptSubHead: { fontSize: 12, marginTop: 2 },
  receiptDivider: { height: 1, marginVertical: 14 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rcptLbl: { fontSize: 12 },
  rcptVal: { fontSize: 12 },
  receiptActions: { flexDirection: "row", gap: 10 },
  shareBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  closeBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, alignItems: "center" },
});
