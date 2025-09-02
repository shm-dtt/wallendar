"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"

interface CalendarSettingsProps {
  month: number
  setMonth: (month: number) => void
  year: number
  setYear: (year: number) => void
  weekStart: "sunday" | "monday"
  setWeekStart: (weekStart: "sunday" | "monday") => void
  monthNames: string[]
}

export function CalendarSettings({ 
  month, setMonth, year, setYear, weekStart, setWeekStart, monthNames 
}: CalendarSettingsProps) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-primary" />
        <h2 className="font-semibold">Calendar Settings</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
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
              onChange={(e) => setYear(Number(e.target.value || new Date().getFullYear()))}
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
  )
}