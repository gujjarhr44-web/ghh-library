import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "../context/ThemeContext";
import { API_BASE } from "../lib/api-client";

interface LibraryIdSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LibraryIdSearchModal({ visible, onClose }: LibraryIdSearchModalProps) {
  const colors = useColors();
  const [pinCode, setPinCode] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (customQuery?: string) => {
    const fullQuery = customQuery || (uniqueCode.trim() ? `${pinCode.trim()}-${uniqueCode.trim()}` : pinCode.trim());
    if (!fullQuery) {
      Alert.alert("Required", "Please enter a 6-digit PIN code or full Library ID.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${API_BASE}/api/libraries/search-by-id?query=${encodeURIComponent(fullQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        if (data.length === 1 && uniqueCode.trim()) {
          // Exact single match found
          onClose();
          router.push(`/(student)/library/${data[0].id}` as any);
        }
      }
    } catch {
      Alert.alert("Error", "Could not connect to library search service.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPinCode("");
    setUniqueCode("");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="card-account-details-outline" size={26} color={colors.primary} />
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              Find by Unique Library ID
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Format: [6-Digit PIN Code] - [Unique Library Identifier] (e.g. 127306-GHH001)
          </Text>

          {/* Dual Box Input UI */}
          <View style={styles.dualBoxContainer}>
            {/* Box 1: PIN Code */}
            <View style={styles.boxWrapper}>
              <Text style={[styles.boxLabel, { color: colors.mutedForeground }]}>PIN CODE (6 Digits)</Text>
              <TextInput
                style={[
                  styles.boxInput,
                  { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border },
                ]}
                placeholder="127306"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                maxLength={6}
                value={pinCode}
                onChangeText={(text) => {
                  setPinCode(text.replace(/\D/g, ""));
                }}
              />
            </View>

            <Text style={[styles.hyphen, { color: colors.mutedForeground }]}>-</Text>

            {/* Box 2: Unique Code */}
            <View style={styles.boxWrapper}>
              <Text style={[styles.boxLabel, { color: colors.mutedForeground }]}>LIBRARY CODE</Text>
              <TextInput
                style={[
                  styles.boxInput,
                  { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border },
                ]}
                placeholder="GHH001"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                maxLength={10}
                value={uniqueCode}
                onChangeText={(text) => setUniqueCode(text.toUpperCase())}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.primary }]} onPress={() => handleSearch()}>
              <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 13 }}>
                {loading ? "Searching..." : "Search Library"}
              </Text>
            </TouchableOpacity>

            {hasSearched && (
              <TouchableOpacity style={[styles.clearBtn, { borderColor: colors.border }]} onPress={handleClear}>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Results List */}
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
          ) : results.length > 0 ? (
            <View style={{ marginTop: 16, maxHeight: 220, width: "100%" }}>
              <Text style={[styles.resultsHeader, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                Verified Libraries Found ({results.length}):
              </Text>
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.libraryItem, { backgroundColor: colors.muted, borderColor: colors.border }]}
                    onPress={() => {
                      onClose();
                      router.push(`/(student)/library/${item.id}` as any);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.itemId, { color: colors.primary, fontFamily: "Poppins_600SemiBold" }]}>
                        ID: {item.publicLibraryId || `${item.pincode || "127306"}-${item.id.slice(0, 6).toUpperCase()}`}
                      </Text>
                      <Text style={[styles.itemAddress, { color: colors.mutedForeground }]}>
                        📍 {item.area}, {item.city} (PIN: {item.pincode || "127306"})
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.mutedForeground} />
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : hasSearched ? (
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>No libraries found with this ID or PIN Code.</Text>
            </View>
          ) : null}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Poppins_500Medium" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 18,
  },
  dualBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    marginBottom: 14,
  },
  boxWrapper: {
    flex: 1,
    alignItems: "center",
  },
  boxLabel: {
    fontSize: 10,
    marginBottom: 4,
    fontFamily: "Poppins_600SemiBold",
  },
  boxInput: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1.5,
  },
  hyphen: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 14,
  },
  btnRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  searchBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  clearBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsHeader: {
    fontSize: 12,
    marginBottom: 8,
  },
  libraryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 13,
  },
  itemId: {
    fontSize: 11,
    marginTop: 1,
  },
  itemAddress: {
    fontSize: 10,
    marginTop: 2,
  },
  closeBtn: {
    marginTop: 16,
    padding: 6,
  },
});
