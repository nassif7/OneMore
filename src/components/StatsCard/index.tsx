import { ArrowRight } from 'lucide-react-native'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Stats Card ───────────────────────────────────────────────────────────────
// A tappable summary card: mono title, "→" affordance, hard offset shadow.

export type StatsCardProps = {
  title: string
  accessibilityLabel: string
  onPress: () => void
  children: React.ReactNode
}

export default function StatsCard({ title, accessibilityLabel, onPress, children }: StatsCardProps) {
  return (
    <View style={styles.shadow}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <ArrowRight size={16} color="#000" strokeWidth={3} />
        </View>
        {children}
      </TouchableOpacity>
    </View>
  )
}

StatsCard.displayName = 'StatsCard'

const styles = StyleSheet.create({
  shadow: {
    marginHorizontal: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 3, color: '#000' },
})
