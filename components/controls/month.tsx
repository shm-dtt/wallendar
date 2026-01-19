import { useState, useEffect } from "react";
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
import { Calendar, Circle, Strikethrough } from "lucide-react";
import { HeaderFormat, useCalendarStore } from "@/lib/calendar-store";
import { monthNames, headerFormatOptions } from "@/lib/calendar-utils";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

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
    const setUseCustomDate = useCalendarStore(
        (state) => state.setUseCustomDate,
    );
    const customDay = useCalendarStore((state) => state.customDay);
    const setCustomDay = useCalendarStore((state) => state.setCustomDay);
    const showHighlight = useCalendarStore((state) => state.showHighlight);
    const setShowHighlight = useCalendarStore(
        (state) => state.setShowHighlight,
    );
    const showStrikethrough = useCalendarStore(
        (state) => state.showStrikethrough,
    );
    const setShowStrikethrough = useCalendarStore(
        (state) => state.setShowStrikethrough,
    );

    // Local state for input to allow empty value while typing
    const [localDay, setLocalDay] = useState("");

    // Sync local state with global state
    useEffect(() => {
        if (useCustomDate) {
            setLocalDay(customDay.toString());
        } else {
            // When disabled externally (e.g. by toggling off buttons), clear local state
            // unless we are currently typing (which is handled by handleDayChange/Blur)
            // Actually, if useCustomDate becomes false, we should probably clear the input visual
            // But we need to be careful not to fight with the user typing "1" -> "" -> "12"
            // The issue is if we clear it here, it might clear while typing if we toggle useCustomDate false transiently.
            // However, useCustomDate is the source of truth for "is the box shown".
            // If the box is shown, it has a value.
            // If the user clears the box, handleDayChange sets localDay="", but keeps useCustomDate=true (so box stays open).
            // If the user blurs, handleDayBlur sets useCustomDate=false.
        }
    }, [useCustomDate, customDay]);

    // Helper for max days
    const maxDays = new Date(year, (month || 0) + 1, 0).getDate();

    // Helper to get max days for a given month/year
    const getMaxDays = (m: number, y: number) =>
        new Date(y, m + 1, 0).getDate();

    // Clamp customDay when month changes
    const handleMonthChange = (newMonth: number) => {
        setMonth(newMonth);
        if (useCustomDate) {
            const newMaxDays = getMaxDays(newMonth, year);
            if (customDay > newMaxDays) {
                setCustomDay(newMaxDays);
            }
        }
    };

    // Clamp customDay when year changes
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newYear = Number(e.target.value || new Date().getFullYear());
        setYear(newYear);
        if (useCustomDate) {
            const newMaxDays = getMaxDays(month || 0, newYear);
            if (customDay > newMaxDays) {
                setCustomDay(newMaxDays);
            }
        }
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalDay(val);

        // Only update store if valid number
        const num = parseInt(val);
        if (!isNaN(num) && num >= 1 && num <= maxDays) {
            if (!useCustomDate) {
                // Auto-enable highlight if not already set when user manually enters a valid date
                setShowHighlight(true);
            }
            setUseCustomDate(true);
            setCustomDay(num);
        }
    };

    const handleDayBlur = () => {
        // If empty on blur, disable custom date AND effects
        if (localDay === "") {
            setUseCustomDate(false);
            setShowHighlight(false);
            setShowStrikethrough(false);
        } else {
            // Ensure formatting is correct
            const num = parseInt(localDay);
            if (!isNaN(num) && num >= 1 && num <= maxDays) {
                setLocalDay(num.toString());
            } else {
                // Revert to valid customDay if invalid garbage was left
                setLocalDay(customDay.toString());
            }
        }
    };

    // Calculate today's date for the tooltip
    const today = new Date();
    const formattedToday = today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    return (
        <div className="py-1">
            <div className="items-center gap-2 mb-3 hidden lg:flex">
                <Calendar className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-sm">Calendar</h2>
            </div>

            <div className="flex gap-6 flex-wrap">
                {/* Column 1: Month & Year */}
                <div className="space-y-1">
                    <Label htmlFor="month" className="text-sm">
                        Month & Year
                    </Label>
                    <ButtonGroup>
                        <Select
                            value={month !== null ? String(month) : ""}
                            onValueChange={(v) => handleMonthChange(Number(v))}
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
                            onChange={handleYearChange}
                            min={1900}
                            max={9999}
                            className="text-sm w-[84px]"
                        />
                    </ButtonGroup>
                </div>

                {/* Column 2: Start Week */}
                <div className="space-y-1">
                    <Label className="text-sm">Start week on</Label>
                    <ButtonGroup>
                        <Button
                            variant={
                                weekStart === "sunday" ? "default" : "outline"
                            }
                            onClick={() => setWeekStart("sunday")}
                            className="cursor-pointer"
                        >
                            Sun
                        </Button>
                        <Button
                            variant={
                                weekStart === "monday" ? "default" : "outline"
                            }
                            onClick={() => setWeekStart("monday")}
                            className="cursor-pointer"
                        >
                            Mon
                        </Button>
                    </ButtonGroup>
                </div>

                {/* Column 3: Format */}
                <div className="space-y-1">
                    <Label htmlFor="headerFormat" className="text-sm">
                        Format
                    </Label>
                    <Select
                        value={headerFormat || ""}
                        onValueChange={(v) =>
                            setHeaderFormat(v as HeaderFormat)
                        }
                    >
                        <SelectTrigger id="headerFormat" className="w-[128px]">
                            <SelectValue placeholder="Full" />
                        </SelectTrigger>
                        <SelectContent>
                            {headerFormatOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Column 4: Date Effect */}
                <div className="space-y-1">
                    <Label className="text-sm">Date Effects</Label>
                    <ButtonGroup>
                        <Button
                            variant={showHighlight ? "default" : "outline"}
                            onClick={() => {
                                const newState = !showHighlight;
                                setShowHighlight(newState);
                                if (newState) {
                                    // If turning on, ensure date input is visible
                                    if (!useCustomDate) {
                                        setUseCustomDate(true);
                                        setCustomDay(today.getDate());
                                    }
                                } else {
                                    // If turning off, and strikethrough is also off, hide date input
                                    if (!showStrikethrough) {
                                        setUseCustomDate(false);
                                    }
                                }
                            }}
                            title={
                                useCustomDate
                                    ? "Highlight custom date"
                                    : `Highlight current date (${formattedToday})`
                            }
                            className="px-3"
                        >
                            <Circle className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={showStrikethrough ? "default" : "outline"}
                            onClick={() => {
                                const newState = !showStrikethrough;
                                setShowStrikethrough(newState);
                                if (newState) {
                                    // If turning on, ensure date input is visible
                                    if (!useCustomDate) {
                                        setUseCustomDate(true);
                                        setCustomDay(today.getDate());
                                    }
                                } else {
                                    // If turning off, and highlight is also off, hide date input
                                    if (!showHighlight) {
                                        setUseCustomDate(false);
                                    }
                                }
                            }}
                            title="Strikethrough past dates"
                            className={cn(
                                "px-3",
                                !useCustomDate && "!rounded-r-md",
                            )}
                        >
                            <Strikethrough className="w-4 h-4" />
                        </Button>
                        <Input
                            id="day"
                            type="number"
                            placeholder="DD"
                            min={1}
                            max={maxDays}
                            value={useCustomDate ? localDay : ""}
                            onChange={handleDayChange}
                            onBlur={handleDayBlur}
                            className={cn(
                                "transition-all duration-300 ease-in-out overflow-hidden text-center",
                                useCustomDate
                                    ? "w-[64px] opacity-100"
                                    : "w-0 p-0 border-0 opacity-0 pointer-events-none",
                            )}
                        />
                    </ButtonGroup>
                </div>
            </div>
        </div>
    );
}
