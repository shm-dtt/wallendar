import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HeaderFormat = "short" | "long" | "numeric";
export type WeekStart = "sunday" | "monday";

interface CalendarState {
  month: number;
  year: number;
  weekStart: WeekStart;
  headerFormat: HeaderFormat;
  showStrikethrough: boolean;
  showHighlight: boolean;
  // New State
  useCustomDate: boolean;
  customDay: number;

  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setWeekStart: (val: WeekStart) => void;
  setHeaderFormat: (val: HeaderFormat) => void;
  setShowStrikethrough: (val: boolean) => void;
  setShowHighlight: (val: boolean) => void;
  // New Actions
  setUseCustomDate: (val: boolean) => void;
  setCustomDay: (val: number) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      weekStart: "sunday",
      headerFormat: "full" as HeaderFormat,
      showStrikethrough: false,
      showHighlight: false,
      useCustomDate: false,
      customDay: new Date().getDate(),

      setMonth: (month) => set({ month }),
      setYear: (year) => set({ year }),
      setWeekStart: (weekStart) => set({ weekStart }),
      setHeaderFormat: (headerFormat) => set({ headerFormat }),
      setShowStrikethrough: (showStrikethrough) => set({ showStrikethrough }),
      setShowHighlight: (showHighlight) => set({ showHighlight }),
      setUseCustomDate: (useCustomDate) => set({ useCustomDate }),
      setCustomDay: (customDay) => set({ customDay }),
    }),
    {
      name: "calendar-storage",
    }
  )
);
