import { NEXT_NOTIF_BODY_KEY, NEXT_NOTIF_TIME_KEY } from '@/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'

// ─── Permission ───────────────────────────────────────────────────────────────

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// ─── Handler setup ────────────────────────────────────────────────────────────

// ─── Handler Setup ────────────────────────────────────────────────────────────

export const setupNotificationHandler = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })
}

// ─── Readers ──────────────────────────────────────────────────────────────────

export const getNextNotificationTime = async (): Promise<number | null> => {
  const val = await AsyncStorage.getItem(NEXT_NOTIF_TIME_KEY)
  return val ? parseInt(val, 10) : null
}

export const getNextNotificationBody = async (): Promise<string | null> => {
  return AsyncStorage.getItem(NEXT_NOTIF_BODY_KEY)
}
