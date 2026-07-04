import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider, useData } from "@/context/DataContext";
import { PopupModal } from "@/components/PopupModal";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AppPopupController() {
  const pathname = usePathname();
  const { settings } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [lastMatchedPath, setLastMatchedPath] = useState<string | null>(null);

  useEffect(() => {
    if (!settings || !settings.showPopup) {
      setModalVisible(false);
      return;
    }

    const screen = settings.popupScreen;
    let shouldShow = false;

    if (screen === "any") {
      shouldShow = true;
    } else if (screen === "home" && pathname.includes("/home")) {
      shouldShow = true;
    } else if (screen === "library" && pathname.includes("/library/")) {
      shouldShow = true;
    } else if (screen === "qr" && pathname.includes("/qr")) {
      shouldShow = true;
    } else if (screen === "leave" && pathname.includes("/leave")) {
      shouldShow = true;
    }

    if (shouldShow && pathname !== lastMatchedPath) {
      setModalVisible(true);
      setLastMatchedPath(pathname);
    } else if (!shouldShow) {
      setModalVisible(false);
    }
  }, [pathname, settings?.showPopup, settings?.popupScreen]);

  // FIX BUG-15: Handle inputText from popup (e.g. user-entered email/response)
  const handleClose = (inputText?: string) => {
    setModalVisible(false);
    if (inputText && inputText.trim().length > 0) {
      // Log popup response for analytics or admin processing
      console.log("[Popup] User input received:", inputText);
      // TODO: Send to analytics API when backend supports it
    }
  };

  return <PopupModal visible={modalVisible} onClose={handleClose} />;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(owner)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    ...MaterialCommunityIcons.font,
    ...Feather.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <DataProvider>
                  <RootLayoutNav />
                  <AppPopupController />
                </DataProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
