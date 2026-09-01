import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Switch,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function RewardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { streak, studyAnalytics, leaderboard, isLeaderboardOptedIn, toggleLeaderboardPrivacy } = useData();
  const [tab, setTab] = useState<"achievements" | "loyalty" | "leaderboard">("achievements");
  const [claimedRewards, setClaimedRewards] = useState<Record<string, boolean>>({});

  const achievements = [
    {
      id: "ach_1",
      title: "First Day Scholar",
      description: "Complete your first study session in the library",
      iconName: "book-open-page-variant",
      progress: studyAnalytics.studyDays > 0 ? 1 : 0,
      target: 1,
      unlocked: studyAnalytics.studyDays >= 1,
      claimed: !!claimedRewards["ach_1"],
      reward: "2 Credits",
    },
    {
      id: "ach_2",
      title: "7-Day Streak Master",
      description: "Maintain a study streak of 7 consecutive days",
      iconName: "fire",
      progress: Math.min(7, streak),
      target: 7,
      unlocked: streak >= 7,
      claimed: !!claimedRewards["ach_2"],
      reward: "5 Credits",
    },
    {
      id: "ach_3",
      title: "Century Club (100 Hours)",
      description: "Accumulate over 100 hours of verified study time",
      iconName: "clock-check",
      progress: Math.min(100, studyAnalytics.totalStudyHours),
      target: 100,
      unlocked: studyAnalytics.totalStudyHours >= 100,
      claimed: !!claimedRewards["ach_3"],
      reward: "10 Credits",
    },
    {
      id: "ach_4",
      title: "Early Bird (Morning Shift)",
      description: "Punch in before 07:00 AM on 5 different days",
      iconName: "weather-sunset-up",
      progress: Math.min(5, studyAnalytics.studyDays),
      target: 5,
      unlocked: studyAnalytics.studyDays >= 5,
      claimed: !!claimedRewards["ach_4"],
      reward: "3 Credits",
    },
  ];

  const claimReward = (id: string, _credits: number) => {
    setClaimedRewards((prev) => ({ ...prev, [id]: true }));
  };

  const loyaltyLevel = streak >= 30 ? "Platinum" : streak >= 14 ? "Gold" : streak >= 7 ? "Silver" : "Bronze";

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20 }}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Rewards & Achievements
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          Consistency unlocks perks & bonus credits
        </Text>
      </View>

      {/* Streak Hero Banner */}
      <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
        <LinearGradient
          colors={["#FF6B00", "#FF8800CC"]}
          style={styles.streakBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.streakLeft}>
            <Text style={[styles.streakLabel, { color: "#fff9", fontFamily: "Poppins_500Medium" }]}>
              STUDY STREAK
            </Text>
            <Text style={[styles.streakCount, { color: "#fff", fontFamily: "Poppins_700Bold" }]}>
              🔥 {streak} Days
            </Text>
            <Text style={[styles.streakSub, { color: "#fff9" }]}>
              {studyAnalytics.totalStudyHours} total study hours completed!
            </Text>
          </View>
          <View style={[styles.tierTag, { backgroundColor: "#ffffff25" }]}>
            <MaterialCommunityIcons name="shield-star" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 12 }}>
              {loyaltyLevel} Tier
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.muted, marginHorizontal: 20, marginTop: 16 }]}>
        <Pressable
          style={[styles.tabBtn, tab === "achievements" && { backgroundColor: colors.card }]}
          onPress={() => setTab("achievements")}
        >
          <Text style={[styles.tabText, { color: tab === "achievements" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
            Badges
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === "loyalty" && { backgroundColor: colors.card }]}
          onPress={() => setTab("loyalty")}
        >
          <Text style={[styles.tabText, { color: tab === "loyalty" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
            Loyalty Tiers
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === "leaderboard" && { backgroundColor: colors.card }]}
          onPress={() => setTab("leaderboard")}
        >
          <Text style={[styles.tabText, { color: tab === "leaderboard" ? colors.foreground : colors.mutedForeground, fontFamily: "Poppins_600SemiBold" }]}>
            Leaderboard
          </Text>
        </Pressable>
      </View>

      {/* TAB 1: ACHIEVEMENTS */}
      {tab === "achievements" && (
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          {achievements.map((ach) => {
            const pct = Math.min(100, Math.round((ach.progress / ach.target) * 100));
            return (
              <View
                key={ach.id}
                style={[
                  styles.achCard,
                  {
                    backgroundColor: ach.claimed ? colors.success + "15" : ach.unlocked ? colors.primary + "15" : colors.card,
                    borderColor: ach.claimed ? colors.success + "60" : ach.unlocked ? colors.primary + "60" : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.achIcon,
                    {
                      backgroundColor: ach.claimed ? colors.success + "25" : ach.unlocked ? colors.primary + "25" : colors.muted,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={ach.iconName as any}
                    size={26}
                    color={ach.claimed ? colors.success : ach.unlocked ? colors.primary : colors.mutedForeground}
                  />
                </View>
                <View style={styles.achInfo}>
                  <Text style={[styles.achTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    {ach.title}
                  </Text>
                  <Text style={[styles.achDesc, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                    {ach.description}
                  </Text>
                  <View style={styles.achProgress}>
                    <View style={[styles.achProgressBar, { backgroundColor: colors.muted }]}>
                      <View style={[styles.achProgressFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.achProgressText, { color: colors.mutedForeground }]}>
                      {ach.progress}/{ach.target}
                    </Text>
                  </View>
                  {ach.unlocked && !ach.claimed && (
                    <TouchableOpacity
                      style={[styles.claimBtn, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        claimReward(ach.id, 2);
                        Alert.alert("Reward Claimed! 🎁", "2 Bonus Credits have been added to your wallet!");
                      }}
                    >
                      <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 11 }}>
                        Claim {ach.reward}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {ach.claimed && (
                    <Text style={{ fontSize: 11, color: colors.success, fontFamily: "Poppins_600SemiBold", marginTop: 4 }}>
                      ✓ Reward Claimed
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* TAB 2: LOYALTY TIERS */}
      {tab === "loyalty" && (
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          {[
            { level: "Bronze", req: "0–24 Total Credits", perk: "Standard seat booking, regular support" },
            { level: "Silver", req: "25–49 Total Credits", perk: "5% plan renewal discount, priority seat booking" },
            { level: "Gold", req: "50–99 Total Credits", perk: "10% plan renewal discount, zero cancellation fee, 2 free guest passes" },
            { level: "Platinum", req: "100+ Total Credits", perk: "15% discount, dedicated window seat reservation, VIP locker access" },
          ].map((tier) => {
            const isCurrent = loyaltyLevel === tier.level;
            return (
              <View
                key={tier.level}
                style={[
                  styles.tierCard,
                  {
                    backgroundColor: isCurrent ? colors.primary + "15" : colors.card,
                    borderColor: isCurrent ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.tierTop}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <MaterialCommunityIcons
                      name="shield-crown"
                      size={24}
                      color={tier.level === "Platinum" ? "#E5E4E2" : tier.level === "Gold" ? "#FFD700" : tier.level === "Silver" ? "#C0C0C0" : "#CD7F32"}
                    />
                    <Text style={[styles.tierTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                      {tier.level} Tier
                    </Text>
                  </View>
                  {isCurrent && (
                    <View style={[styles.activePill, { backgroundColor: colors.primary }]}>
                      <Text style={{ color: "#fff", fontSize: 10, fontFamily: "Poppins_700Bold" }}>YOUR TIER</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.tierReq, { color: colors.mutedForeground }]}>{tier.req}</Text>
                <Text style={[styles.tierPerk, { color: colors.foreground }]}>✨ {tier.perk}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* TAB 3: LEADERBOARD & PRIVACY */}
      {tab === "leaderboard" && (
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          {/* Privacy Toggle */}
          <View style={[styles.privacyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.privacyTitle, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                Leaderboard Participation
              </Text>
              <Text style={[styles.privacySub, { color: colors.mutedForeground }]}>
                Only your anonymized avatar & study hours are displayed. Personal details are 100% private.
              </Text>
            </View>
            <Switch value={isLeaderboardOptedIn} onValueChange={toggleLeaderboardPrivacy} trackColor={{ false: colors.muted, true: colors.primary }} />
          </View>

          {isLeaderboardOptedIn ? (
            <View style={{ marginTop: 12 }}>
              {leaderboard.length === 0 ? (
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 32, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
                  <MaterialCommunityIcons name="trophy-outline" size={40} color={colors.mutedForeground} />
                  <Text style={{ color: colors.foreground, fontFamily: "Poppins_600SemiBold", marginTop: 8 }}>
                    No Study Sessions Recorded
                  </Text>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Poppins_400Regular", fontSize: 12, textAlign: "center", paddingHorizontal: 20 }}>
                    Start scanning your library entry QR to rank on the study leaderboard!
                  </Text>
                </View>
              ) : (
                leaderboard.map((item) => (
                  <View
                    key={item.rank}
                    style={[
                      styles.leaderRow,
                      {
                        backgroundColor: item.isCurrentUser ? colors.primary + "15" : colors.card,
                        borderColor: item.isCurrentUser ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.rankNum, { color: item.rank <= 3 ? colors.primary : colors.mutedForeground, fontFamily: "Poppins_700Bold" }]}>
                      #{item.rank}
                    </Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.leaderName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                        {item.displayName}
                      </Text>
                      <Text style={[styles.leaderSub, { color: colors.mutedForeground }]}>
                        {item.loyaltyLevel} • 🔥 {item.streak} days streak
                      </Text>
                    </View>
                    <Text style={[styles.leaderHours, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                      {item.studyHours} hrs
                    </Text>
                  </View>
                ))
              )}
            </View>
          ) : (
            <View style={[styles.optOutBox, { backgroundColor: colors.muted }]}>
              <MaterialCommunityIcons name="eye-off" size={32} color={colors.mutedForeground} />
              <Text style={[styles.optOutText, { color: colors.mutedForeground }]}>
                You have opted out of the public leaderboard. Turn on the toggle above to join the rankings!
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 22 },
  pageSubtitle: { fontSize: 12, marginTop: 2 },
  streakBanner: { padding: 18, borderRadius: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  streakLeft: { flex: 1 },
  streakLabel: { fontSize: 11 },
  streakCount: { fontSize: 24, marginTop: 2 },
  streakSub: { fontSize: 11, marginTop: 4 },
  tierTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  tabBar: { flexDirection: "row", borderRadius: 10, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabText: { fontSize: 12 },
  achCard: { flexDirection: "row", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  achIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  achInfo: { flex: 1, marginLeft: 12 },
  achTitle: { fontSize: 14 },
  achDesc: { fontSize: 11, marginTop: 2 },
  achProgress: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  achProgressBar: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  achProgressFill: { height: "100%", borderRadius: 3 },
  achProgressText: { fontSize: 10 },
  claimBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: "flex-start", marginTop: 8 },
  tierCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  tierTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tierTitle: { fontSize: 16 },
  activePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierReq: { fontSize: 11, marginTop: 4 },
  tierPerk: { fontSize: 12, marginTop: 6 },
  privacyBox: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1 },
  privacyTitle: { fontSize: 13 },
  privacySub: { fontSize: 11, marginTop: 2 },
  leaderRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  rankNum: { fontSize: 16, width: 32 },
  leaderName: { fontSize: 13 },
  leaderSub: { fontSize: 11, marginTop: 1 },
  leaderHours: { fontSize: 15 },
  optOutBox: { padding: 30, borderRadius: 16, alignItems: "center", gap: 10, marginTop: 14 },
  optOutText: { textAlign: "center", fontSize: 12, lineHeight: 18 },
});
