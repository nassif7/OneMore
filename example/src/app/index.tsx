import { useFonts } from "expo-font";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const NUDGES: string[] = [
  "GO ON THEN.",
  "WE'RE NOT JUDGING.",
  "YOUR LUNGS, YOUR RULES.",
  "ONE MORE NEVER KILLED— wait.",
  "DO IT. DO IT. DO IT.",
  "ACCOUNTABILITY? NEVER HEARD OF HER.",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FireParticleProps {
  x: number;
  delay: number;
}

interface FireParticleData {
  id: number;
  x: number;
  delay: number;
}

interface HomeScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

// ─── Fire Particle ────────────────────────────────────────────────────────────

function FireParticle({ x, delay }: FireParticleProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const EMOJIS = ["🔥", "💥", "✨", "🔥", "🔥"];
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const size = 16 + Math.floor(Math.random() * 22);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -130,
        duration: 750,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 750,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.2,
        duration: 750,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x,
        bottom: 10,
        fontSize: size,
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [count, setCount] = useState<number>(0);
  const [nudge, setNudge] = useState<string>(NUDGES[0]);
  const [fires, setFires] = useState<FireParticleData[]>([]);
  const [pressed, setPressed] = useState<boolean>(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    BebasNeue: require("./assets/fonts/BebasNeue-Regular.ttf"),
    SpaceMono: require("./assets/fonts/SpaceMono-Bold.ttf"),
  });

  const handleSmoke = (): void => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.94,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setPressed(true);
    setCount((c) => c + 1);
    setNudge(NUDGES[Math.floor(Math.random() * NUDGES.length)]);

    const newFires: FireParticleData[] = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * (width * 0.5 - 60),
      delay: Math.random() * 250,
    }));

    setFires(newFires);

    setTimeout(() => {
      setPressed(false);
      setFires([]);
    }, 1000);
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appName}>ONEMORE</Text>
          <Text style={styles.tagline}>NO GUILT. JUST COUNTS.</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.dateText}>SUN</Text>
          <Text style={styles.dateText}>MAR 8</Text>
        </View>
      </View>

      {/* Counter block */}
      <View style={styles.counterBlock}>
        <View>
          <Text style={styles.label}>TODAY'S COUNT</Text>
          <Text style={styles.countNumber}>{count}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.packsLabel}>≈ PACKS</Text>
          <Text style={styles.packsNumber}>{(count / 20).toFixed(1)}</Text>
        </View>
      </View>

      {/* Nudge ticker */}
      <View style={styles.nudgeTicker}>
        <Text style={styles.nudgeText}>{nudge}</Text>
      </View>

      {/* Button area */}
      <View style={styles.buttonArea}>
        {fires.map((f) => (
          <FireParticle key={f.id} x={f.x} delay={f.delay} />
        ))}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPress={handleSmoke}
            activeOpacity={1}
            style={[styles.smokeButton, pressed && styles.smokeButtonPressed]}
          >
            <Text
              style={[styles.buttonText, pressed && styles.buttonTextPressed]}
            >
              {"+\nONE MORE"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, { borderRightWidth: 3 }]}
          onPress={() => navigation?.navigate("Stats")}
        >
          <Text style={styles.navText}>STATS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation?.navigate("History")}
        >
          <Text style={styles.navText}>HISTORY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
  },

  // Top bar
  topBar: {
    borderBottomWidth: 3,
    borderColor: "#000",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  appName: {
    fontFamily: "BebasNeue",
    fontSize: 42,
    lineHeight: 42,
    letterSpacing: 2,
    color: "#000",
  },
  tagline: {
    fontFamily: "SpaceMono",
    fontSize: 10,
    color: "#555",
    letterSpacing: 1,
    marginTop: 2,
  },
  dateText: {
    fontFamily: "BebasNeue",
    fontSize: 13,
    letterSpacing: 2,
    color: "#000",
  },

  // Counter
  counterBlock: {
    borderBottomWidth: 3,
    borderColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "#F5F0E8",
  },
  label: {
    fontFamily: "SpaceMono",
    fontSize: 11,
    letterSpacing: 3,
    color: "#000",
    marginBottom: 2,
  },
  countNumber: {
    fontFamily: "BebasNeue",
    fontSize: 100,
    lineHeight: 100,
    letterSpacing: -2,
    color: "#000",
  },
  packsLabel: {
    fontFamily: "SpaceMono",
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
  },
  packsNumber: {
    fontFamily: "BebasNeue",
    fontSize: 36,
    color: "#000",
  },

  // Nudge
  nudgeTicker: {
    borderBottomWidth: 3,
    borderColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#000",
  },
  nudgeText: {
    fontFamily: "BebasNeue",
    fontSize: 18,
    color: "#FF4500",
    letterSpacing: 3,
  },

  // Button
  buttonArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  smokeButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FF4500",
    borderWidth: 3,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  smokeButtonPressed: {
    backgroundColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    elevation: 2,
  },
  buttonText: {
    fontFamily: "BebasNeue",
    fontSize: 30,
    color: "#fff",
    letterSpacing: 3,
    textAlign: "center",
    lineHeight: 34,
  },
  buttonTextPressed: {
    color: "#FF4500",
  },

  // Bottom nav
  bottomNav: {
    borderTopWidth: 3,
    borderColor: "#000",
    flexDirection: "row",
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderColor: "#000",
    backgroundColor: "#F5F0E8",
  },
  navText: {
    fontFamily: "BebasNeue",
    fontSize: 16,
    letterSpacing: 3,
    color: "#000",
  },
});
