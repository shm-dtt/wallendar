import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Header } from "@/components/layout/header";
import { Instrument_Serif } from "next/font/google";
import { WallpaperCard } from "@/components/misc/wallpaper-card";
import prisma from "@/lib/prisma";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

export default async function Community() {
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // Fetch wallpapers for current month
  let currentMonthWallpapers: any[] = [];
  // Fetch wallpapers for older months (archive)
  let archiveWallpapers: any[] = [];

  try {
    const wallpaperUpload = (prisma as any).wallpaperUpload;
    if (wallpaperUpload) {
      // Fetch current month wallpapers
      currentMonthWallpapers = await wallpaperUpload.findMany({
        where: {
          year: currentYear,
          month: currentMonth,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Fetch archive wallpapers (older months)
      archiveWallpapers = await wallpaperUpload.findMany({
        where: {
          OR: [
            { year: { lt: currentYear } },
            { year: currentYear, month: { lt: currentMonth } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
      });
    }
  } catch (error) {
    console.error("Failed to fetch wallpapers:", error);
  }

  const hasCurrentMonthWallpapers = currentMonthWallpapers.length > 0;
  const hasArchiveWallpapers = archiveWallpapers.length > 0;
  const monthName = currentDate.toLocaleDateString(undefined, {
    month: "long",
  });

  return (
    <main className="font-sans">
      <div className="p-4 md:p-6 space-y-8">
        <Header />
        <div className="flex flex-col gap-3 text-center">
          <h1 className={`text-4xl font-semibold ${instrumentSerif.className}`}>
            Community Wallpapers
          </h1>
          <p className="text-muted-foreground">
            Browse wallpapers shared by the community.
          </p>
        </div>

        {/* Current Month Section */}
        <div className="space-y-4 ">
          {hasCurrentMonthWallpapers ? (
            <>
              <div className="flex flex-col gap-1 my-8">
                <h2 className="text-2xl font-semibold">
                  {monthName} {currentYear}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Wallpapers from the current month
                </p>
              </div>
              <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
                {currentMonthWallpapers.map((wallpaper) => (
                  <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
                ))}
              </div>
            </>
          ) : (
            <Empty className="text-center">
              <EmptyHeader className="text-center">
                <EmptyTitle>No Wallpapers Yet</EmptyTitle>
                <EmptyDescription className="text-center">
                  Be the first to share a wallpaper for {monthName}{" "}
                  {currentYear}!
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="text-center">
                <div className="flex flex-col gap-6 items-center">
                  <Link href="/create">
                    <Button variant="default" className="mx-auto">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </EmptyContent>
            </Empty>
          )}
        </div>

        {/* Archive Section */}
        {hasArchiveWallpapers && (
          <div className="space-y-4 pt-8 border-t">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold">Archive</h2>
              <p className="text-sm text-muted-foreground">
                Wallpapers from previous months
              </p>
            </div>
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
              {archiveWallpapers.map((wallpaper) => (
                <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
