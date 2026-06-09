import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";

interface PopupModalProps {
  visible: boolean;
  onClose: (inputText?: string) => void;
}

export function PopupModal({ visible, onClose }: PopupModalProps) {
  const colors = useColors();
  const { settings } = useData();
  const [inputText, setInputText] = useState("");

  if (!settings || !settings.showPopup || !visible) return null;

  const handleConfirm = () => {
    onClose(inputText);
    setInputText("");
  };

  const handleClose = () => {
    onClose();
    setInputText("");
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header / Icon */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
                <MaterialCommunityIcons name="information" size={28} color={colors.primary} />
              </View>
              <Pressable style={styles.closeBtn} onPress={handleClose}>
                <MaterialCommunityIcons name="close" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {/* Content */}
            <View style={styles.body}>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: "Poppins_700Bold" }]}>
                {settings.popupTitle || "Notification"}
              </Text>
              
              <Text style={[styles.message, { color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>
                {settings.popupMessage}
              </Text>

              {/* Dynamic Image Media Support */}
              {!!settings.popupMediaUrl && (
                <Image
                  source={{ uri: settings.popupMediaUrl }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
              )}

              {/* Dynamic Input Prompt Support */}
              {!!settings.popupPromptPlaceholder && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, { 
                      color: colors.foreground, 
                      borderColor: colors.border, 
                      backgroundColor: colors.background,
                      fontFamily: "Poppins_400Regular"
                    }]}
                    placeholder={settings.popupPromptPlaceholder}
                    placeholderTextColor={colors.mutedForeground}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                  />
                </View>
              )}
            </View>

            {/* Buttons Footer */}
            <View style={styles.footer}>
              {!!settings.popupSecondaryButtonText && (
                <Pressable
                  style={[styles.btn, styles.btnSecondary, { borderColor: colors.border }]}
                  onPress={handleClose}
                >
                  <Text style={[styles.btnTextSecondary, { color: colors.foreground, fontFamily: "Poppins_600SemiBold" }]}>
                    {settings.popupSecondaryButtonText}
                  </Text>
                </Pressable>
              )}
              
              <Pressable
                style={[styles.btn, styles.btnPrimary, { backgroundColor: colors.primary }]}
                onPress={handleConfirm}
              >
                <Text style={[styles.btnTextPrimary, { fontFamily: "Poppins_600SemiBold" }]}>
                  {settings.popupPrimaryButtonText || "Confirm"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    width: Math.min(width * 0.88, 380),
    maxHeight: "80%",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediaImage: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginTop: 8,
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 8,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimary: {
    elevation: 2,
  },
  btnSecondary: {
    borderWidth: 1,
  },
  btnTextPrimary: {
    color: "#fff",
    fontSize: 14,
  },
  btnTextSecondary: {
    fontSize: 14,
  },
});
