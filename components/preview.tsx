"use client";

import { forwardRef } from "react";
import { useMemo } from "react";
import WallpaperCanvas, {
  type WallpaperCanvasHandle,
} from "@/components/wallpaper-canvas";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Download,
  ScanEye,
  Monitor,
  Smartphone,
  ChevronDown,
  Maximize2,
} from "lucide-react";
import {
  HeaderFormat,
  useCalendarStore,
  ViewMode,
  DownloadResolution,
  resolutionOptions,
} from "@/lib/calendar-store";
import { fontFamilyMap } from "@/lib/calendar-utils";
import { Spinner } from "@/components/ui/spinner";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CalendarPreviewProps {
  onDownload: (resolution: DownloadResolution) => void;
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

  const viewMode = useCalendarStore((state) => state.viewMode);
  const setViewMode = useCalendarStore((state) => state.setViewMode);

  const isDownloading = useCalendarStore((state) => state.isDownloading);

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

  // Only show preview if month is selected
  const showPreview = month !== null;

  // Get aspect ratio class based on view mode
  const getAspectRatioClass = (mode: ViewMode) => {
    return mode === "mobile"
      ? "aspect-[9/16]"
      : "aspect-video";
  };

  return (
    <div className="flex-3 space-y-4">
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TabsList>
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="icon" disabled={!showPreview}>
                  <Maximize2 />
                </Button>
              </DialogTrigger>
              <DialogContent className={`!max-w-[100vw] !w-[95vw] !h-[90vh] m-0 p-6 overflow-hidden`}>
                <DialogHeader>
                  <DialogTitle>Fullscreen Preview</DialogTitle>
                </DialogHeader>
                <div
                  className={`w-full ${getAspectRatioClass(
                    viewMode as ViewMode
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
                      fontFamily={
                        applyFontToAll
                          ? effectiveFont
                          : `${monthOnlyFont.monthFont} |||MONTH_ONLY||| ${monthOnlyFont.bodyFont}`
                      }
                      imageSrc={imageSrc}
                      offsetX={offsetX}
                      offsetY={offsetY}
                      viewMode={viewMode as ViewMode}
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
              </DialogContent>
            </Dialog>
          </div>
          <ButtonGroup>
            <Button
              onClick={() => onDownload("4k" as DownloadResolution)}
              size="sm"
              disabled={!showPreview}
            >
              {isDownloading ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download 4K
            </Button>
            <ButtonGroupSeparator />
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" disabled={!showPreview}>
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
                      className="justify-start"
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
                fontFamily={
                  applyFontToAll
                    ? effectiveFont
                    : `${monthOnlyFont.monthFont} |||MONTH_ONLY||| ${monthOnlyFont.bodyFont}`
                }
                imageSrc={imageSrc}
                offsetX={offsetX}
                offsetY={offsetY}
                viewMode="desktop"
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
            )}  h-[42vh] lg:h-[70vh] rounded-lg overflow-hidden bg-black border-2`}
          >
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
                viewMode="mobile"
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
