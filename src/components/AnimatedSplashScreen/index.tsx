import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue'
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono'
import React, { useEffect } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

// ─── Brand tokens ────────────────────────────────────────────────────────────
const BG = '#F5F0E8'
const RED = '#C0392B'
const BLACK = '#000000'
const CREAM = '#F5F0E8'

const { width: SW, height: SH } = Dimensions.get('window')
const PANEL_SIZE = Math.min(SW * 0.78, 340)
const SHADOW_OFFSET = 12
const BORDER = 8
const CROSS_ARM = PANEL_SIZE * 0.42
const CROSS_THICK = PANEL_SIZE * 0.13

const TICKER_ITEMS = [
  '• ONE MORE',
  '• TRACK IT',
  "• DON'T QUIT",
  '• ONE MORE',
  '• TRACK IT',
  "• DON'T QUIT",
  '• ONE MORE',
  '• TRACK IT',
  "• DON'T QUIT",
]

export default function AnimatedSplashScreen({ onFinished }: AnimatedSplashScreenProps) {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular, SpaceMono_700Bold })

  // ── Shared values ──────────────────────────────────────────────────────────
  const flashOpacity = useSharedValue(0)

  const barHeight = useSharedValue(0)

  const shadowOpacity = useSharedValue(0)
  const shadowTranslate = useSharedValue(0)

  const panelScale = useSharedValue(0.08)
  const panelRotate = useSharedValue(-8)
  const panelOpacity = useSharedValue(0)

  const crossHScale = useSharedValue(0)
  const crossVScale = useSharedValue(0)

  const stampOpacity = useSharedValue(0)
  const stampTranslate = useSharedValue(-10)

  const tickerReveal = useSharedValue(0)
  const tickerX = useSharedValue(0)

  const titleOpacity = useSharedValue(0)
  const titleTranslate = useSharedValue(18)

  // ── Ticker scroll width (approximate) ─────────────────────────────────────
  const TICKER_FULL_W = TICKER_ITEMS.length * 120

  // ── Animation sequence ────────────────────────────────────────────────────
  useEffect(() => {
    if (!fontsLoaded) return

    const E = Easing
    const sharp = E.bezier(0.77, 0, 0.18, 1)
    const spring = { damping: 12, stiffness: 160, mass: 0.8 }

    // 0ms — red flash out
    flashOpacity.value = withTiming(0, {
      duration: 300,
      easing: E.out(E.quad),
    })

    // 50ms — bars slam in
    barHeight.value = withDelay(50, withTiming(52, { duration: 320, easing: sharp }))

    // 250ms — shadow drops
    shadowOpacity.value = withDelay(250, withTiming(1, { duration: 300, easing: sharp }))
    shadowTranslate.value = withDelay(250, withTiming(SHADOW_OFFSET, { duration: 300, easing: sharp }))

    // 300ms — panel pops in with spring
    panelOpacity.value = withDelay(300, withTiming(1, { duration: 60 }))
    panelScale.value = withDelay(300, withSpring(1, spring))
    panelRotate.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 140 }))

    // 750ms — cross H sweeps
    crossHScale.value = withDelay(750, withTiming(1, { duration: 380, easing: sharp }))

    // 870ms — cross V sweeps
    crossVScale.value = withDelay(870, withTiming(1, { duration: 380, easing: sharp }))

    // 1050ms — stamp appears
    stampOpacity.value = withDelay(1050, withTiming(1, { duration: 300 }))
    stampTranslate.value = withDelay(1050, withTiming(0, { duration: 300, easing: E.out(E.quad) }))

    // 1100ms — ticker reveals
    tickerReveal.value = withDelay(1100, withTiming(1, { duration: 280, easing: sharp }))

    // 1150ms — ticker scrolls forever
    tickerX.value = withDelay(
      1150,
      withTiming(-TICKER_FULL_W, {
        duration: 7000,
        easing: E.linear,
      }),
    )

    // 1200ms — title rises
    titleOpacity.value = withDelay(1200, withTiming(1, { duration: 420 }))
    titleTranslate.value = withDelay(1200, withTiming(0, { duration: 420, easing: E.out(E.quad) }))

    // 2600ms — done, hand off
    const timeout = setTimeout(() => onFinished(), 2600)
    return () => clearTimeout(timeout)
  }, [fontsLoaded])

  // ── Animated styles ────────────────────────────────────────────────────────
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }))

  const barTopStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }))
  const barBotStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }))

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: shadowOpacity.value,
    transform: [{ translateX: shadowTranslate.value }, { translateY: shadowTranslate.value }],
  }))

  const panelStyle = useAnimatedStyle(() => ({
    opacity: panelOpacity.value,
    transform: [{ scale: panelScale.value }, { rotate: `${panelRotate.value}deg` }],
  }))

  const crossHStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: crossHScale.value }],
  }))
  const crossVStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: crossVScale.value }],
  }))

  const stampStyle = useAnimatedStyle(() => ({
    opacity: stampOpacity.value,
    transform: [{ translateY: stampTranslate.value }],
  }))

  const tickerStripStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: tickerReveal.value }],
  }))

  const tickerScrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tickerX.value }],
  }))

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }))

  if (!fontsLoaded) return null

  return (
    <View style={styles.root}>
      {/* Flash overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} pointerEvents="none" />

      {/* Subtle grid */}
      <View style={[StyleSheet.absoluteFill, styles.grid]} pointerEvents="none" />

      {/* Top bar */}
      <Animated.View style={[styles.barTop, barTopStyle]}>
        <Text style={styles.barTicks} numberOfLines={1}>/ / / / / / / / / / / / / / / / /</Text>
        <Text style={styles.barVersion}>v1.0</Text>
      </Animated.View>

      {/* Stage */}
      <View style={styles.stage}>
        {/* Shadow */}
        <Animated.View style={[styles.shadow, { width: PANEL_SIZE, height: PANEL_SIZE }, shadowStyle]} />

        {/* Red panel */}
        <Animated.View style={[styles.panel, { width: PANEL_SIZE, height: PANEL_SIZE }, panelStyle]}>
          {/* Corner stamp */}
          <Animated.View style={[styles.stamp, stampStyle]}>
            <Text style={styles.stampOne}>ONE</Text>
            <Text style={styles.stampMore}>MORE</Text>
          </Animated.View>

          {/* Ticker strip at bottom of panel */}
          <Animated.View style={[styles.tickerStrip, tickerStripStyle]}>
            <Animated.View style={[styles.tickerInner, tickerScrollStyle]}>
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                <Text key={i} style={styles.tickerText}>
                  {t}
                </Text>
              ))}
            </Animated.View>
          </Animated.View>
        </Animated.View>

        {/* Cross / Plus */}
        <View style={[styles.cross, { width: PANEL_SIZE * 0.9, height: PANEL_SIZE * 0.9 }]}>
          <Animated.View
            style={[
              styles.crossH,
              {
                height: CROSS_THICK,
                marginTop: -CROSS_THICK / 2,
              },
              crossHStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.crossV,
              {
                width: CROSS_THICK,
                marginLeft: -CROSS_THICK / 2,
              },
              crossVStyle,
            ]}
          />
        </View>

        {/* Title below panel */}
        <Animated.View style={[styles.titleWrap, { top: PANEL_SIZE + 18 }]}>
          <Animated.View style={titleStyle}>
            <Text style={styles.titleText}>ONEMORE</Text>
            <Text style={styles.tagline}>track it. don't quit.</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Bottom bar */}
      <Animated.View style={[styles.barBot, barBotStyle]} />
    </View>
  )
}

