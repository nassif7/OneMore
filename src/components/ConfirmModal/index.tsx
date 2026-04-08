import React from 'react'
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface ConfirmModalProps {
  visible: boolean
  title: string
  body: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ visible, title, body, confirmLabel = 'CONFIRM', onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

ConfirmModal.displayName = 'ConfirmModal'

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#F5F0E8',
    borderWidth: 3,
    borderColor: '#000',
    padding: 24,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  title: {
    fontFamily: 'BebasNeue',
    fontSize: 32,
    letterSpacing: 2,
    color: '#000',
    marginBottom: 12,
  },
  body: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#333',
    lineHeight: 18,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cancelText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    letterSpacing: 1,
    color: '#000',
  },
  confirmButton: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  confirmText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    letterSpacing: 1,
    color: '#fff',
  },
})
