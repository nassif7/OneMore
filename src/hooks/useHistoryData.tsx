import { getDay } from "@/services/storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { AppState } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TDayEntry = {
  date: Date;
  label: string;
  fullDate: string;
  times: number[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// When react-native-calendars passes "YYYY-MM-DD" to new Date(),
// it parses as UTC midnight which shifts the date in non-UTC timezones.
// We correct this by adding the timezone offset back.
const fromCalendarString = (date: Date): Date => {
  const local = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return startOfDay(local);
};

const toEntry = (date: Date, times: number[]): TDayEntry => ({
  date,
  label: date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
  fullDate: date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase(),
  times,
});

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

// ─── useHistoryData ───────────────────────────────────────────────────────────

export default function useHistoryData(initialDate?: Date) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate ? startOfDay(initialDate) : startOfDay(new Date()),
  );

  const [entry, setEntry] = useState<TDayEntry | null>(null);

  const loadData = useCallback(async () => {
    const times = await getDay(selectedDate);
    setEntry(toEntry(selectedDate, times));
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active") loadData();
      });
      return () => sub.remove();
    }, [loadData]),
  );

  const goToPrevDay = () => {
    setSelectedDate((d) => {
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      return prev;
    });
  };

  const goToNextDay = () => {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    });
  };

  const goToDate = (date: Date) => {
    setSelectedDate(fromCalendarString(date));
  };

  return {
    entry,
    selectedDate,
    isToday: isToday(selectedDate),
    goToPrevDay,
    goToNextDay,
    goToDate,
    reload: loadData,
  };
}
