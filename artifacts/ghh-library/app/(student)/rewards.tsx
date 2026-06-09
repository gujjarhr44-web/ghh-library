import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

function AchievementCard({ ach, onClaim }: { ach: ReturnType<typeof useData>["achievements"][0]; onClaim: () => void }) {
  const colors = useColors();
  const pct = Math.min(100, Math.round((ach.progress / ach.target) * 100));

  return (
    <Pressable
      disabled={!ach.unlocked || ach.claimed}
      onPress={onClaim}
      style={[
        styles.achCard,
        {
          backgroundColor: ach.claimed ? colors.success + "15" : ach.unlocked ? colors.primary + "15" : colors.card,
          borderColor: ach.claimed ? colors.success + "60" : ach.unlocked ? colors.primary + "60" : colors.border,
          opacity: ach.unlocked ? 1 : 0.7,
        },
      ]}
    >
      <View style={[styles.achIcon, {
        backgroundColor: ach.claimed ? colors.success + "25" : ach.unlocked ? colors.primary + "25" : colors.muted,
      }]}>
        <MaterialCommunityIcons
          name={ach.iconName as any}
          size={26}
          color={ach.claimed ? colors.success : ach.unlocked ? colors.primary : colors.mutedForeground}
        />
        {(ach.unlocked || ach.claimed) && (
          <View style={[styles.unlockedBadge, { backgroundColor: colors.success }]}>
            <MaterialCommunityIcons name="check" size={10} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.achInfo}>
        <Text style={[styles.achTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
          {ach.title}
        </Text>
        <Text style={[styles.achDesc, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          {ach.description}
        </Text>
        {!ach.unlocked && (
          <View style={styles.achProgress}>
            <View style={[styles.achProgressBar, { backgroundColor: colors.muted }]}>
              <View style={[styles.achProgressFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.achProgressText, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              {ach.progress}/{ach.target}
            </Text>
          </View>
        )}
        {ach.unlocked && !ach.claimed && (
          <Text style={{ fontSize: 11, color: colors.primary, fontFamily: "Poppins_600SemiBold", marginTop: 2 }}>
            Tap to claim reward!
          </Text>
        )}
      </View>
      <View style={[styles.achReward, { backgroundColor: ach.claimed ? colors.success : ach.unlocked ? colors.primary : colors.muted }]}>
        <Text style={[styles.achRewardText, {
          color: ach.claimed || ach.unlocked ? "#fff" : colors.mutedForeground,
          fontFamily: "Poppins_600SemiBold",
        }]}>
          {ach.claimed ? "Claimed" : ach.reward}
        </Text>
      </View>
    </Pressable>
  );
}

export default function RewardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { achievements, streak, wallet, claimReward, buyPlan } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const unlocked = achievements.filter(a => a.unlocked).length;
  const attendancePct = Math.round((wallet.consumed / (wallet.consumed + wallet.available)) * 100);

  const handleClaim = (achId: string, rewardStr: string) => {
    const num = parseInt(rewardStr.replace(/[^0-9]/g, ""), 10) || 0;
    claimReward(achId, num);
    Alert.alert("Reward Claimed!", `${num} credits added to your wallet!`);
  };

  const handleReferralPress = () => {
    Alert.alert(
      "Referral Copied!",
      "Referral Code 'ARJUN2024' has been copied to clipboard. Share with your friends!",
      [
        {
          text: "Enter a Friend's Code",
          onPress: () => {
            Alert.prompt(
              "Apply Referral Code",
              "Enter your friend's referral code to receive 5 bonus credits immediately:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Apply",
                  onPress: (code) => {
                    if (code && code.trim().length > 0) {
                      buyPlan(5, "Referral Bonus");
                      Alert.alert("Referral Applied!", "5 credits pack added as referral reward!");
                    }
                  }
                }
              ]
            );
          }
        },
        { text: "OK" }
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Rewards
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          Earn credits & unlock achievements
        </Text>
      </View>

      <LinearGradient
        colors={[colors.primary, colors.primary + "99"]}
        style={[styles.streakCard, { marginHorizontal: 20, marginTop: 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.streakLeft}>
          <MaterialCommunityIcons name="fire" size={48} color="#fff" />
        </View>
        <View style={styles.streakCenter}>
          <Text style={[styles.streakNumber, { fontFamily: "Poppins_700Bold" }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { fontFamily: "Poppins_500Medium" }]}>Day Streak</Text>
          <Text style={[styles.streakSub, { fontFamily: "Poppins_400Regular" }]}>Keep it going!</Text>
        </View>
        <View style={styles.streakRight}>
          <View style={styles.streakStat}>
            <Text style={[styles.streakStatVal, { fontFamily: "Poppins_700Bold" }]}>{unlocked}</Text>
            <Text style={[styles.streakStatLabel, { fontFamily: "Poppins_400Regular" }]}>Badges</Text>
          </View>
          <View style={styles.streakStat}>
            <Text style={[styles.streakStatVal, { fontFamily: "Poppins_700Bold" }]}>{wallet.consumed}</Text>
            <Text style={[styles.streakStatLabel, { fontFamily: "Poppins_400Regular" }]}>Total Days</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.attendanceCard, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.attendanceHeader}>
          <Text style={[styles.attendanceTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Attendance Rate
          </Text>
          <Text style={[styles.attendancePct, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
            {attendancePct}%
          </Text>
        </View>
        <View style={[styles.attendanceBar, { backgroundColor: colors.muted }]}>
          <View style={[styles.attendanceFill, { width: `${attendancePct}%` as any, backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.attendanceStats}>
          <Text style={[styles.attendanceStat, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {wallet.consumed} days attended
          </Text>
          <Text style={[styles.attendanceStat, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {wallet.available} credits remaining
          </Text>
        </View>
      </View>

      <View style={[styles.weekRow, { marginHorizontal: 20, marginTop: 12, backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.weekTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
          This Week
        </Text>
        <View style={styles.weekDays}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
            const attended = i < 5;
            const isToday = i === 2;
            return (
              <View key={i} style={styles.weekDay}>
                <View style={[styles.weekDot, {
                  backgroundColor: attended ? colors.primary : colors.muted,
                  borderWidth: isToday ? 2 : 0,
                  borderColor: colors.foreground,
                }]} />
                <Text style={[styles.weekDayText, {
                  color: isToday ? colors.foreground : colors.mutedForeground,
                  fontFamily: isToday ? "Poppins_600SemiBold" : "Poppins_400Regular",
                }]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Achievements
        </Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          {unlocked} of {achievements.length} unlocked
        </Text>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
        {achievements.map(ach => (
          <AchievementCard key={ach.id} ach={ach} onClaim={() => handleClaim(ach.id, ach.reward)} />
        ))}
      </View>

      <Pressable
        onPress={handleReferralPress}
        style={[styles.referralCard, { marginHorizontal: 20, marginTop: 20, backgroundColor: colors.secondary, borderColor: colors.border }]}
      >
        <View style={styles.referralLeft}>
          <MaterialCommunityIcons name="account-multiple-plus" size={28} color={colors.info} />
          <View>
            <Text style={[styles.referralTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              Refer Friends
            </Text>
            <Text style={[styles.referralDesc, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              Both get 5 bonus credits
            </Text>
          </View>
        </View>
        <View style={[styles.referralCode, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.referralCodeText, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
            ARJUN2024
          </Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 26 },
  pageSubtitle: { fontSize: 13, marginTop: 2 },
  streakCard: { borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center" },
  streakLeft: {},
  streakCenter: { flex: 1, alignItems: "center" },
  streakNumber: { fontSize: 52, color: "#fff", lineHeight: 56 },
  streakLabel: { fontSize: 16, color: "#fff" },
  streakSub: { fontSize: 12, color: "#fff9" },
  streakRight: { gap: 16 },
  streakStat: { alignItems: "center" },
  streakStatVal: { fontSize: 20, color: "#fff" },
  streakStatLabel: { fontSize: 11, color: "#fff9" },
  attendanceCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  attendanceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  attendanceTitle: { fontSize: 15 },
  attendancePct: { fontSize: 18 },
  attendanceBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  attendanceFill: { height: "100%", borderRadius: 4 },
  attendanceStats: { flexDirection: "row", justifyContent: "space-between" },
  attendanceStat: { fontSize: 12 },
  weekRow: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  weekTitle: { fontSize: 15 },
  weekDays: { flexDirection: "row", justifyContent: "space-between" },
  weekDay: { alignItems: "center", gap: 4 },
  weekDot: { width: 32, height: 32, borderRadius: 16 },
  weekDayText: { fontSize: 11 },
  sectionTitle: { fontSize: 20 },
  sectionSub: { fontSize: 13, marginTop: 2 },
  achCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, borderWidth: 1, gap: 12 },
  achIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", position: "relative" },
  unlockedBadge: { position: "absolute", top: -3, right: -3, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  achInfo: { flex: 1, gap: 4 },
  achTitle: { fontSize: 14 },
  achDesc: { fontSize: 12 },
  achProgress: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  achProgressBar: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  achProgressFill: { height: "100%", borderRadius: 3 },
  achProgressText: { fontSize: 10 },
  achReward: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  achRewardText: { fontSize: 12 },
  referralCard: { borderRadius: 16, padding: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  referralLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  referralTitle: { fontSize: 15 },
  referralDesc: { fontSize: 12, marginTop: 2 },
  referralCode: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  referralCodeText: { fontSize: 15, letterSpacing: 1 },
});
