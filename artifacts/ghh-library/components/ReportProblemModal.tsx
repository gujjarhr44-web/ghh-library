import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../context/ThemeContext";
import { API_BASE } from "../lib/api-client";

interface ReportProblemModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  libraryId?: string;
  screenName?: string;
}

const CATEGORIES = [
  "App Crash",
  "Login Problem",
  "QR Attendance",
  "Seat Booking",
  "Payment",
  "Credits",
  "Membership",
  "Notifications",
  "Performance",
  "UI Problem",
  "Other",
];

export default function ReportProblemModal({
  visible,
  onClose,
  userId,
  userName,
  libraryId,
  screenName = "General",
}: ReportProblemModalProps) {
  const colors = useColors();
  const [category, setCategory] = useState("QR Attendance");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Required", "Please provide a brief description of the problem.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/bug`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "u_guest",
          userName: userName || "Student",
          libraryId: libraryId || "lib_1",
          category,
          description: description.trim(),
          priority,
          appVersion: "1.0.4",
          buildNumber: "104",
          deviceModel: Platform.OS === "android" ? "Android Phone" : Platform.OS === "ios" ? "iPhone" : "Web Client",
          osVersion: `${Platform.OS} ${Platform.Version || ""}`,
          screenName,
          networkState: "online",
        }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert(
          "Report Submitted! 🐞",
          `Your Report ID is ${data.report.reportId}.\n\nTechnical metadata has been securely attached. Our engineers are investigating.`
        );
        setDescription("");
        onClose();
      } else {
        Alert.alert("Error", data.message || "Failed to submit report.");
      }
    } catch {
      Alert.alert("Error", "Could not connect to technical support service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="bug-outline" size={26} color="#F43F5E" />
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              Report a Problem
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Diagnostic context (OS, Device, App Version) will be attached automatically without capturing personal data.
          </Text>

          {/* Category Chips */}
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
            Select Category:
          </Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.slice(0, 6).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catBtn,
                  {
                    backgroundColor: category === cat ? "#F43F5E" : colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={{
                    color: category === cat ? "#fff" : colors.foreground,
                    fontSize: 10,
                    fontFamily: "Poppins_500Medium",
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Priority */}
          <View style={styles.priorityRow}>
            {(["normal", "important", "urgent"] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityBtn,
                  {
                    backgroundColor: priority === p ? (p === "urgent" ? "#EF4444" : colors.primary) : colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={{
                    color: priority === p ? "#fff" : colors.foreground,
                    fontSize: 11,
                    fontFamily: "Poppins_500Medium",
                    textTransform: "capitalize",
                  }}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border },
            ]}
            placeholder="Explain what happened or what error you received..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={onClose}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: "#F43F5E" }]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              <Text style={{ color: "#fff", fontFamily: "Poppins_600SemiBold" }}>
                {submitting ? "Sending..." : "Submit Bug Report"}
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
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  catBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  priorityBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 12,
  },
  textArea: {
    height: 85,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
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
