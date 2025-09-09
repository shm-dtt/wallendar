import { CalendarWallpaperClient } from "@/components/calendar-wallpaper-client";
import { Header } from "@/components/landing-header";

export default function Create() {
  return (
    <main className="font-sans min-h-dvh">
      <div className="p-4 md:p-6">
        <Header />
        <div className="mt-4">
          <CalendarWallpaperClient />
        </div>
      </div>
    </main>
  );
}