import { MonthSettings } from "@/components/controls/month";
import { TypographySettings } from "@/components/controls/typography";
import { BackgroundSettings } from "@/components/controls/background";
import { PositionSettings } from "@/components/controls/position";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CaseSensitive, Move, Image } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
export function CalendarControls() {
  return (
    <>
      <ScrollArea className="hidden lg:block flex-[1.7]">
        <div className="max-h-[calc(100vh-8rem)] lg:pr-4">
          <MonthSettings />
          <Separator className="my-4" />
          <BackgroundSettings />
          <Separator className="my-4" />
          <TypographySettings />
          <Separator className="my-4" />
          <PositionSettings />
        </div>
      </ScrollArea>
      <div className="lg:hidden flex w-full flex-col gap-6 h-full">
        <Tabs defaultValue="month" className="w-full flex flex-col h-full">
          <TabsList className="w-full mt-auto">
            <TabsTrigger value="month">
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
            <TabsContent value="month">
              <MonthSettings />
            </TabsContent>
            <TabsContent value="background">
              <BackgroundSettings />
            </TabsContent>
            <TabsContent value="typography">
              <TypographySettings />
            </TabsContent>
            <TabsContent value="position">
              <PositionSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
