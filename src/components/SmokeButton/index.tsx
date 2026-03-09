import React, { useRef, useState } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SmokeButtonProps {
  onPress: () => void
}

// ─── Smoke Button ─────────────────────────────────────────────────────────────

export default function SmokeButton({ onPress }: SmokeButtonProps) {
  const [pressed, setPressed] = useState<boolean>(false)

  const buttonScale = useRef(new Animated.Value(1)).current
  const flashOpacity = useRef(new Animated.Value(0)).current

  const handlePress = (): void => {
    // Button slam
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.9, duration: 70, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, damping: 4, stiffness: 300 }),
    ]).start()

    // Fire flash
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.3, duration: 40, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start()

    setPressed(true)
    setTimeout(() => setPressed(false), 120)

    onPress()
  }

  return (
    <>
      <View style={styles.container}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={1}
            style={[styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={[styles.buttonText, pressed && styles.buttonTextPressed]}>{'+\nONE MORE'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Fire flash overlay — covers full screen */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#FF4500', opacity: flashOpacity }]}
      />
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF3B3B',
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    elevation: 2,
  },
  buttonText: {
    fontFamily: 'BebasNeue',
    fontSize: 30,
    color: '#fff',
    letterSpacing: 3,
    textAlign: 'center',
    lineHeight: 34,
  },
  buttonTextPressed: {
    color: '#FF3B3B',
  },
})

SmokeButton.displayName = 'SmokeButton'
