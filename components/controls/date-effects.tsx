"use client";

import { Label } from "@/components/ui/label";
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Date Effects</h3>
        {!isCurrentMonth && (
          <p className="text-xs text-muted-foreground mt-1">
            Only available when viewing the current month
          </p>
        )}
      </div>

      {/* Highlight Today Checkbox */}
      <div className="space-y-1">
        <Label
          htmlFor="highlight-today"
          className="flex items-center gap-2 text-sm"
        >
          <input
            id="highlight-today"
            type="checkbox"
            checked={showHighlight}
            onChange={(e) => setShowHighlight(e.target.checked)}
            disabled={!isCurrentMonth}
            className="h-3 w-3 accent-primary"
          />
          <span className={!isCurrentMonth ? "text-muted-foreground" : ""}>
            Highlight Current Date
          </span>
        </Label>
      </div>

      {/* Strikethrough Past Dates Checkbox */}
      <div className="space-y-1">
        <Label
          htmlFor="strikethrough-past"
          className="flex items-center gap-2 text-sm"
        >
          <input
            id="strikethrough-past"
            type="checkbox"
            checked={showStrikethrough}
            onChange={(e) => setShowStrikethrough(e.target.checked)}
            disabled={!isCurrentMonth}
            className="h-3 w-3 accent-primary"
          />
          <span className={!isCurrentMonth ? "text-muted-foreground" : ""}>
            Strikethrough Past Dates
          </span>
        </Label>
      </div>
    </div>
  );
}
