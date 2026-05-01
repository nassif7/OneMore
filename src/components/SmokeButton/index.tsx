import { SmokeButtonProps } from '@/types'
import React, { useRef } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Smoke Button ─────────────────────────────────────────────────────────────

export default function SmokeButton({ onPress }: SmokeButtonProps) {
  const buttonScale = useRef(new Animated.Value(1)).current
  const flashOpacity = useRef(new Animated.Value(0)).current

  const handlePress = async (): Promise<void> => {
    // Button slam
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 4,
        stiffness: 300,
      }),
    ]).start()

    // Fire flash
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 0.3,
        duration: 40,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start()

    await onPress()
  }

  return (
    <>
      <View style={styles.container}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.button}>
            <Text style={styles.buttonText}>{'+\nONE MORE'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Fire flash overlay — covers full screen */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#C0392B', opacity: flashOpacity }]}
      />
    </>
  )
}

SmokeButton.displayName = 'SmokeButton'

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
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#C0392B',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'BebasNeue',
    fontSize: 30,
    color: '#fff',
    letterSpacing: 3,
    textAlign: 'center',
    lineHeight: 34,
  },
})
