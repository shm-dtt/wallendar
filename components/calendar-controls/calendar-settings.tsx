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

export function CalendarSettings() {
  const month = useCalendarStore((state) => state.month);
  const setMonth = useCalendarStore((state) => state.setMonth);
  const year = useCalendarStore((state) => state.year);
  const setYear = useCalendarStore((state) => state.setYear);
  const weekStart = useCalendarStore((state) => state.weekStart);
  const setWeekStart = useCalendarStore((state) => state.setWeekStart);
  const headerFormat = useCalendarStore((state) => state.headerFormat);
  const setHeaderFormat = useCalendarStore((state) => state.setHeaderFormat);

  return (
    <div className="py-1">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Calendar Settings</h2>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="space-y-1">
          <Label htmlFor="month" className="text-sm">
            Month
          </Label>
          <Select
            value={month !== null ? String(month) : ""}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger id="month" className="w-[150px]">
              <SelectValue placeholder="Select a month" />
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

        <div className="space-y-1">
          <Label htmlFor="year" className="text-sm">
            Year
          </Label>
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
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Start week on</Label>
          <div className="flex gap-2">
            <ButtonGroup>
            <Button
              variant={weekStart === "sunday" ? "default" : "outline"}
              onClick={() => setWeekStart("sunday")}
            >
              Sun
            </Button>
            <Button
              variant={weekStart === "monday" ? "default" : "outline"}
              onClick={() => setWeekStart("monday")}
            >
              Mon
            </Button>
            </ButtonGroup>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="headerFormat" className="text-sm">
            Month formatting
          </Label>
          <Select
            value={headerFormat || ""}
            onValueChange={(v) => setHeaderFormat(v as HeaderFormat)}
          >
            <SelectTrigger id="headerFormat" className="w-[280px]">
              <SelectValue placeholder="Default: Month (full)" />
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