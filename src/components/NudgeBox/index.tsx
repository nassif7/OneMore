import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatTimeUntil } from "@/helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface INudgeBoxProps {
  nextNotificationTime: number | null;
  nextNotificationBody: string | null;
}

// ─── Nudge Box ────────────────────────────────────────────────────────────────

export default function NudgeBox({
  nextNotificationTime,
  nextNotificationBody,
}: INudgeBoxProps) {
  const timeUntil =
    nextNotificationTime !== null
      ? formatTimeUntil(nextNotificationTime - Date.now())
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {timeUntil !== null ? `IN ${timeUntil}` : "NO NUDGE"}
      </Text>
      <Text style={styles.body}>{nextNotificationBody ?? "—"}</Text>
    </View>
  );
}

NudgeBox.displayName = "NudgeBox";

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#000",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
  },
  label: {
    fontFamily: "SpaceMono",
    fontSize: 11,
    letterSpacing: 2,
    color: "#fff",
  },
  body: {
    fontFamily: "BebasNeue",
    fontSize: 22,
    letterSpacing: 2,
    color: "#FF4500",
    flexShrink: 1,
  },
});
