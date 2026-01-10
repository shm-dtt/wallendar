import { WallpaperConfig, VALID_HEADER_FORMATS } from "@/lib/server-canvas";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const DEFAULT_CONFIG = {
  weekStart: "sunday",
  headerFormat: "full",
  textColor: "#ffffff",
  fontFamily: "Product Sans",
  offsetX: 0,
  offsetY: 0,
  viewMode: "desktop",
  calendarScale: 1,
  textOverlay: {
    enabled: false,
    content: "",
    fontSize: 1,
    font: "Product Sans",
    useTypographyFont: true,
    position: "center",
  },
};

const VALID_FONTS = [
  "Product Sans",
  "Montserrat",
  "Doto",
  "Crafty Girls",
  "Freckle Face",
  "Playwrite CA",
  "Segoe Script",
  "Instrument Serif",
  "Ultra",
];

const VALID_POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export function validateConfig(config: any): config is WallpaperConfig {
  if (typeof config !== "object" || config === null) return false;

  // Month: 0-11
  if (typeof config.month !== "number" || config.month < 0 || config.month > 11) return false;
  
  // Year: Reasonable range (e.g. 1000-9999)
  if (typeof config.year !== "number" || config.year < 1000 || config.year > 9999) return false;
  
  // WeekStart
  if (!["sunday", "monday"].includes(config.weekStart)) return false;
  
  // HeaderFormat
  if (typeof config.headerFormat !== "string" || !VALID_HEADER_FORMATS.includes(config.headerFormat)) return false;
  
  // TextColor
  if (typeof config.textColor !== "string" || !/^#[0-9a-fA-F]{6}$/.test(config.textColor)) return false;

  // FontFamily
  if (typeof config.fontFamily !== "string" || !VALID_FONTS.includes(config.fontFamily)) return false;

  // Offsets: -1 to 1
  if (typeof config.offsetX !== "number" || config.offsetX < -1 || config.offsetX > 1) return false;
  if (typeof config.offsetY !== "number" || config.offsetY < -1 || config.offsetY > 1) return false;

  // ViewMode
  if (!["desktop", "mobile"].includes(config.viewMode)) return false;

  // CalendarScale: 0.5 to 1.5
  if (typeof config.calendarScale !== "number" || config.calendarScale < 0.5 || config.calendarScale > 1.5) return false;

  // TextOverlay
  if (config.textOverlay !== undefined) {
    if (config.textOverlay === null || typeof config.textOverlay !== "object") return false;
    
    if (typeof config.textOverlay.enabled !== "boolean") return false;
    if (typeof config.textOverlay.content !== "string") return false;
    
    // FontSize must be positive
    if (typeof config.textOverlay.fontSize !== "number" || config.textOverlay.fontSize <= 0) return false;
    
    // Font whitelist (unless useTypographyFont is true, but we validate strictly anyway)
    if (typeof config.textOverlay.font !== "string" || !VALID_FONTS.includes(config.textOverlay.font)) return false;
    
    if (typeof config.textOverlay.useTypographyFont !== "boolean") return false;
    
    // Position enum
    if (typeof config.textOverlay.position !== "string" || !VALID_POSITIONS.includes(config.textOverlay.position)) return false;
  }

  return true;
}
