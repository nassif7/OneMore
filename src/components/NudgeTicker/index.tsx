import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NudgeTickerProps {
  nudge: string
}

// ─── Nudge Ticker ─────────────────────────────────────────────────────────────

export default function NudgeTicker({ nudge }: NudgeTickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{nudge}</Text>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  text: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    color: '#FF3B3B',
    letterSpacing: 3,
  },
})

NudgeTicker.displayName = 'NudgeTicker'
