import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LibraryCard } from "@/components/LibraryCard";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { WifiAttendanceWidget } from "@/components/WifiAttendanceWidget";
import FocusTimerModal from "@/components/FocusTimerModal";
import SupportTicketModal from "@/components/SupportTicketModal";
import LibraryIdSearchModal from "@/components/LibraryIdSearchModal";
import DigitalTwinViewerModal from "@/components/DigitalTwinViewerModal";

const FILTERS = ["All", "AC", "WiFi", "Parking", "24x7", "Open Now"];
const CITIES = ["All Cities", "Pune", "New Delhi", "Bangalore", "Chennai"];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { libraries, wallet, settings, streak, studyAnalytics, queryAiAssistant } = useData();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCity, setActiveCity] = useState("All Cities");

  // Focus Timer & Support & Digital Twin Modal state
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLibraryIdModal, setShowLibraryIdModal] = useState(false);
  const [showDigitalTwinModal, setShowDigitalTwinModal] = useState(false);

  // AI Assistant Modal state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const filtered = useMemo(() => {
    return libraries.filter((lib) => {
      const matchSearch =
        lib.name.toLowerCase().includes(search.toLowerCase()) ||
        lib.area.toLowerCase().includes(search.toLowerCase()) ||
        lib.city.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        activeFilter === "All" ||
        (activeFilter === "Open Now" ? lib.isOpen : lib.facilities.includes(activeFilter));
      const matchCity = activeCity === "All Cities" || lib.city === activeCity;
      return matchSearch && matchFilter && matchCity;
    });
  }, [libraries, search, activeFilter, activeCity]);

  const handleAskAi = async (customPrompt?: string) => {
    const q = customPrompt || aiQuery;
    if (!q.trim()) return;
    setAiLoading(true);
    const res = await queryAiAssistant(q, "student");
    setAiResponse(res.reply);
    setAiLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              Good morning 👋
            </Text>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {user?.name || "Student"}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.aiBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}
              onPress={() => setShowAiModal(true)}
            >
              <MaterialCommunityIcons name="robot" size={16} color={colors.primary} />
              <Text style={[styles.aiBadgeText, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
                Ask AI
              </Text>
            </TouchableOpacity>

            {settings.showQuickStats && (
              <View style={[styles.creditBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
                <MaterialCommunityIcons name="wallet" size={14} color={colors.primary} />
                <Text style={[styles.creditCount, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                  {wallet.billingMode === "membership" ? "Active" : wallet.available}
                </Text>
                <Text style={[styles.creditLabel, { color: colors.primary, fontFamily: "Poppins_400Regular" }]}>
                  {wallet.billingMode === "membership" ? "pass" : "credits"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Live Active Study Status Bar */}
        <View style={[styles.studyStatusBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>Assigned Seat</Text>
            <Text style={[styles.statusVal, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
              {user?.assignedSeat || "A-12"} ({user?.assignedShift || "Morning"})
            </Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>Today's Study</Text>
            <Text style={[styles.statusVal, { color: colors.success, fontFamily: "Poppins_600SemiBold" }]}>
              {studyAnalytics.averageDailyHours} 🔥 {streak}d
            </Text>
          </View>
        </View>

        {/* Quick Action Shortcuts */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(student)/qr" as any)}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={20} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
              Scan QR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(student)/library/lib001" as any)}
          >
            <MaterialCommunityIcons name="calendar-check" size={20} color={colors.info} />
            <Text style={[styles.quickActionText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
              Book Seat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(student)/leave" as any)}
          >
            <MaterialCommunityIcons name="umbrella-beach" size={20} color={colors.warning} />
            <Text style={[styles.quickActionText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
              Leave
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowFocusModal(true)}
          >
            <MaterialCommunityIcons name="timer-outline" size={20} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
              Focus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowDigitalTwinModal(true)}
          >
            <MaterialCommunityIcons name="floor-plan" size={20} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
              Space Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(student)/wallet" as any)}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={colors.success} />
            <Text style={[styles.quickActionText, { color: colors.foreground, fontFamily: "Poppins_500Medium" }]}>
              Recharge
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Box */}
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search libraries, cities, areas..."
            placeholderTextColor={colors.mutedForeground}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Unique Library ID / PIN Search Quick Action */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 7,
            paddingHorizontal: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.primary + "40",
            backgroundColor: colors.primary + "10",
            marginTop: 8,
          }}
          onPress={() => setShowLibraryIdModal(true)}
        >
          <MaterialCommunityIcons name="card-account-details-outline" size={16} color={colors.primary} />
          <Text style={{ fontSize: 11, color: colors.primary, fontFamily: "Poppins_600SemiBold" }}>
            Search by 6-Digit PIN & Library ID (e.g. 127306-GHH001)
          </Text>
        </TouchableOpacity>

        {/* City Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll} contentContainerStyle={styles.cityContent}>
          {CITIES.map((city) => (
            <Pressable
              key={city}
              style={[
                styles.cityChip,
                {
                  backgroundColor: activeCity === city ? colors.primary : colors.card,
                  borderColor: activeCity === city ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveCity(city)}
            >
              <Text
                style={[
                  styles.cityText,
                  {
                    color: activeCity === city ? "#fff" : colors.mutedForeground,
                    fontFamily: activeCity === city ? "Poppins_600SemiBold" : "Poppins_400Regular",
                  },
                ]}
              >
                {city}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <LibraryCard library={item} distanceKm={index === 0 ? 0.8 : index === 1 ? 2.4 : 4.1} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <WifiAttendanceWidget />
            <Text style={[styles.sectionHeading, { color: colors.foreground, fontFamily: "Poppins_700Bold", marginTop: 10 }]}>
              Explore Study Spaces ({filtered.length})
            </Text>
          </View>
        }
      />

      {/* AI Assistant Modal */}
      <Modal visible={showAiModal} transparent animationType="slide">
        <View style={styles.aiModalOverlay}>
          <View style={[styles.aiModalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.aiModalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MaterialCommunityIcons name="robot-excited" size={24} color={colors.primary} />
                <Text style={[styles.aiModalTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                  GHH Study AI
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAiModal(false)}>
                <MaterialCommunityIcons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.aiBody} showsVerticalScrollIndicator={false}>
              {/* Quick AI Suggestions */}
              <Text style={[styles.aiPromptLabel, { color: colors.mutedForeground }]}>Quick Questions:</Text>
              <View style={styles.aiSuggestions}>
                <TouchableOpacity
                  style={[styles.aiChip, { backgroundColor: colors.muted }]}
                  onPress={() => handleAskAi("मेरे कितने credits बचे हैं?")}
                >
                  <Text style={[styles.aiChipText, { color: colors.foreground }]}>💳 कितने credits बचे हैं?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.aiChip, { backgroundColor: colors.muted }]}
                  onPress={() => handleAskAi("मैंने इस महीने कितने घंटे study किया?")}
                >
                  <Text style={[styles.aiChipText, { color: colors.foreground }]}>⏱️ कितने घंटे study किया?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.aiChip, { backgroundColor: colors.muted }]}
                  onPress={() => handleAskAi("कल morning में seat available है?")}
                >
                  <Text style={[styles.aiChipText, { color: colors.foreground }]}>🪑 कल Morning में सीट खाली है?</Text>
                </TouchableOpacity>
              </View>

              {aiLoading && (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={{ color: colors.mutedForeground, marginTop: 8, fontSize: 12 }}>Consulting GHH Assistant...</Text>
                </View>
              )}

              {aiResponse && (
                <View style={[styles.aiResponseBox, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                  <Text style={[styles.aiResponseText, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}>
                    {aiResponse}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.aiInputRow}>
              <TextInput
                style={[styles.aiTextInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
                placeholder="Ask anything about your credits, study, seats..."
                placeholderTextColor={colors.mutedForeground}
                value={aiQuery}
                onChangeText={setAiQuery}
                onSubmitEditing={() => handleAskAi()}
              />
              <TouchableOpacity
                style={[styles.aiSendBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleAskAi()}
              >
                <MaterialCommunityIcons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Focus Timer Pomodoro Modal */}
      <FocusTimerModal
        visible={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        userId={user?.id}
      />

      {/* Support / Issue Reporting Modal */}
      <SupportTicketModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        userId={user?.id}
        userName={user?.name}
        libraryId={libraries[0]?.id}
      />

      {/* Unique Library ID & PIN Search Modal */}
      <LibraryIdSearchModal
        visible={showLibraryIdModal}
        onClose={() => setShowLibraryIdModal(false)}
      />

      {/* Multi-Floor Digital Twin Space Map Modal */}
      <DigitalTwinViewerModal
        visible={showDigitalTwinModal}
        onClose={() => setShowDigitalTwinModal(false)}
        libraryName={libraries[0]?.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 10 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: 13 },
  name: { fontSize: 20 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  aiBadgeText: { fontSize: 11 },
  creditBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  creditCount: { fontSize: 13 },
  creditLabel: { fontSize: 11 },
  studyStatusBar: { flexDirection: "row", justifyContent: "space-around", padding: 10, borderRadius: 12, borderWidth: 1, marginTop: 10 },
  statusItem: { alignItems: "center" },
  statusLabel: { fontSize: 10 },
  statusVal: { fontSize: 12, marginTop: 1 },
  statusDivider: { width: 1, height: 20, backgroundColor: "#fff2" },
  quickActionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 8 },
  quickActionBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 4 },
  quickActionText: { fontSize: 11 },
  searchBox: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 42, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, height: "100%", paddingHorizontal: 8, fontSize: 13 },
  cityScroll: { marginTop: 10 },
  cityContent: { gap: 8 },
  cityChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  cityText: { fontSize: 12 },
  sectionHeading: { fontSize: 16 },
  aiModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  aiModalContent: { height: "70%", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20 },
  aiModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  aiModalTitle: { fontSize: 18 },
  aiBody: { flex: 1 },
  aiPromptLabel: { fontSize: 12, marginBottom: 8 },
  aiSuggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  aiChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  aiChipText: { fontSize: 12 },
  aiResponseBox: { padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 10 },
  aiResponseText: { fontSize: 13, lineHeight: 20 },
  aiInputRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  aiTextInput: { flex: 1, height: 44, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, fontSize: 13 },
  aiSendBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
});
