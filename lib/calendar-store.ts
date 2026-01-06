import { sampleImagePath } from "@/lib/calendar-utils";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

export type HeaderFormat =
  | "full"
  | "short"
  | "numeric"
  | "numeric-full-year"
  | "numeric-short-year"
  | "short-short-year"
  | "short-full-year";

export type TextOverlayPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ViewMode = "desktop" | "mobile";

export type DownloadResolution = "hd" | "fhd" | "4k";

export const getResolutionDimensions = (
  resolution: DownloadResolution,
  viewMode: ViewMode,
) => {
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
  calendarScale: number;

  // Custom uploaded fonts (shared globally)
  uploadedFonts: { name: string; displayName: string }[];

  // Text overlay settings
  textOverlay: {
    enabled: boolean;
    content: string;
    fontSize: number;
    font: string;
    useTypographyFont: boolean;
    position: TextOverlayPosition;
  };

  persistedAt?: number;

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
  setCalendarScale: (scale: number) => void;

  // Text overlay actions
  setTextOverlayEnabled: (enabled: boolean) => void;
  setTextOverlayContent: (content: string) => void;
  setTextOverlayFontSize: (fontSize: number) => void;
  setTextOverlayFont: (font: string) => void;
  setTextOverlayUseTypographyFont: (useTypographyFont: boolean) => void;
  setTextOverlayPosition: (position: TextOverlayPosition) => void;

  // Uploaded fonts actions
  addUploadedFont: (font: { name: string; displayName: string }) => void;
  removeUploadedFont: (name: string) => void;
}

const createStorage = () =>
  createJSONStorage(() => {
    if (typeof window === "undefined") {
      const noopStorage: StateStorage = {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      };
      return noopStorage;
    }
    return window.localStorage;
  });

const ONE_HOUR_MS = 60 * 60 * 1000;

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      // Initial state - month is current month, year is current year
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      weekStart: "sunday",
      headerFormat: "full",
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
      calendarScale: 1,
      uploadedFonts: [],
      textOverlay: {
        enabled: false,
        content: "",
        fontSize: 1,
        font: "Product Sans",
        useTypographyFont: true,
        position: "center",
      },
      persistedAt: undefined,

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
      handleSampleImage: () =>
        set((state) => {
          const nextIndex =
            (state.currentImageIndex + 1) % sampleImagePath.length;
          return {
            imageSrc: sampleImagePath[nextIndex],
            currentImageIndex: nextIndex,
          };
        }),
      setOffset: (x, y) =>
        set({
          offsetX: Math.max(-1, Math.min(1, x)),
          offsetY: Math.max(-1, Math.min(1, y)),
        }),
      setOffsetX: (x) => set({ offsetX: Math.max(-1, Math.min(1, x)) }),
      setOffsetY: (y) => set({ offsetY: Math.max(-1, Math.min(1, y)) }),
      setViewMode: (viewMode) => set({ viewMode }),
      setIsDownloading: (isDownloading) => set({ isDownloading }),
      setDownloadResolution: (downloadResolution) =>
        set({ downloadResolution }),
      setCalendarScale: (calendarScale) =>
        set({
          calendarScale: Math.max(0.5, Math.min(1.5, calendarScale)),
        }),
      setTextOverlayEnabled: (enabled) =>
        set((state) => ({
          textOverlay: { ...state.textOverlay, enabled },
        })),
      setTextOverlayContent: (content) =>
        set((state) => ({
          textOverlay: { ...state.textOverlay, content },
        })),
      setTextOverlayFontSize: (fontSize) =>
        set((state) => ({
          textOverlay: {
            ...state.textOverlay,
            fontSize: Math.max(0.5, Math.min(2, fontSize)),
          },
        })),
      setTextOverlayFont: (font) =>
        set((state) => ({
          textOverlay: { ...state.textOverlay, font },
        })),
      setTextOverlayUseTypographyFont: (useTypographyFont) =>
        set((state) => ({
          textOverlay: { ...state.textOverlay, useTypographyFont },
        })),
      setTextOverlayPosition: (position) =>
        set((state) => ({
          textOverlay: { ...state.textOverlay, position },
        })),
      addUploadedFont: (font) =>
        set((state) => ({
          uploadedFonts: [...state.uploadedFonts, font],
        })),
      removeUploadedFont: (name) =>
        set((state) => ({
          uploadedFonts: state.uploadedFonts.filter((f) => f.name !== name),
        })),
    }),
    {
      name: "calendar-wallpaper-store",
      storage: createStorage(),
      partialize: (state) => ({
        month: state.month,
        year: state.year,
        weekStart: state.weekStart,
        headerFormat: state.headerFormat,
        textColor: state.textColor,
        fontFamily: state.fontFamily,
        customFontName: state.customFontName,
        applyFontToAll: state.applyFontToAll,
        // imageSrc is excluded from persistence to avoid localStorage quota issues
        // It will remain in memory during the session but won't be saved
        currentImageIndex: state.currentImageIndex,
        offsetX: state.offsetX,
        offsetY: state.offsetY,
        viewMode: state.viewMode,
        downloadResolution: state.downloadResolution,
        persistedAt: Date.now(),
        calendarScale: state.calendarScale,
        textOverlay: state.textOverlay,
        uploadedFonts: state.uploadedFonts,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState;
        const {
          persistedAt,
          calendarScale = currentState.calendarScale,
          textOverlay = currentState.textOverlay,
          uploadedFonts = currentState.uploadedFonts,
          ...rest
        } = persistedState as CalendarState;
        const timestamp = persistedAt ?? Date.now();
        if (!persistedAt || Date.now() - timestamp > ONE_HOUR_MS) {
          return { ...currentState, persistedAt: Date.now() };
        }
        return {
          ...currentState,
          ...rest,
          calendarScale,
          textOverlay,
          uploadedFonts,
          persistedAt: timestamp,
        };
      },
      version: 1,
    },
  ),
);

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

