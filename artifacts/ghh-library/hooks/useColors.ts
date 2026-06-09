import { useColorScheme } from "react-native";
import colors from "@/constants/colors";
import { useData } from "@/context/DataContext";

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Falls back to the light palette when no dark key is defined in
 * constants/colors.ts (the scaffold ships light-only by default).
 * When a sibling web artifact's dark tokens are synced into a `dark`
 * key, this hook will automatically switch palettes based on the
 * device's appearance setting.
 */
export function useColors() {
  const scheme = useColorScheme();
  const palette =
    scheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;

  let primaryColor = palette.primary;
  try {
    const data = useData();
    if (data && data.settings && data.settings.themeColor) {
      primaryColor = data.settings.themeColor;
    }
  } catch (e) {
    // Fallback if context is not available yet
  }

  return { ...palette, primary: primaryColor, radius: colors.radius };
}
