import { TimePickerSheetProps } from '@/types'
import DateTimePicker from '@react-native-community/datetimepicker'
import React from 'react'
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Time Picker Sheet ────────────────────────────────────────────────────────

export default function TimePickerSheet({ visible, value, onChange, onSave, onClose }: TimePickerSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>EDIT TIME</Text>
          <TouchableOpacity onPress={onSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </View>

        <DateTimePicker
          value={value}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => date && onChange(date)}
          style={styles.picker}
          textColor="#000"
        />
      </View>
    </Modal>
  )
}

TimePickerSheet.displayName = 'TimePickerSheet'

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
  saveButton: {
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
  saveButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    letterSpacing: 2,
    color: '#C0392B',
  },
  picker: {
    width: '100%',
  },
})
