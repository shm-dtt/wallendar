"use client";

import type React from "react";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WallpaperCanvas, {
  type WallpaperCanvasHandle,
} from "@/components/wallpaper-canvas";
import { Calendar, Download, Upload, X, Palette, Type } from "lucide-react";

// Simple helpers
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const current = new Date();
const currentMonth = current.getMonth();
const currentYear = current.getFullYear();

export default function Page() {
  const canvasRef = useRef<WallpaperCanvasHandle>(null);
  const fontInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);
  const [weekStart, setWeekStart] = useState<"sunday" | "monday">("sunday");
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  // Font handling
  const [fontFamily, setFontFamily] = useState<string>("Montserrat");
  const [customFontName, setCustomFontName] = useState<string | null>(null);

  const fontFamilyMap = {
    Montserrat:
      'Montserrat, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
    Serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    Mono: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  };

  const effectiveFont = useMemo(() => {
    const baseFont =
      fontFamilyMap[fontFamily as keyof typeof fontFamilyMap] ||
      fontFamilyMap["Montserrat"];
    return customFontName ? `"${customFontName}", ${baseFont}` : baseFont;
  }, [customFontName, fontFamily]);

  function onImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setImageSrc(url);
    };
    reader.readAsDataURL(file);
  }

  async function onFontUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const name =
        file.name.replace(/\.(ttf|otf|woff2?)$/i, "") || "CustomFont";
      const face = new FontFace(name, buf);
      const loaded = await face.load();
      // Add the font to the document
      document.fonts.add(loaded);
      setCustomFontName(name);
    } catch (err) {
      console.error("[v0] Failed to load font:", err);
      alert(
        "Could not load that font. Please upload a valid TTF/OTF/WOFF file."
      );
    }
  }

  function removeCustomFont() {
    setCustomFontName(null);
    if (fontInputRef.current) {
      fontInputRef.current.value = "";
    }
  }

  function removeImage() {
    setImageSrc(undefined);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function onDownload() {
    // Choose common 16:9 options; you can change these in the UI if needed
    const [w, h] = [3840, 2160];
    canvasRef.current?.downloadPNG(w, h);
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Calendar Wallpaper
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Create beautiful 4K calendar wallpapers with custom backgrounds and
            typography
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8">
          {/* Controls Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Calendar Settings</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={String(month)}
                      onValueChange={(v) => setMonth(Number(v))}
                    >
                      <SelectTrigger id="month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((m, idx) => (
                          <SelectItem key={m} value={String(idx)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={year}
                      onChange={(e) =>
                        setYear(Number(e.target.value || currentYear))
                      }
                      min={1900}
                      max={9999}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Week starts on</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={weekStart === "sunday" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWeekStart("sunday")}
                      className="flex-1"
                    >
                      Sunday
                    </Button>
                    <Button
                      variant={weekStart === "monday" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWeekStart("monday")}
                      className="flex-1"
                    >
                      Monday
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Typography</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-16 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSelect">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger id="fontSelect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Montserrat">
                        Montserrat (Default)
                      </SelectItem>
                      <SelectItem value="Serif">Serif</SelectItem>
                      <SelectItem value="Mono">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {customFontName && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm font-medium">
                          Custom: {customFontName}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeCustomFont}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fontUpload">Upload Custom Font</Label>
                  <div className="relative">
                    <Input
                      id="fontUpload"
                      ref={fontInputRef}
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={onFontUpload}
                      className="file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports TTF, OTF, WOFF files
                  </p>
                </div>
              </div>
            </div>

            {/* Background */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Background</h2>
              </div>

              <div className="space-y-4">
                {imageSrc && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm font-medium">
                          Background image active
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeImage}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="imageUpload">Upload Image</Label>
                  <Input
                    id="imageUpload"
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <p className="text-xs text-muted-foreground">
                    Images are automatically scaled to fit 16:9 aspect ratio
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setImageSrc(
                        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4.png-fx0OrzfPkX4aFpUK254aXjNVGP0Vzn.jpeg"
                      )
                    }
                    className="flex-1"
                  >
                    Try Sample
                  </Button>
                </div>
              </div>
            </div>

            {/* Export */}
            <Button onClick={onDownload} size="lg" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download 4K Wallpaper
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Exports at 3840×2160 resolution
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Live Preview</h2>
                <div className="text-sm text-muted-foreground">
                  {monthNames[month]} {year}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 shadow-inner">
                <div className="w-full aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 bg-black shadow-2xl">
                  <WallpaperCanvas
                    ref={canvasRef}
                    month={month}
                    year={year}
                    weekStart={weekStart}
                    textColor={textColor}
                    fontFamily={effectiveFont}
                    imageSrc={imageSrc}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
