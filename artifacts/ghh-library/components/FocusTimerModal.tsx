import React, { useState, useEffect } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../context/ThemeContext";

interface FocusTimerModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
}

export default function FocusTimerModal({ visible, onClose, userId }: FocusTimerModalProps) {
  const colors = useColors();
  const [seconds, setSeconds] = useState(25 * 60); // 25 min default pomodoro
  const [isActive, setIsActive] = useState(false);
  const [selectedTag, setSelectedTag] = useState("UPSC / Govt");

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      Alert.alert("Focus Session Complete! 🎉", `Great job! You completed 25 minutes of deep focus on ${selectedTag}.`);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(25 * 60);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="timer-outline" size={28} color={colors.primary} />
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
              Deep Focus Mode (Pomodoro)
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
            Dedicated personal focus timer decoupled from formal attendance records (Part 31).
          </Text>

          {/* Time Display */}
          <View style={[styles.timerCircle, { borderColor: colors.primary, backgroundColor: colors.muted }]}>
            <Text style={[styles.timerText, { color: colors.primary, fontFamily: "Poppins_700Bold" }]}>
              {formatTime(seconds)}
            </Text>
            <Text style={[styles.tagText, { color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }]}>
              {selectedTag}
            </Text>
          </View>

          {/* Tags */}
          <View style={styles.tagRow}>
            {["UPSC / Govt", "NEET / JEE", "Coding", "Reading"].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagBtn,
                  {
                    backgroundColor: selectedTag === tag ? colors.primary : colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedTag(tag)}
              >
                <Text
                  style={{
                    color: selectedTag === tag ? "#fff" : colors.foreground,
                    fontSize: 11,
                    fontFamily: "Poppins_500Medium",
                  }}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: isActive ? "#EF4444" : colors.primary }]}
              onPress={() => setIsActive(!isActive)}
            >
              <Text style={styles.btnText}>{isActive ? "Pause" : "Start Focus Session"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.resetBtn, { borderColor: colors.border }]} onPress={handleReset}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Poppins_500Medium" }}>Reset</Text>
            </TouchableOpacity>
          </View>

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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
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
    marginBottom: 20,
  },
  timerCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 38,
  },
  tagText: {
    fontSize: 12,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 20,
  },
  tagBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },
  resetBtn: {
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    marginTop: 14,
    padding: 6,
  },
});
