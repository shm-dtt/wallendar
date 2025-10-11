import { CalendarSettings } from "./calendar-settings";
import { TypographySettings } from "./typography-settings";
import { BackgroundSettings } from "./background-settings";
import { JoystickSettings } from "./joystick-settings";

export function CalendarControls() {
  return (
    <div className="space-y-4 flex-2 lg:overflow-auto lg:max-h-[calc(100vh-8rem)] lg:pr-1">
      <CalendarSettings />
      <hr className="border-neutral-500" />
      <BackgroundSettings />
      <hr className="border-neutral-500" />
      <TypographySettings />
      <hr className="border-neutral-500" />
      <JoystickSettings />
    </div>
  );
}
