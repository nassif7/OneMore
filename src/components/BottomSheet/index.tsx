import React, { useEffect, useMemo, useState } from 'react'
import { Animated, Modal, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
// Same look as QuickTagSheet, plus swipe-down to close (drag the handle or the title), backdrop
// tap and hardware back. The body scrolls when it is taller than the sheet.

export type BottomSheetProps = {
  visible: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

const CLOSE_DISTANCE = 110
const CLOSE_VELOCITY = 0.9

export default function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const [translateY] = useState(() => new Animated.Value(0))
  useEffect(() => {
    if (visible) translateY.setValue(0)
  }, [visible, translateY])

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
        onPanResponderMove: (_, g) => translateY.setValue(Math.max(0, g.dy)),
        onPanResponderRelease: (_, g) => {
          if (g.dy > CLOSE_DISTANCE || g.vy > CLOSE_VELOCITY) {
            Animated.timing(translateY, { toValue: 700, duration: 160, useNativeDriver: true }).start(() => onClose())
          } else {
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start()
          }
        },
      }),
    [translateY, onClose],
  )

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View {...pan.panHandlers}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
          </View>
        </View>
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false} bounces={false}>
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  )
}

BottomSheet.displayName = 'BottomSheet'

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    maxHeight: '88%',
    backgroundColor: '#F5F0E8',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000',
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: { width: 40, height: 4, backgroundColor: '#000', alignSelf: 'center', marginBottom: 16 },
  header: { paddingHorizontal: 20, marginBottom: 12 },
  title: { fontFamily: 'BebasNeue', fontSize: 28, letterSpacing: 2, color: '#000' },
  body: { flexGrow: 0 },
})
