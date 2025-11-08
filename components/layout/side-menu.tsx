import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";

export function SideMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="cursor-pointer">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px]" side="left">
        <SheetHeader>
          <SheetTitle className="text-xl font-sans">Wallendar</SheetTitle>
          <SheetDescription>
            Personalize any photo with a clean, legible monthly calendar.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-2 px-4 text-2xl font-bold font-sans">
          <Link href="/">Home</Link>
          <Link href="/create">Get Started</Link>
          <Link href="/community">Community</Link>
          <Link href="/sponsors">Sponsors</Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
