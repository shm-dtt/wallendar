import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

  // Helper for max days
  const maxDays = new Date(year, (month || 0) + 1, 0).getDate();

  return (
    <div className="py-1 space-y-4">
      <div className="items-center gap-2 mb-3 hidden lg:flex">
        <Calendar className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Calendar</h2>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="space-y-1">
          <Label htmlFor="month-year" className="text-sm">
            Month & Year
          </Label>
          <ButtonGroup>
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
              className="text-sm"
            />
          </ButtonGroup>
        </div>

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

        <div className="space-y-1">
          <Label htmlFor="headerFormat" className="text-sm">
            Format
          </Label>
          <Select
            value={headerFormat || ""}
            onValueChange={(v) => setHeaderFormat(v as HeaderFormat)}
          >
            <SelectTrigger id="headerFormat" className="w-[130px]">
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

      <div className="flex items-center space-x-2">
        <Switch
          id="custom-date-mode"
          checked={useCustomDate}
          onCheckedChange={setUseCustomDate}
        />
        <Label htmlFor="custom-date-mode" className="text-sm font-medium">
          Date Settings
        </Label>
      </div>

      {useCustomDate && (
        <div className="flex gap-4 flex-wrap items-end animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-1">
            <Label htmlFor="custom-day" className="text-sm">
              Day
            </Label>
            <Input
              id="custom-day"
              type="number"
              min={1}
              max={maxDays}
              value={customDay}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 1;
                if (val < 1) val = 1;
                if (val > maxDays) val = maxDays;
                setCustomDay(val);
              }}
              className="w-20"
            />
          </div>

          <DateEffectsSettings />
        </div>
      )}
    </div>
  );
}
