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

export function validateConfig(config: any): config is WallpaperConfig {
  if (typeof config !== "object" || config === null) return false;

  if (typeof config.month !== "number" || config.month < 0 || config.month > 11) return false;
  if (typeof config.year !== "number" || config.year < 1000 || config.year > 9999) return false;
  if (!["sunday", "monday"].includes(config.weekStart)) return false;
  
  // Strict HeaderFormat check
  if (typeof config.headerFormat !== "string" || !VALID_HEADER_FORMATS.includes(config.headerFormat)) return false;
  
  if (typeof config.textColor !== "string") return false;
  // Validate hex color format
  if (!/^#[0-9a-fA-F]{6}$/.test(config.textColor)) return false;

  if (typeof config.fontFamily !== "string") return false;
  if (typeof config.offsetX !== "number") return false;
  if (typeof config.offsetY !== "number") return false;
  if (!["desktop", "mobile"].includes(config.viewMode)) return false;
  if (typeof config.calendarScale !== "number" || config.calendarScale <= 0) return false;

  if (config.textOverlay) {
    if (typeof config.textOverlay !== "object") return false;
    if (typeof config.textOverlay.enabled !== "boolean") return false;
    if (typeof config.textOverlay.content !== "string") return false;
    if (typeof config.textOverlay.fontSize !== "number") return false;
    if (typeof config.textOverlay.font !== "string") return false;
    if (typeof config.textOverlay.useTypographyFont !== "boolean") return false;
    if (typeof config.textOverlay.position !== "string") return false;
  }

  return true;
}
