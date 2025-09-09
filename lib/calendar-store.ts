import { create } from "zustand";
import { sampleImagePath } from "@/lib/calendar-utils";

interface InitialData {
  currentMonth: number;
  currentYear: number;
}

interface CalendarState {
  // Calendar settings
  month: number;
  year: number;
  weekStart: "sunday" | "monday";

  // Typography settings
  textColor: string;
  fontFamily: string;
  customFontName: string | null;
  applyFontToAll: boolean;

  // Background settings
  imageSrc?: string;

  // Initial data
  initialData: InitialData | null;

  // Actions
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setWeekStart: (weekStart: "sunday" | "monday") => void;
  setTextColor: (color: string) => void;
  setFontFamily: (family: string) => void;
  setCustomFontName: (name: string | null) => void;
  setApplyFontToAll: (apply: boolean) => void;
  setImageSrc: (src?: string) => void;
  setInitialData: (data: InitialData) => void;
  handleSampleImage: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  // Initial state
  month: 0,
  year: new Date().getFullYear(),
  weekStart: "sunday",
  textColor: "#ffffff",
  fontFamily: "Montserrat",
  customFontName: null,
  applyFontToAll: false,
  imageSrc: undefined,
  initialData: null,

  // Actions
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
  setWeekStart: (weekStart) => set({ weekStart }),
  setTextColor: (textColor) => set({ textColor }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setCustomFontName: (customFontName) => set({ customFontName }),
  setApplyFontToAll: (applyFontToAll) => set({ applyFontToAll }),
  setImageSrc: (imageSrc) => set({ imageSrc }),
  setInitialData: (initialData) =>
    set({
      initialData,
      month: initialData.currentMonth,
      year: initialData.currentYear,
    }),
  handleSampleImage: () => {
    const { initialData } = get();
    if (initialData) {
      set({ imageSrc: sampleImagePath });
    }
  },
}));
