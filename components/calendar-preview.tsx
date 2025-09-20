"use client";

import { forwardRef } from "react";
import { useMemo } from "react";
import WallpaperCanvas, {
  type WallpaperCanvasHandle,
} from "@/components/wallpaper-canvas";
import { Button } from "@/components/ui/button";
import { Download, ScanEye } from "lucide-react";
import { HeaderFormat, useCalendarStore } from "@/lib/calendar-store";
import { monthNames } from "@/lib/calendar-utils";

interface CalendarPreviewProps {
  onDownload: () => void;
}

export const CalendarPreview = forwardRef<
  WallpaperCanvasHandle,
  CalendarPreviewProps
>(function CalendarPreview({ onDownload }, ref) {
  const month = useCalendarStore((state) => state.month);
  const year = useCalendarStore((state) => state.year);
  const weekStart = useCalendarStore((state) => state.weekStart);
  const headerFormat = useCalendarStore((state) => state.headerFormat);
  const textColor = useCalendarStore((state) => state.textColor);
  const fontFamily = useCalendarStore((state) => state.fontFamily);
  const applyFontToAll = useCalendarStore((state) => state.applyFontToAll);
  const customFontName = useCalendarStore((state) => state.customFontName);
  const imageSrc = useCalendarStore((state) => state.imageSrc);
  const offsetX = useCalendarStore((state) => state.offsetX);
  const offsetY = useCalendarStore((state) => state.offsetY);

  const fontFamilyMap = {
    Montserrat:
      'Montserrat, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    Serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    Mono: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    "Playwrite CA":
      '"Playwrite CA", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    Doto:
      'Doto, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    "Crafty Girls":
      '"Crafty Girls", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    "Freckle Face":
      '"Freckle Face", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    "Product Sans":
      '"Product Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    "Segoe Script":
      '"Segoe Script", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  };

  const effectiveFont = useMemo(() => {
    const baseFont =
      fontFamilyMap[fontFamily as keyof typeof fontFamilyMap] ||
      fontFamilyMap.Montserrat;
    return customFontName ? `"${customFontName}", ${baseFont}` : baseFont;
  }, [customFontName, fontFamily]);

  const monthOnlyFont = useMemo(() => {
    const selected =
      fontFamilyMap[fontFamily as keyof typeof fontFamilyMap] ||
      fontFamilyMap.Montserrat;
    const withCustom = customFontName
      ? `"${customFontName}", ${selected}`
      : selected;
    const montserratOnly = fontFamilyMap.Montserrat;
    return { monthFont: withCustom, bodyFont: montserratOnly };
  }, [customFontName, fontFamily]);

  // Only show preview if month is selected
  const showPreview = month !== null;

  return (
    <div className="flex-3 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScanEye className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Preview</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {showPreview ? `${monthNames[month]} ${year}` : "Select a month"}
        </div>
      </div>

      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
        {showPreview ? (
          <WallpaperCanvas
            ref={ref}
            month={month}
            year={year}
            weekStart={weekStart}
            headerFormat={headerFormat as HeaderFormat}
            textColor={textColor}
            fontFamily={
              applyFontToAll
                ? effectiveFont
                : `${monthOnlyFont.monthFont} |||MONTH_ONLY||| ${monthOnlyFont.bodyFont}`
            }
            imageSrc={imageSrc}
            offsetX={offsetX}
            offsetY={offsetY}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <ScanEye className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a month to see preview</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-col items-center space-y-2">
        <Button 
          onClick={onDownload} 
          size="lg" 
          className="w-full"
          disabled={!showPreview}
        >
          <Download className="w-4 h-4 mr-2" />
          Download 4K Wallpaper
        </Button>
      </div>
    </div>
  );
});