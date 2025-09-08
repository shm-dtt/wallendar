"use client";

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
import { useCalendarStore } from "@/lib/calendar-store";

export function CalendarSettings() {
  const month = useCalendarStore((state) => state.month);
  const setMonth = useCalendarStore((state) => state.setMonth);
  const year = useCalendarStore((state) => state.year);
  const setYear = useCalendarStore((state) => state.setYear);
  const weekStart = useCalendarStore((state) => state.weekStart);
  const setWeekStart = useCalendarStore((state) => state.setWeekStart);
  const initialData = useCalendarStore((state) => state.initialData);

  const monthNames = initialData?.monthNames || [];
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
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger id="month" className="w-[180px]">
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
            <Button
              variant={weekStart === "sunday" ? "default" : "outline"}
              onClick={() => setWeekStart("sunday")}
              className="rounded-full"
            >
              Sun
            </Button>
            <Button
              variant={weekStart === "monday" ? "default" : "outline"}
              onClick={() => setWeekStart("monday")}
              className="rounded-full"
            >
              Mon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
