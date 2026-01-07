"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCalendarStore, type TextOverlayPosition } from "@/lib/calendar-store";
import { Sparkles, Type } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { FontPicker } from "./font-picker";
import { cn } from "@/lib/utils";

export function TextOverlaySettings() {
    const textOverlay = useCalendarStore((state) => state.textOverlay);
    const setTextOverlayEnabled = useCalendarStore((state) => state.setTextOverlayEnabled);
    const setTextOverlayContent = useCalendarStore((state) => state.setTextOverlayContent);
    const setTextOverlayFont = useCalendarStore((state) => state.setTextOverlayFont);
    const setTextOverlayUseTypographyFont = useCalendarStore((state) => state.setTextOverlayUseTypographyFont);
    const setTextOverlayPosition = useCalendarStore((state) => state.setTextOverlayPosition);
    const viewMode = useCalendarStore((state) => state.viewMode);

    const [selectedMood, setSelectedMood] = useState<string>("Motivational");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (textOverlay.enabled && settingsRef.current) {
            setTimeout(() => {
                settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 300);
        }
    }, [textOverlay.enabled]);

    const handleGenerate = async () => {
        console.log('[FRONTEND] Generate button clicked!');
        console.log('   Selected Mood:', selectedMood);

        if (abortController) {
            console.log('[FRONTEND] Canceling previous request...');
            abortController.abort();
        }

        const controller = new AbortController();
        setAbortController(controller);

        const timeoutId = setTimeout(() => {
            console.log('[FRONTEND] Request timeout - aborting...');
            controller.abort();
        }, 15000);

        console.log('   Calling API with mood prompt...');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/completion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: selectedMood }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            console.log('[FRONTEND] API Response received:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400) {
                    throw new Error(errorData.error || 'Invalid request. Please try again.');
                }
                throw new Error(errorData.error || 'Failed to generate text');
            }

            const generatedText = await response.text();
            console.log(' [FRONTEND] AI Generation Complete!');
            console.log('   Prompt:', selectedMood);
            console.log('   Generated Text:', generatedText);

            setTextOverlayContent(generatedText);
            setAbortController(null);
        } catch (err) {
            clearTimeout(timeoutId);

            if (err instanceof Error && err.name === 'AbortError') {
                const errorMessage = abortController === controller
                    ? 'Request timed out. Please try again.'
                    : 'Request canceled due to new generation.';
                console.error('❌ [FRONTEND] Request aborted:', errorMessage);
                setError(errorMessage);
            } else {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error('❌ [FRONTEND] AI Generation Error:', errorMessage);
                setError(errorMessage);
            }

            if (abortController === controller) {
                setAbortController(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getPositionStyles = (pos: TextOverlayPosition) => {
        const styles: React.CSSProperties = { position: 'absolute', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
        
        if (pos.startsWith('top')) styles.top = '10%';
        else if (pos.startsWith('bottom')) styles.top = '90%';
        else styles.top = '50%';

        if (pos.includes('left')) styles.left = '10%';
        else if (pos.includes('right')) styles.left = '90%';
        else styles.left = '50%';

        const x = pos.includes('left') ? '0%' : pos.includes('right') ? '-100%' : '-50%';
        const y = pos.startsWith('top') ? '0%' : pos.startsWith('bottom') ? '-100%' : '-50%';
        styles.transform = `translate(${x}, ${y})`;

        return styles;
    };

    return (
        <div className="py-1">
            <div className="items-center gap-2 mb-3 hidden lg:flex">
                <Type className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Text Overlay</h2>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="textOverlayToggle" className="text-sm cursor-pointer">
                        Enable Text Overlay
                    </Label>
                    <Switch
                        id="textOverlayToggle"
                        checked={textOverlay.enabled}
                        onCheckedChange={setTextOverlayEnabled}
                    />
                </div>

                <div 
                    className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        textOverlay.enabled ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <div ref={settingsRef} className="space-y-4 pt-1">
                            <div className="space-y-2">
                                <Label className="text-sm">AI Text Generation</Label>
                                <div className="flex gap-2">
                                    <Select value={selectedMood} onValueChange={setSelectedMood}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Mood" />
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
                                        className="shrink-0 w-auto gap-2"
                                        type="button"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        {isLoading ? "Generating..." : "Generate"}
                                    </Button>
                                </div>
                                
                                {error && (
                                    <p className="text-xs text-destructive mt-1">{error}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Custom Text</Label>
                                <Textarea
                                    placeholder="Enter your text..."
                                    value={textOverlay.content}
                                    onChange={(e) => setTextOverlayContent(e.target.value)}
                                    maxLength={200}
                                    rows={3}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {textOverlay.content.length}/200
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="matchTypographyFont" className="text-sm cursor-pointer">
                                    Match Typography Font
                                </Label>
                                <Switch
                                    id="matchTypographyFont"
                                    checked={textOverlay.useTypographyFont}
                                    onCheckedChange={setTextOverlayUseTypographyFont}
                                />
                            </div>

                            <FontPicker
                                label="Overlay Font"
                                value={textOverlay.font}
                                onChange={setTextOverlayFont}
                                disabled={textOverlay.useTypographyFont}
                                allowUpload={true}
                                showUploadedFonts={false}
                            />

                            <div className="space-y-3">
                                <Label className="text-sm">Position</Label>
                                <div className="flex justify-center bg-muted/30 rounded-lg p-4 border border-border/50">
                                    <div 
                                        className={cn(
                                            "relative bg-background border-2 border-border shadow-sm rounded-md overflow-hidden transition-all duration-300",
                                            viewMode === "mobile" ? "w-[200px] aspect-[9/16]" : "w-full aspect-[16/9]"
                                        )}
                                    >
                                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                                            <div className="border-r border-b border-muted/50" />
                                            <div className="border-r border-b border-muted/50" />
                                            <div className="border-b border-muted/50" />
                                            <div className="border-r border-b border-muted/50" />
                                            <div className="border-r border-b border-muted/50" />
                                            <div className="border-b border-muted/50" />
                                            <div className="border-r border-muted/50" />
                                            <div className="border-r border-muted/50" />
                                            <div />
                                        </div>

                                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 z-10">
                                            {[
                                                "top-left", "top-center", "top-right",
                                                "middle-left", "center", "middle-right",
                                                "bottom-left", "bottom-center", "bottom-right"
                                            ].map((pos) => (
                                                <button
                                                    key={pos}
                                                    className="w-full h-full focus:outline-none focus:bg-primary/5 hover:bg-primary/5 transition-colors"
                                                    onClick={() => setTextOverlayPosition(pos as TextOverlayPosition)}
                                                    aria-label={`Set position to ${pos}`}
                                                    type="button"
                                                />
                                            ))}
                                        </div>

                                        <div 
                                            className="bg-primary/90 rounded-sm shadow-sm flex items-center justify-center pointer-events-none z-20"
                                            style={{
                                                ...getPositionStyles(textOverlay.position),
                                                width: viewMode === 'mobile' ? '60%' : '40%',
                                                height: '20%',
                                            }}
                                        >
                                            <div className="w-3/4 h-1.5 bg-primary-foreground/50 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
