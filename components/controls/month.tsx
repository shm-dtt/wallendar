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
import { Calendar } from "lucide-react";
import { HeaderFormat, useCalendarStore } from "@/lib/calendar-store";
import { monthNames, headerFormatOptions } from "@/lib/calendar-utils";
import { ButtonGroup } from "@/components/ui/button-group";
import { DateEffectsSettings } from "./date-effects";

export function MonthSettings() {
  const month = useCalendarStore((state) => state.month);
  const setMonth = useCalendarStore((state) => state.setMonth);
  const year = useCalendarStore((state) => state.year);
  const setYear = useCalendarStore((state) => state.setYear);
  const weekStart = useCalendarStore((state) => state.weekStart);
  const setWeekStart = useCalendarStore((state) => state.setWeekStart);
  const headerFormat = useCalendarStore((state) => state.headerFormat);
  const setHeaderFormat = useCalendarStore((state) => state.setHeaderFormat);

  // New State
  const useCustomDate = useCalendarStore((state) => state.useCustomDate);
  const setUseCustomDate = useCalendarStore((state) => state.setUseCustomDate);
  const customDay = useCalendarStore((state) => state.customDay);
  const setCustomDay = useCalendarStore((state) => state.setCustomDay);
  const setShowHighlight = useCalendarStore((state) => state.setShowHighlight);

  // Helper for max days
  const maxDays = new Date(year, (month || 0) + 1, 0).getDate();

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If empty, disable custom date
    if (val === "") {
      setUseCustomDate(false);
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= maxDays) {
      if (!useCustomDate) {
        // Auto-enable highlight if not already set
        setShowHighlight(true);
      }
      setUseCustomDate(true);
      setCustomDay(num);
    }
  };

  return (
    <div className="py-1">
      <div className="items-center gap-2 mb-3 hidden lg:flex">
        <Calendar className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Calendar</h2>
      </div>

      <div className="flex gap-3 flex-wrap">
        {/* Column 1: Date, Month & Year */}
        <div className="space-y-1">
          <Label htmlFor="day" className="text-sm">
            Date, Month & Year
          </Label>
          <ButtonGroup>
            <Input
              id="day"
              type="number"
              placeholder="DD"
              min={1}
              max={maxDays}
              value={useCustomDate ? customDay : ""}
              onChange={handleDayChange}
              className="w-[52px] text-center"
            />
            <Select
              value={month !== null ? String(month) : ""}
              onValueChange={(v) => setMonth(Number(v))}
            >
              <SelectTrigger id="month">
                <SelectValue placeholder="MMM" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((m, idx) => (
                  <SelectItem key={m} value={String(idx)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) =>
                setYear(Number(e.target.value || new Date().getFullYear()))
              }
              min={1900}
              max={9999}
              className="text-sm w-[112px]"
            />
          </ButtonGroup>
        </div>

        {/* Column 2: Date Effects (Conditional) */}
        {useCustomDate && (
          <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-300">
            <Label className="text-sm">Date Effects</Label>
            <DateEffectsSettings />
          </div>
        )}

        {/* Column 3: Start Week */}
        <div className="space-y-1">
          <Label className="text-sm">Start week on</Label>
          <ButtonGroup>
            <Button
              variant={weekStart === "sunday" ? "default" : "outline"}
              onClick={() => setWeekStart("sunday")}
              className="cursor-pointer"
            >
              Sun
            </Button>
            <Button
              variant={weekStart === "monday" ? "default" : "outline"}
              onClick={() => setWeekStart("monday")}
              className="cursor-pointer"
            >
              Mon
            </Button>
          </ButtonGroup>
        </div>

        {/* Column 4: Format */}
        <div className="space-y-1">
          <Label htmlFor="headerFormat" className="text-sm">
            Format
          </Label>
          <Select
            value={headerFormat || ""}
            onValueChange={(v) => setHeaderFormat(v as HeaderFormat)}
          >
            <SelectTrigger id="headerFormat" className="w-[105px]">
              <SelectValue placeholder="Full" />
            </SelectTrigger>
            <SelectContent>
              {headerFormatOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
