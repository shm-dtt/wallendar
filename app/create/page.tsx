import { CalendarWallpaperClient } from "@/components/calendar-wallpaper-client";
import { Header } from "@/components/landing-header";
import { getInitialData } from "@/lib/calendar-utils";

export default async function Create() {
  // Server-side data preparation
  const initialData = await getInitialData();

  return (
    <main className="font-sans min-h-dvh">
      <div className="p-4 md:p-6">
        <Header />
        <div className="mt-4">
          <CalendarWallpaperClient initialData={initialData} />
        </div>
      </div>
    </main>
  );
}
