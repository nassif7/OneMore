import { Href, router, usePathname } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type TNavItem = {
  id: string
  label: string
  route: Href
}

const NAV_ITEMS: TNavItem[] = [
  { id: 'home', label: 'HOME', route: '/' },
  { id: 'stats', label: 'STATS', route: '/stats' },
  { id: 'history', label: 'HISTORY', route: '/history' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item, i) => {
        const isActive = pathname === item.route
        const isLast = i === NAV_ITEMS.length - 1

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.push(item.route)}
            style={[styles.navButton, !isLast && styles.navButtonBorder, isActive && styles.navButtonActive]}
          >
            <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

BottomNav.displayName = 'BottomNav'

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 3,
    borderColor: '#000',
    flexDirection: 'row',
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F5F0E8',
  },
  navButtonBorder: {
    borderRightWidth: 3,
    borderColor: '#000',
  },
  navButtonActive: {
    backgroundColor: '#000',
  },
  navText: {
    fontFamily: 'BebasNeue',
    fontSize: 16,
    letterSpacing: 3,
    color: '#000',
  },
  navTextActive: {
    color: '#FF3B3B',
  },
})
