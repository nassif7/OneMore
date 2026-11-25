import { ToggleProps } from '@/types'
import * as Haptics from 'expo-haptics'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Toggle ───────────────────────────────────────────────────────────────────
// A settings row with a single-state switch on the right. The box shows the CURRENT state:
// ON is a pressed-in red button, OFF is an empty cream box. Tapping anywhere on the row flips it.

export default function Toggle({ label, value, onChange, nested = false }: ToggleProps) {
  const handlePress = () => {
    Haptics.selectionAsync()
    onChange(!value)
  }

  return (
    <TouchableOpacity
      style={[styles.row, nested && styles.rowNested]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
    >
      <Text style={nested ? styles.subLabel : styles.label}>{label}</Text>
      <View style={[styles.box, value ? styles.boxOn : styles.boxOff]}>
        <Text style={[styles.boxText, value ? styles.boxTextOn : styles.boxTextOff]}>{value ? 'ON' : 'OFF'}</Text>
      </View>
    </TouchableOpacity>
  )
}

Toggle.displayName = 'Toggle'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowNested: {
    borderTopWidth: 2,
    borderColor: '#000',
    paddingLeft: 28,
  },
  label: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    letterSpacing: 1,
    color: '#000',
  },
  subLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    letterSpacing: 1,
    color: '#333',
  },
  // Fixed width so the row doesn't jump between states.
  box: {
    width: 64,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  boxOn: {
    backgroundColor: '#C0392B',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  boxOff: {
    backgroundColor: '#F5F0E8',
  },
  boxText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    letterSpacing: 1,
  },
  boxTextOn: {
    color: '#fff',
  },
  boxTextOff: {
    color: '#888',
  },
})
