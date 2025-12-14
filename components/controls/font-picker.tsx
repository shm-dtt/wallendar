"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCalendarStore } from "@/lib/calendar-store";
import { localFonts } from "@/lib/calendar-utils";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FontPickerProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    label?: string;
    placeholder?: string;
    allowUpload?: boolean;
}

export function FontPicker({
    value,
    onChange,
    disabled = false,
    label,
    placeholder = "Product Sans",
    allowUpload = false
}: FontPickerProps) {
    const [installedFonts, setInstalledFonts] = useState<{ name: string, displayName: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fontInputRef = useRef<HTMLInputElement | null>(null);

    // Global uploaded fonts from store
    const uploadedFonts = useCalendarStore((state) => state.uploadedFonts);
    const addUploadedFont = useCalendarStore((state) => state.addUploadedFont);
    const removeUploadedFont = useCalendarStore((state) => state.removeUploadedFont);

    // Load preinstalled fonts on mount
    useEffect(() => {
        const fonts = localFonts;
        let canceled = false;

        async function registerAll() {
            for (const f of fonts) {
                try {
                    let weight = "400";
                    if (f.name === "Montserrat") weight = "500";
                    else if (f.name === "Doto") weight = "700";

                    const face = new FontFace(f.name, `url(${f.path})`, { weight });
                    const loaded = await face.load();
                    if (!canceled) {
                        document.fonts.add(loaded);
                    }
                } catch {
                    // ignore failures
                }
            }
            if (!canceled) {
                setInstalledFonts(fonts.map(({ name, displayName }) => ({ name, displayName })));
            }
        }
        registerAll();
        return () => {
            canceled = true;
        };
    }, []);

    // Re-register uploaded fonts from localStorage on mount
    useEffect(() => {
        uploadedFonts.forEach((font) => {
            const fontFaces = Array.from(document.fonts.values());
            const isLoaded = fontFaces.some(face => face.family === font.name);
            if (!isLoaded) {
                // Font binary data is not persisted, will need re-upload
                // We keep the font in the list but it won't render until re-uploaded
            }
        });
    }, [uploadedFonts]);

    const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const fileName = file.name.replace(/\.(ttf|otf|woff2?)$/i, "") || "CustomFont";

            // Check if font already exists
            const existingFont = uploadedFonts.find(font => font.displayName === fileName);
            if (existingFont) {
                onChange(existingFont.name);
                if (fontInputRef.current) {
                    fontInputRef.current.value = "";
                }
                setIsUploading(false);
                return;
            }

            // Create unique name
            const timestamp = Date.now();
            const uniqueName = `${fileName}_${timestamp}`;

            const fontFace = new FontFace(uniqueName, arrayBuffer);
            const loadedFont = await fontFace.load();

            document.fonts.add(loadedFont);

            const newFont = { name: uniqueName, displayName: fileName };
            addUploadedFont(newFont);
            onChange(uniqueName);

            // Clear input
            if (fontInputRef.current) {
                fontInputRef.current.value = "";
            }

        } catch (err) {
            console.error("Failed to load font:", err);
            alert("Could not load that font. Please upload a valid TTF/OTF/WOFF file.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFont = (fontName: string) => {
        // Remove from document.fonts
        const fontFaces = Array.from(document.fonts.values());
        fontFaces.forEach(face => {
            if (face.family === fontName) {
                document.fonts.delete(face);
            }
        });

        // Remove from store
        removeUploadedFont(fontName);

        // Reset selection if this font was selected
        if (value === fontName) {
            onChange("Product Sans");
        }
    };

    return (
        <div className="space-y-2">
            {label && <Label className="text-sm">{label}</Label>}

            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}
            >
                <SelectTrigger className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Default Fonts</SelectLabel>
                        {installedFonts.map((font) => (
                            <SelectItem key={font.name} value={font.name}>
                                {font.displayName}
                            </SelectItem>
                        ))}
                    </SelectGroup>

                    {uploadedFonts.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Custom Fonts</SelectLabel>
                            {uploadedFonts.map((font) => (
                                <SelectItem key={font.name} value={font.name}>
                                    {font.displayName}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                </SelectContent>
            </Select>

            {allowUpload && (
                <>
                    <div className="relative">
                        <Input
                            ref={fontInputRef}
                            type="file"
                            accept=".ttf,.otf,.woff,.woff2"
                            onChange={handleFontUpload}
                            className="sr-only"
                            id="font-upload"
                            disabled={isUploading || disabled}
                        />
                        <Button
                            asChild
                            variant="outline"
                            disabled={isUploading || disabled}
                            className="px-3 w-full cursor-pointer"
                        >
                            <label htmlFor="font-upload" className="cursor-pointer">
                                {isUploading ? (
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <p>Upload Custom Font</p>
                                )}
                            </label>
                        </Button>
                    </div>

                    {uploadedFonts.length > 0 && (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Custom Fonts</Label>
                            <div className="flex flex-wrap gap-1">
                                {uploadedFonts.map((font) => (
                                    <div key={font.name} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                        <span>{font.displayName}</span>
                                        <button
                                            onClick={() => handleRemoveFont(font.name)}
                                            className="hover:bg-primary/20 rounded-full p-0.5"
                                            disabled={disabled}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
