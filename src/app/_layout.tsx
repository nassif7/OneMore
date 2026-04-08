import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";
import {
  requestNotificationPermission,
  setupNotificationHandler,
} from "@/services/notifications";
import { BebasNeue_400Regular, useFonts } from "@expo-google-fonts/bebas-neue";
import { SpaceMono_700Bold } from "@expo-google-fonts/space-mono";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";

SystemUI.setBackgroundColorAsync("#F5F0E8");

setupNotificationHandler();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    SpaceMono: SpaceMono_700Bold,
  });
  const handleFinished = () => {
    SplashScreen.hideAsync();
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
