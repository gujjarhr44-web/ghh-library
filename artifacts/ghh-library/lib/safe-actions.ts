import { router } from "expo-router";
import { Alert, Linking } from "react-native";

export type SafeActionType =
  | "DISMISS"
  | "OPEN_SCREEN"
  | "OPEN_MODAL"
  | "OPEN_URL"
  | "OPEN_LIBRARY"
  | "OPEN_BOOKING"
  | "OPEN_WALLET"
  | "OPEN_PROFILE"
  | "SHOW_NOTICE";

/**
 * Executes strictly predefined, safe remote actions.
 * Arbitrary executable code / eval is 100% blocked (Rule #83).
 */
export function executeSafeAction(
  actionString?: string | null,
  callbacks?: {
    onOpenModal?: (modalName: string) => void;
    onDismiss?: () => void;
  }
) {
  if (!actionString) return;

  const [actionType, ...params] = actionString.split(":");
  const param = params.join(":");

  switch (actionType?.trim().toUpperCase()) {
    case "DISMISS":
      callbacks?.onDismiss?.();
      break;

    case "OPEN_SCREEN":
      if (param === "home") router.push("/(student)/home" as any);
      else if (param === "discover") router.push("/(student)/home" as any);
      else if (param === "wallet") router.push("/(student)/wallet" as any);
      else if (param === "rewards") router.push("/(student)/rewards" as any);
      else if (param === "profile") router.push("/(student)/home" as any);
      else if (param.startsWith("/")) router.push(param as any);
      break;

    case "OPEN_MODAL":
      callbacks?.onOpenModal?.(param);
      break;

    case "OPEN_WALLET":
      router.push("/(student)/wallet" as any);
      break;

    case "OPEN_BOOKING":
    case "OPEN_LIBRARY":
      if (param) {
        router.push(`/(student)/library/${param}` as any);
      } else {
        router.push("/(student)/home" as any);
      }
      break;

    case "OPEN_PROFILE":
      router.push("/(student)/home" as any);
      break;

    case "OPEN_URL":
      if (param && (param.startsWith("https://") || param.startsWith("http://"))) {
        Linking.openURL(param).catch(() => {});
      }
      break;

    case "SHOW_NOTICE":
      Alert.alert("Notice", param || "Announcement from Library Administration.");
      break;

    default:
      console.warn(`Unrecognized or unwhitelisted safe action: ${actionString}`);
      break;
  }
}
