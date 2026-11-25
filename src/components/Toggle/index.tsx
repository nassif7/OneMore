import { ToggleProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Toggle ───────────────────────────────────────────────────────────────────

export default function Toggle({ value, onChange }: ToggleProps) {
  return (
    <View style={styles.track}>
      <TouchableOpacity onPress={() => onChange(false)} style={[styles.option, !value && styles.optionOff]}>
        <Text style={[styles.optionText, !value && styles.optionTextSelected]}>OFF</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onChange(true)} style={[styles.option, value && styles.optionOn]}>
        <Text style={[styles.optionText, value && styles.optionTextSelected]}>ON</Text>
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
  // Selected segment: ON is black, OFF is red, both with white text. Unselected stays white/black.
  optionOn: {
    backgroundColor: '#000',
  },
  optionOff: {
    backgroundColor: '#C0392B',
  },
  optionText: {
    fontFamily: 'BebasNeue',
    fontSize: 14,
    letterSpacing: 1,
    color: '#000',
  },
  optionTextSelected: {
    color: '#fff',
  },
})
