import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../context/ThemeContext";
import { API_BASE } from "../lib/api-client";

interface SupportTicketModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  libraryId?: string;
}

export default function SupportTicketModal({ visible, onClose, userId, userName, libraryId }: SupportTicketModalProps) {
  const colors = useColors();
  const [category, setCategory] = useState("noise");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert("Required", "Please provide a subject and brief description of the issue.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/support/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "u_guest",
          userName: userName || "Student",
          libraryId: libraryId || "lib_1",
          category,
          subject: subject.trim(),
          description: description.trim(),
        }),
      });

      if (res.ok) {
        Alert.alert("Report Submitted! 📨", "Your issue report has been logged. The library manager has been notified.");
        setSubject("");
        setDescription("");
        onClose();
      }
    } catch {
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="lifebuoy" size={26} color={colors.primary} />
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              Report Issue / Support
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Confidential reporting for noise, WiFi, AC, or seat issues (Part 61, 62).
          </Text>

          {/* Category Selector */}
          <View style={styles.categoryRow}>
            {[
              { key: "noise", label: "🤫 Noise" },
              { key: "wifi", label: "📶 WiFi" },
              { key: "ac", label: "❄️ AC" },
              { key: "seat", label: "🪑 Seat" },
              { key: "payment", label: "💳 Payment" },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.catBtn,
                  {
                    backgroundColor: category === cat.key ? colors.primary : colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Text
                  style={{
                    color: category === cat.key ? "#fff" : colors.foreground,
                    fontSize: 11,
                    fontFamily: "Poppins_500Medium",
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
            placeholder="Issue Subject (e.g. Low WiFi speed on 2nd Floor)"
            placeholderTextColor={colors.mutedForeground}
            value={subject}
            onChangeText={setSubject}
          />

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border },
            ]}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={onClose}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>
                {submitting ? "Submitting..." : "Submit Report"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
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
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  catBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtn: {
    flex: 2,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
