import { router } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface IScreenHeaderProps {
  showBack?: boolean
  title?: string
  showSubtitle?: boolean
}

const getDateStrings = () => {
  const now = new Date()
  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  return { weekday, date }
}

export default function ScreenHeader({
  showBack = false,
  title = 'ONEMORE',
  showSubtitle = false,
}: IScreenHeaderProps) {
  const { weekday, date } = getDateStrings()

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.appName}>{title}</Text>
          {showSubtitle && <Text style={styles.tagline}>NO GUILT. JUST COUNTS.</Text>}
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.dateText}>{weekday}</Text>
        <Text style={styles.dateText}>{date}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: '#F5F0E8',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  backButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    color: '#000',
  },
  appName: {
    fontFamily: 'BebasNeue',
    fontSize: 42,
    lineHeight: 42,
    letterSpacing: 2,
    color: '#000',
  },
  tagline: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#555',
    letterSpacing: 1,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontFamily: 'BebasNeue',
    fontSize: 13,
    letterSpacing: 2,
    color: '#000',
  },
})
