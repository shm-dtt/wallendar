import { CalendarWallpaperClient } from "@/components/wallpaper-client";
import { Header } from "@/components/layout/header";

export default function Create() {
  return (
    <main className="font-sans min-h-dvh">
      <div className="p-4 md:p-6">
        <Header />
        <div className="mt-2">
          <CalendarWallpaperClient />
        </div>
      </div>
    </main>
  );
}