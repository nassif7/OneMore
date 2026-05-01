import { NudgeTickerProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function NudgeTicker({ nudge }: NudgeTickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{nudge}</Text>
    </View>
  )
}

NudgeTicker.displayName = 'NudgeTicker'

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
    color: '#C0392B',
    letterSpacing: 3,
  },
})
