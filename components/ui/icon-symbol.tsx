// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for StarQuest app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "star.fill": "star",
  "star": "star-outline",
  "list.bullet": "format-list-bulleted",
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "checkmark.circle.fill": "check-circle",
  "checkmark.circle": "radio-button-unchecked",
  "trash": "delete",
  "trash.fill": "delete",
  "pencil": "edit",
  "xmark": "close",
  "xmark.circle": "cancel",
  "xmark.circle.fill": "cancel",
  "sparkles": "auto-awesome",
  "moon.stars.fill": "nights-stay",
  "chevron.left": "chevron-left",
  "chevron.up": "expand-less",
  "chevron.down": "expand-more",
  "arrow.left": "arrow-back",
  "ellipsis": "more-horiz",
  "tag.fill": "label",
  "flame.fill": "local-fire-department",
  "bolt.fill": "bolt",
  "trophy.fill": "emoji-events",
  "checkmark": "check",
  "note.text": "note",
  "chart.bar": "bar-chart",
  "gearshape.fill": "settings",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
