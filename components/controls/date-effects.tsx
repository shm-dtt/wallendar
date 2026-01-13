"use client";

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
	const setShowStrikethrough = useCalendarStore(
		(s) => s.setShowStrikethrough,
	);
	const showHighlight = useCalendarStore((s) => s.showHighlight);
	const setShowHighlight = useCalendarStore((s) => s.setShowHighlight);
	const useCustomDate = useCalendarStore((s) => s.useCustomDate);

	// Check if viewing current month
	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();
	const isCurrentMonth = month === currentMonth && year === currentYear;

	// Determine current value based on state
	let currentValue = "none"; // Fallback used internally, but "none" option is hidden
	if (showHighlight && showStrikethrough) currentValue = "both";
	else if (showHighlight) currentValue = "highlight";
	else if (showStrikethrough) currentValue = "strikethrough";

	// If conceptually "none" but we want to default to highlight for the UI placeholder:
	if (currentValue === "none" && useCustomDate) currentValue = "highlight";

	const handleValueChange = (val: string) => {
		switch (val) {
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

	const isEnabled = isCurrentMonth || useCustomDate;

	return (
		<div className="space-y-1">
			<Select
				value={currentValue}
				onValueChange={handleValueChange}
				disabled={!isEnabled}
			>
				<SelectTrigger id="date-effects" className="w-[105px]">
					<SelectValue placeholder="Effects" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="highlight">Highlight</SelectItem>
					<SelectItem value="strikethrough">Strikethrough</SelectItem>
					<SelectItem value="both">Both</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
