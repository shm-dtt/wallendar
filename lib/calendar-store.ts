import { create } from "zustand";
import { sampleImagePath } from "@/lib/calendar-utils";

export type HeaderFormat = 
  | "full" 
  | "short" 
  | "numeric" 
  | "numeric-full-year" 
  | "numeric-short-year" 
  | "short-short-year" 
  | "short-full-year";

export type ViewMode = "desktop" | "mobile";

export type DownloadResolution = "hd" | "fhd" | "4k";

export const getResolutionDimensions = (resolution: DownloadResolution, viewMode: ViewMode) => {
  if (viewMode === "mobile") {
    switch (resolution) {
      case "hd":
        return { width: 720, height: 1280 };
      case "fhd":
        return { width: 1080, height: 1920 };
      case "4k":
        return { width: 1440, height: 2560 };
    }
  } else {
    switch (resolution) {
      case "hd":
        return { width: 1280, height: 720 };
      case "fhd":
        return { width: 1920, height: 1080 };
      case "4k":
        return { width: 3840, height: 2160 };
    }
  }
};

interface CalendarState {
  // Calendar settings
  month: number | null; // null means no month selected (placeholder)
  year: number;
  weekStart: "sunday" | "monday";
  headerFormat: HeaderFormat | null;

  // Typography settings
  textColor: string;
  fontFamily: string;
  customFontName: string | null;
  applyFontToAll: boolean;

  // Background settings
  imageSrc?: string;
  currentImageIndex: number;

  // Position offsets (normalized -1..1)
  offsetX: number;
  offsetY: number;

  // View mode
  viewMode: ViewMode;

  // Loading states
  isDownloading: boolean;
  
  // Download settings
  downloadResolution: DownloadResolution;

  // Actions
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setWeekStart: (weekStart: "sunday" | "monday") => void;
  setHeaderFormat: (headerFormat: HeaderFormat) => void;
  setTextColor: (color: string) => void;
  setFontFamily: (family: string) => void;
  setCustomFontName: (name: string | null) => void;
  setApplyFontToAll: (apply: boolean) => void;
  setImageSrc: (src?: string) => void;
  handleSampleImage: () => void;
  setOffset: (x: number, y: number) => void;
  setOffsetX: (x: number) => void;
  setOffsetY: (y: number) => void;
  setViewMode: (viewMode: ViewMode) => void;
  
  // Loading state actions
  setIsDownloading: (loading: boolean) => void;
  
  // Download actions
  setDownloadResolution: (resolution: DownloadResolution) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  // Initial state - month is null (placeholder), year is current year
  month: null,
  year: new Date().getFullYear(),
  weekStart: "sunday",
  headerFormat: null,
  textColor: "#ffffff",
  fontFamily: "Product Sans",
  customFontName: null,
  applyFontToAll: false,
  imageSrc: undefined,
  currentImageIndex: 0,
  offsetX: 0,
  offsetY: 0,
  viewMode: "desktop",
  isDownloading: false,
  downloadResolution: "4k",

  // Actions
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
  setWeekStart: (weekStart) => set({ weekStart }),
  setHeaderFormat: (headerFormat) => set({ headerFormat }),
  setTextColor: (textColor) => set({ textColor }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setCustomFontName: (customFontName) => set({ customFontName }),
  setApplyFontToAll: (applyFontToAll) => set({ applyFontToAll }),
  setImageSrc: (imageSrc) => set({ imageSrc }),
  handleSampleImage: () => set((state) => {
    const nextIndex = (state.currentImageIndex + 1) % sampleImagePath.length;
    return { 
      imageSrc: sampleImagePath[nextIndex],
      currentImageIndex: nextIndex
    };
  }),
  setOffset: (x, y) => set({ offsetX: Math.max(-1, Math.min(1, x)), offsetY: Math.max(-1, Math.min(1, y)) }),
  setOffsetX: (x) => set({ offsetX: Math.max(-1, Math.min(1, x)) }),
  setOffsetY: (y) => set({ offsetY: Math.max(-1, Math.min(1, y)) }),
  setViewMode: (viewMode) => set({ viewMode }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setDownloadResolution: (downloadResolution) => set({ downloadResolution }),
}));

export const resolutionOptions = (viewMode: ViewMode) => [
  {
    value: "hd" as DownloadResolution,
    label: "HD",
    description: viewMode === "mobile" ? "720 x 1280" : "1280 x 720",
  },
  {
    value: "fhd" as DownloadResolution,
    label: "FHD",
    description: viewMode === "mobile" ? "1080 x 1920" : "1920 x 1080",
  },
  {
    value: "4k" as DownloadResolution,
    label: "4K",
    description: viewMode === "mobile" ? "1440 x 2560" : "3840 x 2160",
  },
];