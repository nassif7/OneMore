import AnimatedSplashScreen from "@/components/AnimatedSplashScreen";
import {
  requestNotificationPermission,
  setupNotificationHandler,
} from "@/services/notifications";
import { markSplashSeen, shouldPlaySplash } from "@/services/settings";
import { BebasNeue_400Regular, useFonts } from "@expo-google-fonts/bebas-neue";
import { SpaceMono_700Bold } from "@expo-google-fonts/space-mono";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { router, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";

SystemUI.setBackgroundColorAsync("#F5F0E8");

setupNotificationHandler();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const [playSplash, setPlaySplash] = useState<boolean | null>(null);
  const [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    SpaceMono: SpaceMono_700Bold,
  });
  const version = Constants.expoConfig?.version ?? "0";
  const handleFinished = () => {
    markSplashSeen(version);
    setSplashDone(true);
  };

  useEffect(() => {
    shouldPlaySplash(version)
      .catch(() => false)
      .then(setPlaySplash);
  }, [version]);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.replace("/");
    });
    return () => sub.remove();
  }, []);

  const ready = fontsLoaded && playSplash !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  if (playSplash && !splashDone) {
    return <AnimatedSplashScreen onFinished={handleFinished} />;
  }

  return <Slot />;
}

RootLayout.displayName = "RootLayout";
