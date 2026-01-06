"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCalendarStore,
  type TextOverlayPosition,
  getMaxTextOverlayLength,
} from "@/lib/calendar-store";
// Removed useCompletion import - using manual fetch instead
import { Grid3x3, Sparkles, Type } from "lucide-react";
import { useState, useEffect } from "react";
import { FontPicker } from "./font-picker";

export function TextOverlaySettings() {
  const textOverlay = useCalendarStore((state) => state.textOverlay);
  const viewMode = useCalendarStore((state) => state.viewMode);
  const calendarScale = useCalendarStore((state) => state.calendarScale);
  const setTextOverlayEnabled = useCalendarStore(
    (state) => state.setTextOverlayEnabled,
  );
  const setTextOverlayContent = useCalendarStore(
    (state) => state.setTextOverlayContent,
  );
  const setTextOverlayFont = useCalendarStore(
    (state) => state.setTextOverlayFont,
  );
  const setTextOverlayUseTypographyFont = useCalendarStore(
    (state) => state.setTextOverlayUseTypographyFont,
  );
  const setTextOverlayPosition = useCalendarStore(
    (state) => state.setTextOverlayPosition,
  );

  // Calculate dynamic character limit based on viewport and scale
  const maxLength = getMaxTextOverlayLength(viewMode, calendarScale);

  // Auto-trim text content when limit decreases
  useEffect(() => {
    if (textOverlay.content.length > maxLength) {
      setTextOverlayContent(textOverlay.content.slice(0, maxLength));
    }
  }, [maxLength, textOverlay.content, setTextOverlayContent]);

  const [selectedMood, setSelectedMood] = useState<string>("Motivational");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track current request to handle cancellation
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Handler for generate button click
  const handleGenerate = async () => {
    console.log("[FRONTEND] Generate button clicked!");
    console.log("   Selected Mood:", selectedMood);

    // Cancel any previous ongoing request
    if (abortController) {
      console.log("[FRONTEND] Canceling previous request...");
      abortController.abort();
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);

    // Set timeout to abort request after 15 seconds
    const timeoutId = setTimeout(() => {
      console.log("[FRONTEND] Request timeout - aborting...");
      controller.abort();
    }, 15000);

    console.log("   Calling API with mood prompt...");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: selectedMood }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(
        "[FRONTEND] API Response received:",
        response.status,
        response.statusText,
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Provide specific error messages based on status code
        if (response.status === 400) {
          throw new Error(
            errorData.error || "Invalid request. Please try again.",
          );
        }

        throw new Error(errorData.error || "Failed to generate text");
      }

      const generatedText = await response.text();
      console.log(" [FRONTEND] AI Generation Complete!");
      console.log("   Prompt:", selectedMood);
      console.log("   Generated Text:", generatedText);

      setTextOverlayContent(generatedText);
      setAbortController(null);
    } catch (err) {
      clearTimeout(timeoutId);

      // Check if error was due to abort
      if (err instanceof Error && err.name === "AbortError") {
        const errorMessage =
          abortController === controller
            ? "Request timed out. Please try again."
            : "Request canceled due to new generation.";
        console.error("❌ [FRONTEND] Request aborted:", errorMessage);
        setError(errorMessage);
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("❌ [FRONTEND] AI Generation Error:", errorMessage);
        setError(errorMessage);
      }

      if (abortController === controller) {
        setAbortController(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-1">
      <div className="items-center gap-2 mb-3 hidden lg:flex">
        <Type className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Text Overlay</h2>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label
            htmlFor="textOverlayToggle"
            className="flex items-center gap-2 text-sm"
          >
            <input
              id="textOverlayToggle"
              type="checkbox"
              checked={textOverlay.enabled}
              onChange={(e) => setTextOverlayEnabled(e.target.checked)}
              className="h-3 w-3 accent-primary"
            />
            <span>Enable Text Overlay</span>
          </Label>
        </div>

        {textOverlay.enabled && (
          <>
            <div className="space-y-2">
              <Label className="text-sm">AI Mood</Label>
              <div className="flex gap-2">
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Motivational">Motivational</SelectItem>
                    <SelectItem value="Stoic">Stoic</SelectItem>
                    <SelectItem value="Funny">Funny</SelectItem>
                    <SelectItem value="Chill">Chill</SelectItem>
                    <SelectItem value="Hustle">Hustle</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  size="sm"
                  className="gap-1.5"
                  type="button"
                >
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>

              {/* Error message display */}
              {error && (
                <div className="flex items-start gap-2 p-2.5 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium">Error</p>
                    <p className="mt-0.5 opacity-90">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Dismiss error"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Custom Text</Label>
              <textarea
                placeholder="Enter your text... (Press Enter for new lines)"
                value={textOverlay.content}
                onChange={(e) => setTextOverlayContent(e.target.value)}
                maxLength={maxLength}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {textOverlay.content.length}/{maxLength} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="matchTypographyFont"
                className="flex items-center gap-2 text-sm"
              >
                <input
                  id="matchTypographyFont"
                  type="checkbox"
                  checked={textOverlay.useTypographyFont}
                  onChange={(e) =>
                    setTextOverlayUseTypographyFont(e.target.checked)
                  }
                  className="h-3 w-3 accent-primary"
                />
                <span>Match Typography Font</span>
              </Label>
            </div>

            <FontPicker
              label="Overlay Font"
              value={textOverlay.font}
              onChange={setTextOverlayFont}
              disabled={textOverlay.useTypographyFont}
              allowUpload={true}
              showUploadedFonts={false}
            />
            {textOverlay.useTypographyFont && (
              <p className="text-xs text-muted-foreground -mt-1">
                Using main typography font
              </p>
            )}

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Grid3x3 className="w-3 h-3" />
                Text Position
              </Label>
              <div className="grid grid-cols-3 gap-1 w-fit">
                {[
                  ["top-left", "top-center", "top-right"],
                  ["middle-left", "center", "middle-right"],
                  ["bottom-left", "bottom-center", "bottom-right"],
                ]
                  .flat()
                  .map((pos) => (
                    <button
                      key={pos}
                      onClick={() =>
                        setTextOverlayPosition(pos as TextOverlayPosition)
                      }
                      className={`
                                            w-8 h-8 rounded border-2 transition-all relative
                                            ${
                                              textOverlay.position === pos
                                                ? "border-primary bg-primary/20"
                                                : "border-input hover:border-primary/50 hover:bg-accent"
                                            }
                                        `}
                      title={pos}
                      aria-label={`Position: ${pos}`}
                      type="button"
                    >
                      <div
                        className={`
                                                w-1.5 h-1.5 rounded-full bg-current absolute
                                                ${
                                                  pos.includes("left")
                                                    ? "left-1"
                                                    : pos.includes("right")
                                                      ? "right-1"
                                                      : "left-1/2 -translate-x-1/2"
                                                }
                                                ${
                                                  pos.startsWith("top-")
                                                    ? "top-1"
                                                    : pos.startsWith("bottom-")
                                                      ? "bottom-1"
                                                      : "top-1/2 -translate-y-1/2"
                                                }
                                            `}
                      />
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
