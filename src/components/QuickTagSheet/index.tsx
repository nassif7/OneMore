import TagPicker from '@/components/TagPicker'
import { QuickTagSheetProps } from '@/types'
import React, { useEffect, useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Quick Tag Sheet ──────────────────────────────────────────────────────────

export default function QuickTagSheet({ visible, showSkipNudge, onSelect, onSkip, onDisablePrompt, onClose }: QuickTagSheetProps) {
  const [showingNudge, setShowingNudge] = useState(false)

  useEffect(() => {
    if (visible) setShowingNudge(false)
  }, [visible])

  const handleSkip = () => {
    onSkip()
    if (showSkipNudge) {
      setShowingNudge(true)
    } else {
      onClose()
    }
  }

  const handleDisable = () => {
    onDisablePrompt()
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        {showingNudge ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>SKIPPED.</Text>
            </View>
            <View style={styles.nudge}>
              <Text style={styles.nudgeText}>STOP ASKING AFTER EACH LOG?</Text>
              <Text style={styles.nudgeSubtext}>
                You&apos;ll still be able to tag from History. Manage this anytime in Settings.
              </Text>
              <View style={styles.nudgeButtons}>
                <TouchableOpacity onPress={onClose} style={styles.noButton}>
                  <Text style={styles.noButtonText}>NO</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDisable} style={styles.yesButton}>
                  <Text style={styles.yesButtonText}>YES, STOP ASKING</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>TAG THIS ONE?</Text>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>SKIP</Text>
              </TouchableOpacity>
            </View>
            <TagPicker value={undefined} onChange={(tag) => tag && onSelect(tag)} />
          </>
        )}
      </View>
    </Modal>
  )
}

QuickTagSheet.displayName = 'QuickTagSheet'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#F5F0E8',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#000',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    letterSpacing: 2,
    color: '#000',
  },
  skipButton: {
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  skipButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    letterSpacing: 2,
    color: '#C0392B',
  },
  nudge: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 16,
    gap: 8,
  },
  nudgeText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    letterSpacing: 1,
    color: '#000',
  },
  nudgeSubtext: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#666',
    lineHeight: 16,
  },
  nudgeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  noButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  noButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 15,
    letterSpacing: 1,
    color: '#000',
  },
  yesButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  yesButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 15,
    letterSpacing: 1,
    color: '#fff',
  },
})
