import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { WallpaperCard } from "@/components/misc/wallpaper-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Instrument_Serif } from "next/font/google";
import { getCommunityWallpapers } from "@/lib/community-data";

export const revalidate = 60;

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

export default async function Community() {
  const { current, now } = await getCommunityWallpapers();
  const hasCurrent = current.length > 0;
  const monthName = now.toLocaleDateString(undefined, { month: "long" });

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

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/create">
            <Button variant="default" size="lg" className="cursor-pointer">
              Make Your Own
            </Button>
          </Link>
          <Link href="/community/archive">
            <Button variant="secondary" size="lg" className="cursor-pointer">
              Explore Archive
            </Button>
          </Link>
        </div>

        {/* Current Month */}
        <div className="space-y-4">
          {hasCurrent ? (
            <>
              <div className="flex flex-col gap-1 my-8">
                <h2 className="text-2xl font-semibold">
                  {monthName} {now.getFullYear()}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Wallpapers from the current month
                </p>
              </div>

              <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
                {current.map((wallpaper, index) => (
                  <WallpaperCard
                    key={wallpaper.id}
                    wallpaper={{
                      ...wallpaper,
                      createdAt: wallpaper.createdAt.toISOString(),
                    }}
                    priority={index < 2}
                  />
                ))}
              </div>
            </>
          ) : (
            <Empty className="text-center">
              <EmptyHeader>
                <EmptyTitle>No Wallpapers Yet</EmptyTitle>
                <EmptyDescription>
                  Be the first to share a wallpaper for {monthName}{" "}
                  {now.getFullYear()}!
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link href="/create">
                  <Button variant="default" className="cursor-pointer">Get Started</Button>
                </Link>
              </EmptyContent>
            </Empty>
          )}
        </div>
      </div>
    </main>
  );
}