AnimatedSplashScreen.displayName = 'AnimatedSplashScreen'

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flash: {
    backgroundColor: RED,
    zIndex: 100,
  },
  grid: {
    // Subtle grid via repeating pattern — skipped on native for perf,
    // but you can swap in a lightweight SVG background here.
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  barTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: BLACK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
    overflow: 'hidden',
  },
  barBot: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BLACK,
    zIndex: 10,
  },
  barTicks: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 14,
    color: CREAM,
    letterSpacing: 4,
    flexShrink: 1,
  },
  barVersion: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 11,
    color: 'rgba(245,240,232,0.45)',
    letterSpacing: 2,
  },

  // Stage
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Panel
  shadow: {
    position: 'absolute',
    backgroundColor: BLACK,
    top: 0,
    left: 0,
  },
  panel: {
    backgroundColor: RED,
    borderWidth: BORDER,
    borderColor: BLACK,
    overflow: 'hidden',
    position: 'relative',
  },

  // Stamp
  stamp: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 3,
  },
  stampOne: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 44,
    color: CREAM,
    lineHeight: 44,
  },
  stampMore: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 14,
    color: CREAM,
    letterSpacing: 4,
    marginTop: 2,
  },

  // Ticker
  tickerStrip: {
    position: 'absolute',
    bottom: 0,
    left: -BORDER,
    right: -BORDER,
    height: 40,
    backgroundColor: CREAM,
    borderTopWidth: 5,
    borderTopColor: BLACK,
    justifyContent: 'center',
    overflow: 'hidden',
    transformOrigin: 'bottom',
  },
  tickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerText: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 13,
    color: RED,
    paddingHorizontal: 14,
    letterSpacing: 2,
  },

  // Cross
  cross: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossH: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: BLACK,
    top: '50%',
  },
  crossV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: BLACK,
    left: '50%',
  },

  // Title
  titleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 64,
    color: BLACK,
    letterSpacing: 8,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 12,
    color: '#6b6560',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 2,
  },
})
