import { ConfirmModal, ScreenHeader } from '@/components'
import { clearAllData } from '@/services/storage'
import { router } from 'expo-router'
import { Coffee, RotateCcw } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const KOFI_URL = 'https://ko-fi.com/nn498137'

export default function AboutScreen() {
  const [resetVisible, setResetVisible] = useState(false)
  const cursorOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: false }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
      ])
    ).start()
  }, [])

  const handleResetConfirm = async () => {
    try {
      await clearAllData()
      setResetVisible(false)
      router.replace('/')
    } catch (error) {
      console.error('[AboutScreen] Failed to reset data:', error)
      Alert.alert('ERROR', 'Failed to reset. Please try again.')
      setResetVisible(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader showBack />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.appName}>ONEMORE</Text>
          <Text style={styles.tagline}>NO GUILT. JUST COUNTS.</Text>
          <Text style={styles.description}>
            A simple cigarette tracker. No ads, no accounts, no data leaving your phone. Built by one person, for people who want to be honest with themselves.
          </Text>
        </View>

        <TouchableOpacity style={styles.kofiButton} onPress={() => Linking.openURL(KOFI_URL)}>
          <Coffee size={18} color="#fff" strokeWidth={2.5} />
          <Text style={styles.kofiText}>BUY ME A COFFEE</Text>
        </TouchableOpacity>

        <Text style={styles.kofiSub}>If the app is useful to you, a coffee goes a long way.</Text>

        <TouchableOpacity style={styles.resetButton} onPress={() => setResetVisible(true)}>
          <RotateCcw size={18} color="#fff" strokeWidth={3} />
          <Text style={styles.resetText}>RESET ALL DATA</Text>
        </TouchableOpacity>

          <View style={styles.terminal}>
            <Text style={styles.intentionText}>{'> '}Built with intention, shipped with love</Text>
            <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>█</Animated.Text>
          </View>


        <View style={styles.footer}>
          <Text style={styles.footerText}>Made by n|N</Text>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={styles.privacyLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmModal
        visible={resetVisible}
        title="RESET ALL DATA?"
        body="This will permanently delete all your logs. This cannot be undone."
        confirmLabel="RESET"
        onConfirm={handleResetConfirm}
        onCancel={() => setResetVisible(false)}
      />
    </View>
  )
}

AboutScreen.displayName = 'AboutScreen'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  card: {
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  appName: {
    fontFamily: 'BebasNeue',
    fontSize: 52,
    letterSpacing: 4,
    color: '#000',
    lineHeight: 52,
  },
  tagline: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#555',
    letterSpacing: 2,
    marginBottom: 16,
  },
  description: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#333',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  kofiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#C0392B',
    paddingVertical: 14,
    shadowColor: '#C0392B',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  kofiText: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    letterSpacing: 2,
    color: '#fff',
  },
  kofiSub: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: -8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#C0392B',
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  resetText: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    letterSpacing: 2,
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
  },
  terminal: {
    position: 'absolute',
    bottom: 64,
    left: 20,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    borderWidth: 2,
    borderColor: '#27AE60',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  intentionText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#27AE60',
    letterSpacing: 1,
  },
  cursor: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#27AE60',
    lineHeight: 14,
  },
  privacyLink: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#000',
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
})
