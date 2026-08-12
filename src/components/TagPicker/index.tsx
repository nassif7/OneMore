import { TAGS } from '@/constants/tags'
import { TagPickerProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS = 3

// ─── Tag Picker ───────────────────────────────────────────────────────────────

export default function TagPicker({ value, onChange }: TagPickerProps) {
  return (
    <View style={styles.grid}>
      {TAGS.map((t, i) => {
        const isActive = value === t.id
        const isLastColumn = (i + 1) % COLUMNS === 0
        const isLastRow = i >= TAGS.length - (TAGS.length % COLUMNS || COLUMNS)
        const Icon = t.icon

        return (
          <TouchableOpacity
            key={t.id}
            onPress={() => onChange(isActive ? undefined : t.id)}
            style={[styles.tile, isActive && styles.tileActive, !isLastColumn && styles.tileBorderRight, !isLastRow && styles.tileBorderBottom]}
            activeOpacity={0.8}
          >
            <Icon size={24} strokeWidth={3} color={isActive ? '#fff' : '#000'} />
            <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

TagPicker.displayName = 'TagPicker'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: '#000',
  },
  tile: {
    width: `${100 / COLUMNS}%`,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
  },
  tileActive: {
    backgroundColor: '#000',
  },
  tileBorderRight: {
    borderRightWidth: 2,
    borderColor: '#000',
  },
  tileBorderBottom: {
    borderBottomWidth: 2,
    borderColor: '#000',
  },
  label: {
    fontFamily: 'BebasNeue',
    fontSize: 11,
    letterSpacing: 1,
    color: '#000',
    textAlign: 'center',
  },
  labelActive: {
    color: '#fff',
  },
})
