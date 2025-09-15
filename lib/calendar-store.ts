import { create } from "zustand";
import { sampleImagePath } from "@/lib/calendar-utils";

interface CalendarState {
  // Calendar settings
  month: number | null; // null means no month selected (placeholder)
  year: number;
  weekStart: "sunday" | "monday";

  // Typography settings
  textColor: string;
  fontFamily: string;
  customFontName: string | null;
  applyFontToAll: boolean;

  // Background settings
  imageSrc?: string;

  // Position offsets (normalized -1..1)
  offsetX: number;
  offsetY: number;

  // Actions
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setWeekStart: (weekStart: "sunday" | "monday") => void;
  setTextColor: (color: string) => void;
  setFontFamily: (family: string) => void;
  setCustomFontName: (name: string | null) => void;
  setApplyFontToAll: (apply: boolean) => void;
  setImageSrc: (src?: string) => void;
  handleSampleImage: () => void;
  setOffset: (x: number, y: number) => void;
  setOffsetX: (x: number) => void;
  setOffsetY: (y: number) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  // Initial state - month is null (placeholder), year is current year
  month: null,
  year: new Date().getFullYear(),
  weekStart: "sunday",
  textColor: "#ffffff",
  fontFamily: "Montserrat",
  customFontName: null,
  applyFontToAll: false,
  imageSrc: undefined,
  offsetX: 0,
  offsetY: 0,

  // Actions
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
  setWeekStart: (weekStart) => set({ weekStart }),
  setTextColor: (textColor) => set({ textColor }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setCustomFontName: (customFontName) => set({ customFontName }),
  setApplyFontToAll: (applyFontToAll) => set({ applyFontToAll }),
  setImageSrc: (imageSrc) => set({ imageSrc }),
  handleSampleImage: () => set({ imageSrc: sampleImagePath }),
  setOffset: (x, y) => set({ offsetX: Math.max(-1, Math.min(1, x)), offsetY: Math.max(-1, Math.min(1, y)) }),
  setOffsetX: (x) => set({ offsetX: Math.max(-1, Math.min(1, x)) }),
  setOffsetY: (y) => set({ offsetY: Math.max(-1, Math.min(1, y)) }),
}));