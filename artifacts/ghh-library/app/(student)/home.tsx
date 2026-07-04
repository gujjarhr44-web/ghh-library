import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LibraryCard } from "@/components/LibraryCard";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { WifiAttendanceWidget } from "@/components/WifiAttendanceWidget";

const FILTERS = ["All", "AC", "WiFi", "Parking", "24x7", "Open Now"];
const CITIES = ["All Cities", "Pune", "New Delhi", "Bangalore", "Chennai"];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { libraries, wallet, settings } = useData();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCity, setActiveCity] = useState("All Cities");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const filtered = useMemo(() => {
    return libraries.filter(lib => {
      const matchSearch = lib.name.toLowerCase().includes(search.toLowerCase()) ||
        lib.area.toLowerCase().includes(search.toLowerCase()) ||
        lib.city.toLowerCase().includes(search.toLowerCase());
      const matchFilter = activeFilter === "All" ||
        activeFilter === "Open Now" ? lib.isOpen :
        lib.facilities.includes(activeFilter);
      const matchCity = activeCity === "All Cities" || lib.city === activeCity;
      return matchSearch && matchFilter && matchCity;
    });
  }, [libraries, search, activeFilter, activeCity]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              Good morning,
            </Text>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              {user?.name?.split(" ")[0]}
            </Text>
          </View>
          {settings.showQuickStats && (
            <View style={styles.headerRight}>
              <View style={[styles.creditBadge, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
                <MaterialCommunityIcons name="wallet" size={14} color={colors.primary} />
                <Text style={[styles.creditCount, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
                  {wallet.available}
                </Text>
                <Text style={[styles.creditLabel, { color: colors.primary, fontFamily: "Poppins_400Regular" }]}>
                  credits
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll} contentContainerStyle={styles.cityContent}>
          {CITIES.map(city => (
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
              <Text style={[styles.cityText, {
                color: activeCity === city ? "#fff" : colors.foreground,
                fontFamily: "Poppins_500Medium",
              }]}>
                {city}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {settings.showFacilities && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
            {FILTERS.map(f => (
              <Pressable
                key={f}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: activeFilter === f ? colors.primary + "20" : "transparent",
                    borderColor: activeFilter === f ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, {
                  color: activeFilter === f ? colors.primary : colors.mutedForeground,
                  fontFamily: "Poppins_500Medium",
                }]}>
                  {f}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
      <WifiAttendanceWidget />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <LibraryCard library={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        scrollEnabled={filtered.length > 0}
        ListHeaderComponent={
          <Text style={[styles.resultCount, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            {filtered.length} {filtered.length === 1 ? "library" : "libraries"} found
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bookshelf" size={52} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
              No libraries found
            </Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8, gap: 12 },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  greeting: { fontSize: 13 },
  name: { fontSize: 22, marginTop: -2 },
  headerRight: { alignItems: "flex-end" },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  creditCount: { fontSize: 16 },
  creditLabel: { fontSize: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, height: "100%" },
  cityScroll: { marginHorizontal: -20 },
  cityContent: { paddingHorizontal: 20, gap: 8 },
  cityChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  cityText: { fontSize: 13 },
  filterScroll: { marginHorizontal: -20 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13 },
  list: { paddingHorizontal: 20, paddingTop: 12 },
  resultCount: { fontSize: 13, marginBottom: 8 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { fontSize: 16 },
  emptyHint: { fontSize: 13 },
});
