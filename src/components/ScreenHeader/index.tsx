import { ScreenHeaderProps } from '@/types'
import { router } from 'expo-router'
import { ArrowLeft, Settings } from 'lucide-react-native'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function ScreenHeader({ showBack = false, showDate = false, onAbout }: ScreenHeaderProps) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft size={20} color="#000" strokeWidth={3} />
          </TouchableOpacity>
        ) : showDate ? (
          <Text style={styles.date}>{dateStr}</Text>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>

      <View style={styles.right}>
        {onAbout ? (
          <TouchableOpacity onPress={onAbout} style={styles.iconButton}>
            <Settings size={18} color="#000" strokeWidth={3} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </View>
  )
}

ScreenHeader.displayName = 'ScreenHeader'

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 3,
    borderColor: '#000',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0E8',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  iconPlaceholder: {
    width: 36,
    height: 36,
  },
  date: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    letterSpacing: 1,
    color: '#555',
  },
})
