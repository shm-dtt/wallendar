"use client";

import { Label } from "@/components/ui/label";
import { useCalendarStore, type TextOverlayPosition } from "@/lib/calendar-store";
import { Grid3x3, Type } from "lucide-react";
import { FontPicker } from "./font-picker";

export function TextOverlaySettings() {
    const textOverlay = useCalendarStore((state) => state.textOverlay);
    const setTextOverlayEnabled = useCalendarStore(
        (state) => state.setTextOverlayEnabled
    );
    const setTextOverlayContent = useCalendarStore(
        (state) => state.setTextOverlayContent
    );
    const setTextOverlayFont = useCalendarStore(
        (state) => state.setTextOverlayFont
    );
    const setTextOverlayUseTypographyFont = useCalendarStore(
        (state) => state.setTextOverlayUseTypographyFont
    );
    const setTextOverlayPosition = useCalendarStore(
        (state) => state.setTextOverlayPosition
    );

    return (
        <div className="py-1">
            <div className="items-center gap-2 mb-3 hidden lg:flex">
                <Type className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Text Overlay</h2>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="textOverlayToggle" className="flex items-center gap-2 text-sm">
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
                            <Label className="text-sm">Custom Text</Label>
                            <textarea
                                placeholder="Enter your text... (Press Enter for new lines)"
                                value={textOverlay.content}
                                onChange={(e) => setTextOverlayContent(e.target.value)}
                                maxLength={200}
                                rows={3}
                                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                {textOverlay.content.length}/200 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="matchTypographyFont" className="flex items-center gap-2 text-sm">
                                <input
                                    id="matchTypographyFont"
                                    type="checkbox"
                                    checked={textOverlay.useTypographyFont}
                                    onChange={(e) => setTextOverlayUseTypographyFont(e.target.checked)}
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
                                ].flat().map((pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => setTextOverlayPosition(pos as TextOverlayPosition)}
                                        className={`
                                            w-8 h-8 rounded border-2 transition-all relative
                                            ${textOverlay.position === pos
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
                                                ${pos.includes("left")
                                                    ? "left-1"
                                                    : pos.includes("right")
                                                        ? "right-1"
                                                        : "left-1/2 -translate-x-1/2"
                                                }
                                                ${pos.startsWith("top-")
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