/**
 * Calculate maximum character limit for text overlay based on viewport.
 * Smaller calendar scale = more space for text = higher limit.
 * Uses piecewise function for optimal limits at different scales.
 *
 * Desktop viewport:
 *   - Scale 0.5: ~750 chars
 *   - Scale 0.75: ~450 chars
 *   - Scale 1.0: 150 chars
 *   - Scale 1.5: 100 chars
 *
 * Mobile viewport:
 *   - Scale 0.5: ~750 chars
 *   - Scale 0.75: ~430 chars
 *   - Scale 1.0: 105 chars
 *   - Scale 1.5: 50 chars
 *
 * @param viewMode - Current viewport mode (desktop or mobile)
 * @param calendarScale - Calendar scale factor (0.5 to 1.5)
 * @returns Maximum allowed characters for text overlay
 */
export function getMaxTextOverlayLength(
  viewMode: ViewMode,
  calendarScale: number,
): number {
  // Clamp scale to valid range
  const scale = Math.max(0.5, Math.min(1.5, calendarScale));

  if (viewMode === "desktop") {
    if (scale < 1.0) {
      // For scale < 1: High limits for small calendar
      // Scale 0.5 = 750, Scale 0.75 = 450, Scale 1.0 = 150
      return Math.floor(1950 - scale * 1800);
    } else {
      // For scale >= 1: Keep current limits
      // Scale 1.0 = 150, Scale 1.5 = 100
      return Math.floor(250 - scale * 100);
    }
  } else {
    // Mobile viewport
    if (scale < 1.0) {
      // For scale < 1: High limits for small calendar
      // Scale 0.5 = 750, Scale 0.75 = 427, Scale 1.0 = 105
      return Math.floor(2055 - scale * 1950);
    } else {
      // For scale >= 1: Adjusted limits (reduced for 1.5)
      // Scale 1.0 = 105, Scale 1.5 = 50
      return Math.floor(215 - scale * 110);
    }
  }
}
