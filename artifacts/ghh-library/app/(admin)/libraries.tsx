import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function LibrariesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { libraries } = useData();
  const [search, setSearch] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const filtered = libraries.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
          Libraries
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
          {libraries.filter(l => l.isVerified).length} verified, {libraries.filter(l => !l.isVerified).length} pending
        </Text>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search libraries..."
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: bottomPad, gap: 10 }}
        renderItem={({ item: lib }) => (
          <View style={[styles.libCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.libHeader}>
              <View style={[styles.libIcon, { backgroundColor: colors.primary + "20" }]}>
                <MaterialCommunityIcons name="office-building" size={24} color={colors.primary} />
              </View>
              <View style={styles.libInfo}>
                <View style={styles.libNameRow}>
                  <Text style={[styles.libName, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    {lib.name}
                  </Text>
                  {lib.isVerified
                    ? <MaterialCommunityIcons name="check-decagram" size={16} color={colors.info} />
                    : <MaterialCommunityIcons name="clock-alert" size={16} color={colors.primary} />
                  }
                </View>
                <Text style={[styles.libCity, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  {lib.area}, {lib.city}
                </Text>
                <Text style={[styles.libOwner, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Owner: {lib.ownerName}
                </Text>
              </View>
            </View>
            <View style={styles.libStats}>
              <View style={styles.libStat}>
                <Text style={[styles.libStatVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                  {lib.totalSeats}
                </Text>
                <Text style={[styles.libStatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Seats
                </Text>
              </View>
              <View style={styles.libStat}>
                <Text style={[styles.libStatVal, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                  {lib.occupancyRate}%
                </Text>
                <Text style={[styles.libStatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Occupancy
                </Text>
              </View>
              <View style={styles.libStat}>
                <Text style={[styles.libStatVal, { color: colors.success, fontFamily: "Poppins_700Bold" }]}>
                  ₹{(lib.monthlyRevenue / 1000).toFixed(0)}K
                </Text>
                <Text style={[styles.libStatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Revenue
                </Text>
              </View>
              <View style={styles.libStat}>
                <Text style={[styles.libStatVal, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                  {lib.rating}
                </Text>
                <Text style={[styles.libStatLabel, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                  Rating
                </Text>
              </View>
            </View>
            {!lib.isVerified && (
              <Pressable style={[styles.verifyBtn, { backgroundColor: colors.success }]}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                <Text style={[styles.verifyBtnText, { fontFamily: "Poppins_600SemiBold" }]}>Verify Library</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: 2 },
  pageTitle: { fontSize: 26 },
  pageSubtitle: { fontSize: 13 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, height: "100%" },
  libCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 14 },
  libHeader: { flexDirection: "row", gap: 12 },
  libIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  libInfo: { flex: 1, gap: 3 },
  libNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  libName: { fontSize: 15, flex: 1 },
  libCity: { fontSize: 12 },
  libOwner: { fontSize: 12 },
  libStats: { flexDirection: "row", justifyContent: "space-between" },
  libStat: { alignItems: "center", gap: 3 },
  libStatVal: { fontSize: 16 },
  libStatLabel: { fontSize: 11 },
  verifyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, borderRadius: 10, gap: 6 },
  verifyBtnText: { fontSize: 14, color: "#fff" },
});
