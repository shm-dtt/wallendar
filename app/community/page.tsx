import { Pickaxe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Header } from "@/components/layout/header";
import { Instrument_Serif } from "next/font/google";
import { WallpaperCard } from "@/components/wallpaper-card";
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
  let wallpapers: any[] = [];
  try {
    const wallpaperUpload = (prisma as any).wallpaperUpload;
    if (wallpaperUpload) {
      wallpapers = await wallpaperUpload.findMany({
        where: {
          month: currentMonth,
          year: currentYear,
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
    }
  } catch (error) {
    console.error("Failed to fetch wallpapers:", error);
  }

  const hasWallpapers = wallpapers.length > 0;
  const monthName = currentDate.toLocaleDateString(undefined, { month: "long" });

  return (
    <main className="font-sans">
      <div className="p-4 md:p-6 space-y-6">
        <Header />
        <div className="flex flex-col gap-3">
          <h1 className={`text-4xl font-semibold ${instrumentSerif.className}`}>
            Community Wallpapers
          </h1>
          <p className="text-muted-foreground">
            Browse wallpapers for <strong>{monthName} {currentYear}</strong> shared by the community or{" "}
            <Link href="/create" className="underline underline-offset-4">
              publish your own
            </Link>
            .
          </p>
        </div>

        {hasWallpapers ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 ">
            {wallpapers.map((wallpaper) => (
              <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Pickaxe />
              </EmptyMedia>
              <EmptyTitle className={`text-4xl ${instrumentSerif.className}`}>
                No Wallpapers Yet
              </EmptyTitle>
              <EmptyDescription>
                Be the first to share a wallpaper for {monthName} {currentYear}!
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-col gap-12">
                <p className="text-lg font-bold font-sans">Get started by creating your own</p>
                <Link href="/create">
                  <Button variant="default">Create Your Own</Button>
                </Link>
              </div>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </main>
  );
}
