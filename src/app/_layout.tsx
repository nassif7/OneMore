import { useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  requestNotificationPermission,
  setupNotificationHandler,
} from "@/services/notifications";
import { BebasNeue_400Regular, useFonts } from "@expo-google-fonts/bebas-neue";
import { SpaceMono_700Bold } from "@expo-google-fonts/space-mono";
import { Slot } from "expo-router";
import { useEffect } from "react";
import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";

setupNotificationHandler();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    SpaceMono: SpaceMono_700Bold,
  });
  const handleFinished = () => {
    SplashScreen.hideAsync(); // ← hides the native splash, animated one takes over
    setSplashDone(true);
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!fontsLoaded) return null;

  if (!splashDone) {
    return <AnimatedSplashScreen onFinished={handleFinished} />;
  }

  return <Slot />;
}

RootLayout.displayName = "RootLayout";
