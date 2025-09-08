"use client";

import { CalendarSettings } from "./calendar-settings";
import { TypographySettings } from "./typography-settings";
import { BackgroundSettings } from "./background-settings";

export function CalendarControls() {
  return (
    <div className="space-y-4 flex-2">
      <CalendarSettings />
      <hr className="border-gray-200" />
      <BackgroundSettings />
      <hr className="border-gray-200" />
      <TypographySettings />
    </div>
  );
}
