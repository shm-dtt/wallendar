import { CalendarSettings } from "@/components/calendar-controls/calendar-settings";
import { TypographySettings } from "@/components/calendar-controls/typography-settings";
import { BackgroundSettings } from "@/components/calendar-controls/background-settings";
import { JoystickSettings } from "@/components/calendar-controls/joystick-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CaseSensitive, Move, Image } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
export function CalendarControls() {
  return (
    <>
      <ScrollArea className="hidden lg:block flex-2">
        <div className="max-h-[calc(100vh-8rem)] lg:pr-4">
          <CalendarSettings />
          <Separator className="my-4" />
          <BackgroundSettings />
          <Separator className="my-4" />
          <TypographySettings />
          <Separator className="my-4" />
          <JoystickSettings />
        </div>
      </ScrollArea>
      <div className="lg:hidden flex w-full flex-col gap-6 h-full">
        <Tabs defaultValue="calendar" className="w-full flex flex-col h-full">
          <TabsList className="w-full mt-auto">
            <TabsTrigger value="calendar">
              <Calendar />
            </TabsTrigger>
            <TabsTrigger value="background">
              <Image />
            </TabsTrigger>
            <TabsTrigger value="typography">
              <CaseSensitive />
            </TabsTrigger>
            <TabsTrigger value="position">
              <Move />
            </TabsTrigger>
          </TabsList>
          <div>
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
        </Tabs>
      </div>
    </>
  );
}
