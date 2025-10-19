import { CalendarSettings } from "./calendar-settings";
import { TypographySettings } from "./typography-settings";
import { BackgroundSettings } from "./background-settings";
import { JoystickSettings } from "./joystick-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CaseSensitive, Crosshair, Wallpaper } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"

export function CalendarControls() {
  return (
    <>
    <ScrollArea className="hidden lg:block flex-2">
      <div className="space-y-4 max-h-[calc(100vh-8rem)] lg:pr-4">
        <CalendarSettings />
        <hr className="border-neutral-500" />
        <BackgroundSettings />
        <hr className="border-neutral-500" />
        <TypographySettings />
        <hr className="border-neutral-500" />
        <JoystickSettings />
      </div>
    </ScrollArea>
      <div className="lg:hidden flex w-full flex-col gap-6 h-full">
        <Tabs defaultValue="calendar" className="w-full flex flex-col h-full">
          <div className="flex-1">
            <TabsContent value="calendar">
              <CalendarSettings />
            </TabsContent>
            <TabsContent value="background">
              <BackgroundSettings />
            </TabsContent>
            <TabsContent value="typography">
              <TypographySettings />
            </TabsContent>
            <TabsContent value="position">
              <JoystickSettings />
            </TabsContent>
          </div>
          <TabsList className="w-full mt-auto">
            <TabsTrigger value="calendar">
              <Calendar />
            </TabsTrigger>
            <TabsTrigger value="background">
              <Wallpaper />
            </TabsTrigger>
            <TabsTrigger value="typography">
              <CaseSensitive />
            </TabsTrigger>
            <TabsTrigger value="position">
              <Crosshair />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  );
}
