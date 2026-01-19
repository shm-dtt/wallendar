"use client";

import WallpaperCanvas, {
  type WallpaperCanvasHandle,
} from "@/components/preview/wallpaper-canvas";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DownloadResolution,
  HeaderFormat,
  resolutionOptions,
  useCalendarStore,
  ViewMode,
} from "@/lib/calendar-store";
import { fontFamilyMap } from "@/lib/calendar-utils";
import {
  ChevronDown,
  Download,
  Monitor,
  ScanEye,
  Smartphone,
  UploadCloud,
} from "lucide-react";
import { forwardRef, useEffect, useMemo, useState } from "react";


interface CalendarPreviewProps {
  onDownload: (resolution: DownloadResolution) => void;
  onPublish: () => void;
  isPublishing?: boolean;
  publishError?: string | null;
}

export const CalendarPreview = forwardRef<
  WallpaperCanvasHandle,
  CalendarPreviewProps
>(function CalendarPreview({ onDownload, onPublish, isPublishing = false, publishError }, ref) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const month = useCalendarStore((state) => state.month);
  const year = useCalendarStore((state) => state.year);
  const weekStart = useCalendarStore((state) => state.weekStart);
  const headerFormat = useCalendarStore((state) => state.headerFormat);

  const textColor = useCalendarStore((state) => state.textColor);
  const setTextColor = useCalendarStore((state) => state.setTextColor);
  const fontFamily = useCalendarStore((state) => state.fontFamily);
  const applyFontToAll = useCalendarStore((state) => state.applyFontToAll);
  const customFontName = useCalendarStore((state) => state.customFontName);

  const imageSrc = useCalendarStore((state) => state.imageSrc);

  const offsetX = useCalendarStore((state) => state.offsetX);
  const offsetY = useCalendarStore((state) => state.offsetY);
  const calendarScale = useCalendarStore((state) => state.calendarScale);

  const viewMode = useCalendarStore((state) => state.viewMode);
  const setViewMode = useCalendarStore((state) => state.setViewMode);

  const isDownloading = useCalendarStore((state) => state.isDownloading);
  const textOverlay = useCalendarStore((state) => state.textOverlay);
  const showStrikethrough = useCalendarStore((state) => state.showStrikethrough);
  const showHighlight = useCalendarStore((state) => state.showHighlight);
  
  // Custom Date props
  const useCustomDate = useCalendarStore((state) => state.useCustomDate);
  const customDay = useCalendarStore((state) => state.customDay);

  const effectiveFont = useMemo(() => {
    const baseFont =
      fontFamilyMap[fontFamily as keyof typeof fontFamilyMap] ||
      fontFamilyMap["Product Sans"];
    return customFontName ? `"${customFontName}", ${baseFont}` : baseFont;
  }, [customFontName, fontFamily]);

  const monthOnlyFont = useMemo(() => {
    const selected =
      fontFamilyMap[fontFamily as keyof typeof fontFamilyMap] ||
      fontFamilyMap["Product Sans"];
    const withCustom = customFontName
      ? `"${customFontName}", ${selected}`
      : selected;
    const productSansOnly = fontFamilyMap["Product Sans"];
    return { monthFont: withCustom, bodyFont: productSansOnly };
  }, [customFontName, fontFamily]);

  // Only show preview if month is selected and component has mounted on client
  const showPreview = month !== null && hasMounted;

  // Get aspect ratio class based on view mode
  const getAspectRatioClass = (mode: ViewMode) => {
    return mode === "mobile"
      ? "aspect-[9/16] h-[42vh] lg:h-[70vh]"
      : "aspect-video";
  };

  return (
    <div className="flex-3 space-y-4">
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onPublish()}
              size="sm"
              disabled={!showPreview || isPublishing}
              className="cursor-pointer"
            >
              {isPublishing ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}Publish
            </Button>
            <ButtonGroup>
              <Button
                onClick={() => onDownload("4k" as DownloadResolution)}
                size="sm"
                disabled={!showPreview}
                className="cursor-pointer"
              >
                {isDownloading ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Save
              </Button>
              <ButtonGroupSeparator />
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" disabled={!showPreview} className="cursor-pointer">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-36 p-2" align="end">
                  <div className="space-y-1 flex flex-col">
                    {resolutionOptions(viewMode).map((option) => (
                      <Button
                        key={option.value}
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(option.value)}
                        disabled={isDownloading}
                        className="justify-start cursor-pointer"
                      >
                        {option.label}{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({option.description}){" "}
                        </span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </ButtonGroup>
          </div>
        </div>

        {publishError && (
          <p className="text-sm text-destructive">{publishError}</p>
        )}

        <TabsContent value="desktop">
          <div
            className={`w-full ${getAspectRatioClass(
              "desktop"
            )} rounded-lg overflow-hidden bg-black border-2`}
          >
            {showPreview ? (
              <WallpaperCanvas
                ref={ref}
                month={month}
                year={year}
                weekStart={weekStart}
                headerFormat={headerFormat as HeaderFormat}
                textColor={textColor}
                setTextColor={setTextColor}
                fontFamily={
                  applyFontToAll
                    ? effectiveFont
                    : `${monthOnlyFont.monthFont} |||MONTH_ONLY||| ${monthOnlyFont.bodyFont}`
                }
                imageSrc={imageSrc}
                offsetX={offsetX}
                offsetY={offsetY}
                viewMode="desktop"
                calendarScale={calendarScale}
                textOverlay={textOverlay}
                showStrikethrough={showStrikethrough}
                showHighlight={showHighlight}
                useCustomDate={useCustomDate}
                customDay={customDay}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ScanEye className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a month to see preview</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="flex justify-center">
          <div
            className={`w-auto ${getAspectRatioClass(
              "mobile"
            )} rounded-lg overflow-hidden bg-black border-2`}
          >
            {showPreview ? (
              <WallpaperCanvas
                ref={ref}
                month={month}
                year={year}
                weekStart={weekStart}
                headerFormat={headerFormat as HeaderFormat}
                textColor={textColor}
                setTextColor={setTextColor}
                fontFamily={
                  applyFontToAll
                    ? effectiveFont
                    : `${monthOnlyFont.monthFont} |||MONTH_ONLY||| ${monthOnlyFont.bodyFont}`
                }
                imageSrc={imageSrc}
                offsetX={offsetX}
                offsetY={offsetY}
                viewMode="mobile"
                calendarScale={calendarScale}
                textOverlay={textOverlay}
                showStrikethrough={showStrikethrough}
                showHighlight={showHighlight}
                useCustomDate={useCustomDate}
                customDay={customDay}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ScanEye className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Select a month to see preview</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
