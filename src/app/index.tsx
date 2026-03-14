import { BottomNav, ScreenHeader } from "@/components";
import CounterBlock from "@/components/CounterBlock";
import NudgeTicker from "@/components/NudgeTicker";
import SmokeButton from "@/components/SmokeButton";
import useSmokeLogger from "@/hooks/useSmokeLogger";
import useTodayTimes from "@/hooks/useTodayTimes";
import { getAvgGap, getTimeSinceLast } from "@/services/stats";
import { StyleSheet, View } from "react-native";
import { computePattern } from "@/services/notifications";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const [avgGapMs, setAvgGapMs] = useState<number | null>(null);

  const { times, setTimes } = useTodayTimes();
  const { nudge, handleSmoke } = useSmokeLogger({
    onSmoked: (updated) => setTimes(updated),
  });

  useEffect(() => {
    computePattern().then((p) => setAvgGapMs(p.avgGapMs));
  }, [times]); // recompute when a new cig is logged

  const count = times.length;
  const avgGap = getAvgGap(times);
  const timeSinceLast = getTimeSinceLast(times);
  const lastTs = times.length > 0 ? times[times.length - 1] : null;
  const timeSinceLastMs = lastTs !== null ? Date.now() - lastTs : null;
  const gapRatio =
    timeSinceLastMs !== null && avgGapMs !== null
      ? timeSinceLastMs / avgGapMs
      : null;

  return (
    <View style={styles.container}>
      <ScreenHeader />
      <CounterBlock
        count={count}
        avgGap={avgGap}
        timeSinceLast={timeSinceLast}
      />
      <NudgeTicker nudge={nudge} />
      <SmokeButton onPress={handleSmoke} gapRatio={gapRatio} />
      <BottomNav />
    </View>
  );
}

HomeScreen.displayName = "HomeScreen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
  },
});
