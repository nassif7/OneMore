import { ToggleProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Toggle ───────────────────────────────────────────────────────────────────

export default function Toggle({ value, onChange }: ToggleProps) {
  return (
    <View style={styles.track}>
      <TouchableOpacity onPress={() => onChange(false)} style={[styles.option, !value && styles.optionActive]}>
        <Text style={[styles.optionText, !value && styles.optionTextActive]}>OFF</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onChange(true)} style={[styles.option, value && styles.optionActive]}>
        <Text style={[styles.optionText, value && styles.optionTextActive]}>ON</Text>
      </TouchableOpacity>
    </View>
  )
}

Toggle.displayName = 'Toggle'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#000',
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  optionActive: {
    backgroundColor: '#000',
  },
  optionText: {
    fontFamily: 'BebasNeue',
    fontSize: 14,
    letterSpacing: 1,
    color: '#000',
  },
  optionTextActive: {
    color: '#fff',
  },
})
