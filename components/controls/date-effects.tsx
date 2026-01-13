"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendarStore } from "@/lib/calendar-store";

export function DateEffectsSettings() {
  const month = useCalendarStore((s) => s.month);
  const year = useCalendarStore((s) => s.year);
  const showStrikethrough = useCalendarStore((s) => s.showStrikethrough);
  const setShowStrikethrough = useCalendarStore((s) => s.setShowStrikethrough);
  const showHighlight = useCalendarStore((s) => s.showHighlight);
  const setShowHighlight = useCalendarStore((s) => s.setShowHighlight);

  // Check if viewing current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const isCurrentMonth = month === currentMonth && year === currentYear;

  // Determine current value based on state
  let currentValue = "none";
  if (showHighlight && showStrikethrough) currentValue = "both";
  else if (showHighlight) currentValue = "highlight";
  else if (showStrikethrough) currentValue = "strikethrough";

  const handleValueChange = (val: string) => {
    switch (val) {
      case "none":
        setShowHighlight(false);
        setShowStrikethrough(false);
        break;
      case "highlight":
        setShowHighlight(true);
        setShowStrikethrough(false);
        break;
      case "strikethrough":
        setShowHighlight(false);
        setShowStrikethrough(true);
        break;
      case "both":
        setShowHighlight(true);
        setShowStrikethrough(true);
        break;
    }
  };

  return (
    <div className="space-y-1">
      <Label htmlFor="date-effects" className="text-sm">
        Date Effects
      </Label>
      <Select
        value={currentValue}
        onValueChange={handleValueChange}
        disabled={!isCurrentMonth}
      >
        <SelectTrigger id="date-effects" className="w-[140px]">
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="highlight">Highlight</SelectItem>
          <SelectItem value="strikethrough">Strikethrough</SelectItem>
          <SelectItem value="both">Both</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
