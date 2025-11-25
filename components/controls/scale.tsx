"use client";

import { Scaling } from "lucide-react";
import { useCalendarStore } from "@/lib/calendar-store";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const PRESETS = [
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
  { label: "125%", value: 1.25 },
  { label: "150%", value: 1.5 },
];

export function ScaleSettings() {
  const calendarScale = useCalendarStore((s) => s.calendarScale);
  const setCalendarScale = useCalendarStore((s) => s.setCalendarScale);

  return (
    <div className="py-1 space-y-4">
      <div className="items-center gap-2 hidden lg:flex">
        <Scaling className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Scale</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Label className="text-xs text-muted-foreground">
            Calendar Size
          </Label>
          <span className="font-medium text-foreground">
            {(calendarScale * 100).toFixed(0)}%
          </span>
        </div>

        <Slider
          min={0.5}
          max={1.5}
          step={0.01}
          value={[calendarScale]}
          onValueChange={(values) => {
            const next = values[0];
            if (typeof next === "number") setCalendarScale(next);
          }}
          aria-label="Calendar size"
        />

        <div className="flex gap-1">
          {PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={Math.abs(calendarScale - preset.value) < 0.01 ? "default" : "outline"}
              size="icon-sm"
              className="flex-1"
              onClick={() => setCalendarScale(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <Button variant="outline" onClick={() => setCalendarScale(1)}>
          Reset Size
        </Button>
      </div>
    </div>
  );
}

