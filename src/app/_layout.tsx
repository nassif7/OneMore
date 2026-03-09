import { BebasNeue_400Regular, useFonts } from '@expo-google-fonts/bebas-neue'
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono'
import { Slot } from 'expo-router'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    SpaceMono: SpaceMono_700Bold,
  })

  if (!fontsLoaded) return null

  return <Slot />
}
